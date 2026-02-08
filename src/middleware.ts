
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Skip middleware for auth internal routes
    if (path.startsWith('/auth/callback') || path.startsWith('/api/auth/')) {
        return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect Admin Routes
    if (path.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        const ADMIN_EMAIL = 'ae132118@gmail.com'
        if (user.email !== ADMIN_EMAIL) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protect User Dashboard
    if (path.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
