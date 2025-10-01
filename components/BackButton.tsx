'use client'
import { useRouter } from 'next/navigation'

export default function BackButton({ label = '← Quay lại', fallback = '/' }: { label?: string; fallback?: string }) {
  const router = useRouter()

  function goBack() {
    // Nếu có history thì back, nếu không thì về fallback
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button onClick={goBack} className="btn">
      {label}
    </button>
  )
}
