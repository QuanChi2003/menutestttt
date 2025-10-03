import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function fetchAll() {
  const sb = getAdminClient()
  const [d, w, m, y] = await Promise.all([
    sb.from('order_profit_daily').select('*').limit(30),
    sb.from('order_profit_weekly').select('*').limit(26),
    sb.from('order_profit_monthly').select('*').limit(24),
    sb.from('order_profit_yearly').select('*').limit(5),
  ])
  return { daily: d.data||[], weekly: w.data||[], monthly: m.data||[], yearly: y.data||[] }
}

export default async function StatsPage() {
  // chặn không cho khách vào (tùy cách bạn set cookie admin=1)
  const isAdmin = cookies().get('admin')?.value === '1'
  if (!isAdmin) return <div className="card p-4">Bạn không có quyền.</div>

  const { daily, weekly, monthly, yearly } = await fetchAll()

  const Block = ({title, rows, cols}:{title:string; rows:any[]; cols:(keyof any)[]}) => (
    <div className="card p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="overflow-auto">
        <table className="min-w-[560px] w-full border">
          <thead>
            <tr className="bg-leaf-100">
              {cols.map((c,i)=><th key={i} className="text-left p-2 border">{String(c).toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-t">
                {cols.map((c,j)=>{
                  const v = (r as any)[c]
                  const isNum = typeof v === 'number'
                  return <td key={j} className="p-2 border">{isNum ? (v as number).toLocaleString('vi-VN') : String(v)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Báo cáo lãi/lỗ</h1>
      <Block title="Theo ngày (30 gần nhất)"   rows={daily}  cols={['day','revenue','cost','profit']} />
      <Block title="Theo tuần (26 gần nhất)"   rows={weekly} cols={['iso_week','revenue','cost','profit']} />
      <Block title="Theo tháng (24 gần nhất)"  rows={monthly} cols={['month','revenue','cost','profit']} />
      <Block title="Theo năm (5 gần nhất)"     rows={yearly} cols={['year','revenue','cost','profit']} />
    </div>
  )
}
