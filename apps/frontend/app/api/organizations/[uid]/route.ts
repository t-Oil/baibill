import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * GET handler for fetching organization details.
 * @param request NextRequest object
 * @param params Route params containing organization UID
 * @returns JSON response with organization details
 */
export async function GET(request: NextRequest, props: { params: Promise<{ uid: string }> }) {
  const params = await props.params;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ status: { code: 401, message: 'Unauthorized' } }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/api/organizations/${params.uid}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
