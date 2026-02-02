import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const ORG_HEADER = 'x-organization-id';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const authHeader = request.headers.get('Authorization');
    const cookieStore = await cookies();
    const orgUidFromCookie = cookieStore.get(ORG_HEADER)?.value;
    const orgUidFromHeader = request.headers.get(ORG_HEADER);
    const orgUid = orgUidFromHeader || orgUidFromCookie;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    if (orgUid) {
      headers[ORG_HEADER] = orgUid;
    }

    const response = await fetch(`${API_URL}/api/receipts/export?${queryString}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('Content-Disposition') || 'attachment';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Export proxy error:', error);
    return NextResponse.json(
      { status: { code: 500, message: 'Failed to connect to API server' } },
      { status: 500 },
    );
  }
}
