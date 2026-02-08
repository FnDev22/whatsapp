'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function getFragmentParams(): Record<string, string> {
    if (typeof window === 'undefined') return {}
    const hash = window.location.hash?.slice(1)
    if (!hash) return {}
    const out: Record<string, string> = {}
    for (const part of hash.split('&')) {
        const [k, v] = part.split('=')
        if (k && v) out[k] = decodeURIComponent(v)
    }
    return out
}

const EXCHANGE_TIMEOUT_MS = 20_000

export default function AuthCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
    const [slowHint, setSlowHint] = useState(false)
    const doneRef = useRef(false)

    useEffect(() => {
        const slowTimer = setTimeout(() => setSlowHint(true), 3000)
        return () => clearTimeout(slowTimer)
    }, [])

    useEffect(() => {
        if (doneRef.current) return
        let cancelled = false

        async function run() {
            const search = new URLSearchParams(window.location.search)
            const code = search.get('code')
            const errorParam = search.get('error')
            if (errorParam) {
                doneRef.current = true
                router.replace(`/login?error=auth_failed&reason=${encodeURIComponent(errorParam)}`)
                return
            }
            const fragment = getFragmentParams()
            const accessToken = fragment.access_token
            const refreshToken = fragment.refresh_token

            if (code) {
                doneRef.current = true
                const exchangePromise = supabase.auth.exchangeCodeForSession(code).then((r) => {
                    if (r.error) throw r.error
                })
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), EXCHANGE_TIMEOUT_MS)
                )
                try {
                    await Promise.race([exchangePromise, timeoutPromise])
                    if (cancelled) return
                    setStatus('ok')
                    fetch('/api/notify-login', { method: 'POST', credentials: 'include', keepalive: true }).catch(() => { })
                    window.location.href = '/'
                    return
                } catch (e) {
                    if (cancelled) return
                    const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Exchange gagal'
                    const isTimeout = msg === 'Timeout'
                    router.replace(
                        `/login?error=callback_failed&reason=${encodeURIComponent(isTimeout ? 'Timeout. Coba lagi.' : msg)}`
                    )
                    return
                }
            }

            if (accessToken && refreshToken) {
                doneRef.current = true
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                })
                if (cancelled) return
                if (!error) {
                    setStatus('ok')
                    fetch('/api/notify-login', { method: 'POST', credentials: 'include', keepalive: true }).catch(() => { })
                    window.location.href = '/'
                    return
                }
            }

            setStatus('error')
            doneRef.current = true
            router.replace('/login?error=missing_code')
        }

        run()
        return () => { cancelled = true }
    }, [router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">Menyelesaikan login...</p>
                        {slowHint && (
                            <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                                Biasanya 5–15 detik. Jika &gt;20 detik gagal, coba refresh lalu login lagi. Lambat sering karena koneksi ke Supabase (VPN/firewall bisa mempengaruhi).
                            </p>
                        )}
                    </>
                )}
                {status === 'ok' && (
                    <p className="text-sm text-muted-foreground">Login berhasil. Mengalihkan...</p>
                )}
                {status === 'error' && (
                    <p className="text-sm text-muted-foreground">Mengalihkan ke halaman login...</p>
                )}
            </div>
        </div>
    )
}
