import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage({
    searchParams,
}: {
    searchParams: Promise<{ code?: string; error?: string; error_description?: string }>
}) {
    const { code, error, error_description } = await searchParams

    if (error) {
        return redirect(`/login?error=auth_failed&reason=${encodeURIComponent(error_description || error)}`)
    }

    if (code) {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
            console.error('Auth callback server exchange error:', exchangeError.message)
            return redirect(`/login?error=callback_failed&reason=${encodeURIComponent(exchangeError.message)}`)
        }

        // Success - redirect to home
        return redirect('/')
    }

    // No code and no error? Missing code
    return redirect('/login?error=missing_code')
}
