import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest, props: { params: Promise<{ uid: string }> }) {
  const params = await props.params;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ status: { code: 401, message: 'Unauthorized' } }, { status: 401 });
  }

  const body = await request.json();
  const response = await fetch(`${API_URL}/api/organizations/${params.uid}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
