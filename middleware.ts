import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protege todo o site admin com Basic Auth.
// Defina ADMIN_USER e ADMIN_PASS nas variáveis de ambiente da Vercel.

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || '';
  const pass = process.env.ADMIN_PASS || '';

  // Se não configurado, bloqueia por segurança
  if (!user || !pass) {
    return new NextResponse('Admin bloqueado: credenciais não configuradas.', { status: 500 });
  }

  const auth = req.headers.get('authorization') || '';
  // "Basic base64(user:pass)"
  const [scheme, encoded] = auth.split(' ');
  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString();
    const [u, p] = decoded.split(':');
    if (u === user && p === pass) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Autenticação requerida', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Forno Admin", charset="UTF-8"'
    }
  });
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)']
};
