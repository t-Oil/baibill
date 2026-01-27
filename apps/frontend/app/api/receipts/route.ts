import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const ORG_HEADER = 'x-organization-id';

/**
 * GET handler for receipts list proxy.
 * @param request Next.js request object
 * @returns Proxied response from backend API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const authHeader = request.headers.get('Authorization');
    const cookieStore = await cookies();
    const orgUid = cookieStore.get(ORG_HEADER)?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    if (orgUid) {
      headers[ORG_HEADER] = orgUid;
    }

    const response = await fetch(`${API_URL}/api/receipts?${queryString}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Receipts list proxy error:', error);
    return NextResponse.json(
      { status: { code: 500, message: 'Failed to connect to API server' } },
      { status: 500 }
    );
  }
}

