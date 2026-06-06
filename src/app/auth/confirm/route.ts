import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Las cookies se manejan en la respuesta
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Copiar cookies de auth a la respuesta
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        response.cookies.set('sb-access-token', session.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
        });
      }
      return response;
    }
  }

  // Error o sin código, redirigir a login
  return NextResponse.redirect(`${origin}/login?error=No se pudo confirmar la sesión`);
}
