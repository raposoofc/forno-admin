// middleware.ts (na raiz)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protege tudo, exceto assets internos do Next e favicon
export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || '';
  const pass = process.env.ADMIN_PASS || '';

  if (!user || !pass) {
    return new NextResponse('Admin bloqueado: credenciais não configuradas.', { status: 500 });
  }

  const auth = req.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');

  if (scheme === 'Basic' && encoded) {
    // Edge Runtime tem atob
    try {
      const decoded = atob(encoded);
      const sep = decoded.indexOf(':');
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (u === user && p === pass) {
        return NextResponse.next();
      }
    } catch {
      // segue para pedir autenticação
    }
  }

  return new NextResponse('Autenticação requerida', {
    status: 401,
    headers: {
      // Mostra o prompt nativo de usuário/senha
      'WWW-Authenticate': 'Basic realm="Forno Admin", charset="UTF-8"',
    },
  });
}
