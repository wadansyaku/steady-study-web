import { NextResponse } from 'next/server';
import {
  leadSubmissionSchema,
  persistLeadSubmission,
  resolveClientAddress,
  sendLeadNotification,
  verifyServiceKey,
  verifyTurnstile,
} from '@/lib/leads';

export async function handleLeadSubmission(request: Request, serviceParam: string) {
  const service = verifyServiceKey(serviceParam);
  if (!service) {
    return NextResponse.json(
      { ok: false, message: 'Unknown service.' },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Invalid JSON payload.' },
      { status: 400 }
    );
  }

  const parsed = leadSubmissionSchema.safeParse({
    ...(typeof body === 'object' && body !== null ? body : {}),
    service,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: '入力内容を確認してください。', issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const clientIp = resolveClientAddress(request.headers);
  const turnstile = await verifyTurnstile(parsed.data.turnstileToken, clientIp);
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, message: 'bot 対策の確認に失敗しました。時間をおいて再度お試しください。' },
      { status: 400 }
    );
  }

  const meta = {
    clientIp,
    userAgent: request.headers.get('user-agent') || '',
    referer: request.headers.get('referer') || '',
    receivedAt: new Date().toISOString(),
  };

  const { submissionId } = await persistLeadSubmission(parsed.data, meta);
  await sendLeadNotification(submissionId, parsed.data, meta);

  return NextResponse.json({ ok: true, submissionId });
}
