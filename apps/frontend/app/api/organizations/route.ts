import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:4000';

/**
 * GET handler for organizations list proxy.
 * @param request Next.js request object
 * @returns Proxied response from backend API
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ status: { code: 401, message: 'Unauthorized' } }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/organizations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Organizations list proxy error:', error);
    return NextResponse.json(
      { status: { code: 500, message: 'Failed to connect to API server' } },
      { status: 500 },
    );
  }
}

/**
 * POST handler for creating organization proxy.
 * @param request Next.js request object
 * @returns Proxied response from backend API
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ status: { code: 401, message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Create organization proxy error:', error);
    return NextResponse.json(
      { status: { code: 500, message: 'Failed to connect to API server' } },
      { status: 500 },
    );
  }
}
