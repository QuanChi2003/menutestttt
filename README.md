# 🍃 Green Menu (Next.js 14 + Supabase) — Full Code & Steps

Web gọi món cho khách (tại bàn hoặc đặt ship) + trang quản trị thêm/xóa món.
Khi có đơn mới → gửi thông báo **Telegram**.

## 0) Yêu cầu
- Node.js 18+ (khuyến nghị 20+)
- pnpm hoặc npm
- Tài khoản Supabase + Vercel
- (Tuỳ chọn) Telegram Bot

## 1) Tạo Supabase Project
1. https://supabase.com → **New Project**
2. Vào **Settings → API** lấy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Tạo bảng & RLS Policy
**SQL** (SQL Editor → New query → Run):

```sql
create extension if not exists pgcrypto;

create table if not exists public.dishes(
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  price int not null,
  image_url text,
  category text,
  is_available boolean default true
);

create table if not exists public.orders(
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text check (type in ('dine-in','delivery')) not null,
  table_number text,
  customer_name text,
  phone text,
  address text,
  note text,
  total int not null,
  status text default 'new' check (status in ('new','preparing','done','cancelled'))
);

create table if not exists public.order_items(
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  dish_id text not null,
  qty int not null,
  price int not null
);

alter table public.dishes enable row level security;
create policy "read dishes" on public.dishes for select using (true);
create policy "insert dishes public" on public.dishes for insert with check (true);
create policy "update dishes admin" on public.dishes for update using (auth.role() = 'authenticated');
create policy "delete dishes admin" on public.dishes for delete using (auth.role() = 'authenticated');

alter table public.orders enable row level security;
create policy "insert orders" on public.orders for insert with check (true);
create policy "read orders auth" on public.orders for select using (auth.role() = 'authenticated');
create policy "update orders auth" on public.orders for update using (auth.role() = 'authenticated');

alter table public.order_items enable row level security;
create policy "insert items" on public.order_items for insert with check (true);
create policy "read items auth" on public.order_items for select using (auth.role() = 'authenticated');
```

*(Production nên siết policy theo user/role.)*

**Dữ liệu mẫu (tuỳ chọn)**:
```sql
insert into public.dishes (name, price, category, image_url)
values 
('Trà tắc', 15000, 'Đồ uống', 'https://images.unsplash.com/photo-1541976076758-347942db1970'),
('Cơm gà xé', 35000, 'Món chính', 'https://images.unsplash.com/photo-1570378164207-c63f20b1331d'),
('Bánh mì ốp la', 25000, 'Ăn sáng', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713');
```

## 3) Bật Realtime
- Enable Realtime (Project → Realtime) và thêm `public.orders`, `public.order_items` nếu cần.

## 4) Telegram Bot (tuỳ chọn nhưng nên có)
1. Nhắn @BotFather tạo bot → lấy `TELEGRAM_BOT_TOKEN`
2. Lấy `TELEGRAM_CHAT_ID` (ID cá nhân hoặc group)
3. Điền vào `.env.local`

## 5) Chạy local
```bash
pnpm i
cp .env.example .env.local
# điền NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (+ TELEGRAM_* nếu có)
pnpm dev
```
Mở http://localhost:3000

## 6) Deploy Vercel
1. Push code lên GitHub (đã có `.gitignore`, KHÔNG commit `.env.local`)
2. Vercel → New Project → Import repo
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `TELEGRAM_BOT_TOKEN` (optional)
   - `TELEGRAM_CHAT_ID` (optional)
4. Deploy → test order → nhận thông báo Telegram

## 7) Dùng thử
- **Trang chủ**: xem/lọc món, thêm giỏ
- **/cart**: chọn Tại bàn/Ship, điền thông tin → Đặt món
- **/admin**: quản lý món, xem đơn, đổi trạng thái
- Đơn mới → bot nhắn: mã đơn, chi tiết món, tổng tiền, ghi chú

## 8) Nâng cấp gợi ý
- Auth bảo vệ /admin (Supabase Auth + middleware)
- Upload ảnh lên Supabase Storage
- order_items tham chiếu UUID món
- Thống kê doanh thu

---

## Cấu trúc thư mục
```
app/
  api/orders/route.ts
  admin/
    dishes/page.tsx
    orders/page.tsx
    page.tsx
  cart/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  DishCard.tsx
lib/
  serverSupbase.ts
  supabaseClient.ts
  types.ts
public/
  bg-leaves.svg
.env.example
.gitignore
next.config.js
package.json
postcss.config.js
tailwind.config.js
tsconfig.json
README.md
```
