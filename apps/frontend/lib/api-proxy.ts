import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export async function authenticatedProxy(
  request: NextRequest,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ status: { code: 401, message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    let body;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.json();
      } catch (e) {
        // Body might be empty or not JSON
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Proxy error for ${endpoint}:`, error);
    return NextResponse.json(
      { status: { code: 500, message: 'Failed to connect to API server' } },
      { status: 500 },
    );
  }
}
