export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { questionGenQueue } from '@/lib/queue/questionGenQueue';
import { startJob } from '@/lib/services/jobService';
import { toJobDTO, JobDTO } from '@/lib/dto/jobDTO';
import { requireSession } from '@/lib/auth/requireSession';
import { JobStartSchema } from '@/lib/validation/job';

export async function POST(req: NextRequest, { params }: { params: { ssscId: string } }) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const parsed = JobStartSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { runVersion } = parsed.data;
  const ssscId = parseInt(params.ssscId, 10);

  // Create JobLog via service
  const jobLogRaw = await startJob(ssscId, runVersion);
  const jobLog: JobDTO = toJobDTO(jobLogRaw);
  const jobId = `${ssscId}:${runVersion}`;

  // Enqueue job, handle Redis down
  try {
    await questionGenQueue.add(jobId, { ssscId, runVersion }, { jobId });
  } catch (e) {
    return NextResponse.json({ error: 'redis_unavailable' }, { status: 500 });
  }
  return NextResponse.json({ success: true, jobLog, jobId });
}
