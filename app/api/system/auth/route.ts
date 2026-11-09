import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Verify against prompt credentials: admin@fobign.com / Admin@123
    if (email === 'admin@fobign.com' && password === 'Admin@123') {
      return NextResponse.json({
        success: true,
        admin: {
          id: 'adm_fobign_root',
          email: 'admin@fobign.com',
          role: 'superadmin',
          token: 'adm_jwt_token_secure_fobign_root_session',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
