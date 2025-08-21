import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest, { params }: { params: { uploadId: string } }) {
  try {
    const token = await getToken({ req: request });

    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uploadId } = params;

    const response = await fetch(`${process.env.API_URL}/uploads/finalize/${uploadId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Failed to finalize upload' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Finalize upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
