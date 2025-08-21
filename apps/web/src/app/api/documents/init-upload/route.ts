import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${process.env.API_URL}/uploads/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Failed to init upload' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Init upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
