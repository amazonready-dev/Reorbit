import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/unsubscribe')({
  validateSearch: searchSchema,
  component: UnsubscribePage,
})

type Status = 'loading' | 'valid' | 'already' | 'invalid' | 'success' | 'error' | 'submitting'

function UnsubscribePage() {
  const { token } = useSearch({ from: '/unsubscribe' })
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return setStatus('invalid')
        if (data.valid) return setStatus('valid')
        if (data.reason === 'already_unsubscribed') return setStatus('already')
        setStatus('invalid')
      })
      .catch(() => setStatus('error'))
  }, [token])

  const handleConfirm = async () => {
    if (!token) return
    setStatus('submitting')
    try {
      const res = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) setStatus('success')
      else if (data.reason === 'already_unsubscribed') setStatus('already')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-lg">
        <h1 className="text-2xl font-bold">Unsubscribe</h1>
        <div className="mt-4 text-sm text-muted-foreground">
          {status === 'loading' && <p>Validating your link…</p>}
          {status === 'invalid' && (
            <p>This unsubscribe link is invalid or has expired.</p>
          )}
          {status === 'error' && (
            <p>Something went wrong. Please try again later.</p>
          )}
          {status === 'already' && (
            <p>You're already unsubscribed. You won't receive further emails.</p>
          )}
          {status === 'success' && (
            <p>You've been unsubscribed. We won't email you again.</p>
          )}
          {(status === 'valid' || status === 'submitting') && (
            <>
              <p>Click below to confirm you want to stop receiving these emails.</p>
              <button
                onClick={handleConfirm}
                disabled={status === 'submitting'}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {status === 'submitting' ? 'Unsubscribing…' : 'Confirm unsubscribe'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
