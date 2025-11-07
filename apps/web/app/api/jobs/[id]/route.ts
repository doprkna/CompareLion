export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getJobLog } from '@/lib/services/jobService';
import { toJobDTO, JobDTO } from '@/lib/dto/jobDTO';
import { requireSession } from '@/lib/auth/requireSession';
import { safeAsync, notFoundError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const jobLogRaw = await getJobLog(params.id);
  if (!jobLogRaw) {
    return notFoundError('Job');
  }
  const jobLog: JobDTO = toJobDTO(jobLogRaw);
  return NextResponse.json({ success: true, jobLog, timestamp: new Date().toISOString() });
});
