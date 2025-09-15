import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../_utils';

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Not logged in' }, { status: 401 });
  }
  return NextResponse.json({ success: true, user });
}
