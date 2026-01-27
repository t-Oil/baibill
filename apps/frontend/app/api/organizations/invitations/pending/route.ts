import { NextRequest } from 'next/server';
import { authenticatedProxy } from '@/lib/api-proxy';

export async function GET(request: NextRequest) {
    return authenticatedProxy(request, '/api/organizations/invitations/pending');
}
