// app/api/orders/route.ts
import { NextRequest, NextResponse, unstable_after as after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge' // nhanh, ít cold start

// Supabase client (ưu tiên service role để bypass RLS trong route server)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// --- GỬI TELEGRAM: song song + timeout + retry ---
async function sendTelegramOnce(
  token: string,
  chat_id: string | number,
  text: string
) {
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 5000) // 5s
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // keepalive để tiếp tục ngay cả khi response API đã trả xong
      body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' }),
      signal: ctrl.signal,
      // @ts-expect-error Edge hỗ trợ, TS không biết
      keepalive: true,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const groupId = process.env.TELEGRAM_CHAT_ID
  const userId = process.env.TELEGRAM_USER_ID
  if (!token) return

  const targets = [groupId, userId].filter(Boolean) as (string | number)[]
  if (!targets.length) return

  const attempt = async () =>
    await Promise.allSettled(
      targets.map((cid) => sendTelegramOnce(token, cid, text))
    )

  try {
    await attempt()
  } catch {
    await new Promise((r) => setTimeout(r, 1000)) // retry nhẹ
    await attempt()
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const { type, form, cart } = await req.json()

  if (!cart?.length) {
    return new NextResponse('Cart empty', { status: 400 })
  }

  // Tính tổng
  const total = cart.reduce(
    (s: number, i: any) => s + i.price * i.qty,
    0
  )

  // 1) Tạo order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      type,
      table_number: type === 'dine-in' ? form.table_number : null,
      customer_name: type === 'delivery' ? form.customer_name : null,
      phone: type === 'delivery' ? form.phone : null,
      address: type === 'delivery' ? form.address : null,
      note: form.note || null,
      total,
      status: 'new',
    })
    .select('*')
    .single()

  if (error || !order) {
    return new NextResponse(error?.message || 'Insert order failed', {
      status: 500,
    })
  }

  // 2) Lưu items
  const items = cart.map((i: any) => ({
    order_id: order.id,
    dish_id: i.name, // demo: đang lưu tên món; có thể đổi sang UUID món nếu bạn muốn
    qty: i.qty,
    price: i.price,
  }))

  const { error: e2 } = await supabase.from('order_items').insert(items)
  if (e2) {
    return new NextResponse(e2.message, { status: 500 })
  }

  // 3) Soạn thông báo
  const lines = [
    `✅ <b>Đơn mới</b> #${order.id.slice(0, 6)}`,
    type === 'dine-in'
      ? `• Bàn: ${order.table_number}`
      : `• Ship: ${order.customer_name} (${order.phone})\n${order.address}`,
    ...items.map(
      (i) =>
        `• ${i.qty} × ${i.dish_id} — ${(i.price * i.qty).toLocaleString(
          'vi-VN'
        )}đ`
    ),
    `Tổng: <b>${order.total.toLocaleString('vi-VN')}đ</b>`,
    order.note ? `Ghi chú: ${order.note}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  // 4) Gửi Telegram HẬU KỲ, không chặn phản hồi cho khách
  after(async () => {
    await notifyTelegram(lines)
  })

  // 5) Trả về OK ngay
  return NextResponse.json({ ok: true, order_id: order.id })
}
