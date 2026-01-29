import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * GET handler for fetching available organization roles.
 * @param request NextRequest object
 * @returns JSON response with roles list
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ status: { code: 401, message: 'Unauthorized' } }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/api/organizations/roles`, {
    headers: {
      Authorization: authHeader,
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
