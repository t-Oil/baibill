import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const ORG_HEADER = 'x-organization-id';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = request.headers.get('Authorization');
    const cookieStore = await cookies();
    const orgUid = cookieStore.get(ORG_HEADER)?.value;

    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = token;
    }

    if (orgUid) {
      headers[ORG_HEADER] = orgUid;
    }

    const response = await fetch(`${API_URL}/api/receipts/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json(
      { status: { code: 500, message: 'Failed to connect to API server' } },
      { status: 500 },
    );
  }
}
