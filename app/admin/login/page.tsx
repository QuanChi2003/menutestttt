'use client'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Login failed')
      }
      const next = new URLSearchParams(window.location.search).get('next') || '/admin'
      window.location.href = next
    } catch (err:any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto card p-6 mt-10">
      <h1 className="text-2xl font-semibold mb-4">Đăng nhập quản trị</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Tài khoản"
          value={username}
          onChange={e=>setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          className="border rounded px-3 py-2 w-full"
          placeholder="Mật khẩu"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="text-xs text-leaf-700 mt-3">Vui lòng đăng nhập để tiếp tục!</p>
    </div>
  )
}
