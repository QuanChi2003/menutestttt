import './globals.css'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'   // 👈 import Toaster

export const metadata = {
  title: 'Beer Cầu Gẫy',
  description: 'Order at table or from anywhere'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header className="sticky top-0 z-30 backdrop-blur bg-leaf-100/70 border-b border-leaf-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-xl font-bold text-leaf-800">🍃 Beer Cầu Gẫy 🍺</div>
            <nav className="flex gap-3">
              <a className="btn !py-1.5" href="/cart">Giỏ hàng</a>
              <a className="btn !py-1.5" href="/admin">Quản trị</a>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>

        <footer className="text-center text-sm text-leaf-700 pb-8">
          © {new Date().getFullYear()} Beer Cầu Gẫy
        </footer>

        {/* 👇 chèn Toaster để hiện toast */}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
