import { NextResponse } from 'next/server';

export async function GET() {
  // Automatic changelog parsing disabled - manual changelog management
  // Return empty entries to maintain API compatibility
  return NextResponse.json({ 
    success: true, 
    entries: [],
    message: 'Automatic changelog parsing disabled. Changelog managed manually.'
  });
}
