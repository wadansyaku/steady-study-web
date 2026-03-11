import { z } from 'zod';
import { getLeadDatabase, getServerEnv, hasLeadDatabase } from './env';
import { getBindings } from './runtime';

const leadServiceSchema = z.enum(['learning', 'studio', 'automation']);

export const leadSubmissionSchema = z.object({
  service: leadServiceSchema,
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  organization: z.string().trim().max(160).optional().or(z.literal('')),
  role: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(20).max(4000),
  consent: z.literal(true),
  sourcePath: z.string().trim().max(240).optional(),
  turnstileToken: z.string().trim().max(2048).optional(),
});

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;

type StoredLead = LeadSubmissionInput & {
  submissionId: string;
  status: 'received' | 'notification_skipped' | 'notification_failed';
  metaJson: string;
  createdAt: string;
};

const memorySubmissions: StoredLead[] = [];

function isMissingLeadTableError(error: unknown) {
  return error instanceof Error && error.message.includes('no such table: lead_');
}

export function verifyServiceKey(service: string) {
  return leadServiceSchema.parse(service);
}

export function resolveClientAddress(headers: Headers) {
  const cf = headers.get('cf-connecting-ip');
  if (cf) return cf;

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || '';

  return '';
}

export async function verifyTurnstile(token: string | undefined, clientIp: string) {
  const env = getServerEnv();
  if (!env.turnstileSecretKey) {
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, skipped: false, reason: 'missing_turnstile_token' };
  }

  const payload = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token,
  });

  if (clientIp) {
    payload.set('remoteip', clientIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: payload,
  });

  if (!response.ok) {
    return { ok: false, skipped: false, reason: 'turnstile_unreachable' };
  }

  const result = await response.json() as { success?: boolean };
  return result.success
    ? { ok: true, skipped: false }
    : { ok: false, skipped: false, reason: 'turnstile_failed' };
}

async function insertLeadEvent(
  db: D1Database,
  submissionId: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  await db
    .prepare(
      `INSERT INTO lead_events (
        submission_id,
        event_type,
        payload_json,
        created_at
      ) VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)`
    )
    .bind(submissionId, eventType, JSON.stringify(payload))
    .run();
}

export async function persistLeadSubmission(
  input: LeadSubmissionInput,
  meta: Record<string, unknown>
) {
  const submissionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const metaJson = JSON.stringify(meta);
  const bindings = getBindings();
  const db = getLeadDatabase();

  if (db && hasLeadDatabase(bindings)) {
    try {
      await db
        .prepare(
          `INSERT INTO lead_submissions (
            submission_id,
            service,
            name,
            email,
            organization,
            role,
            message,
            consent,
            source_path,
            status,
            meta_json,
            created_at,
            updated_at
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'received', ?10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
        .bind(
          submissionId,
          input.service,
          input.name,
          input.email,
          input.organization || '',
          input.role || '',
          input.message,
          1,
          input.sourcePath || '/contact',
          metaJson
        )
        .run();

      await insertLeadEvent(db, submissionId, 'received', meta);
    } catch (error) {
      if (!isMissingLeadTableError(error)) {
        throw error;
      }

      memorySubmissions.push({
        ...input,
        submissionId,
        status: 'received',
        metaJson,
        createdAt,
      });
    }
  } else {
    memorySubmissions.push({
      ...input,
      submissionId,
      status: 'received',
      metaJson,
      createdAt,
    });
  }

  return { submissionId, createdAt };
}

export async function sendLeadNotification(
  submissionId: string,
  input: LeadSubmissionInput,
  meta: Record<string, unknown>
) {
  const env = getServerEnv();
  const db = getLeadDatabase();
  const bindings = getBindings();

  if (!env.resendApiKey || !env.leadNotificationEmail || !env.resendFromEmail) {
    if (db && hasLeadDatabase(bindings)) {
      try {
        await insertLeadEvent(db, submissionId, 'notification_skipped', {
          reason: 'resend_not_configured',
        });
      } catch (error) {
        if (!isMissingLeadTableError(error)) {
          throw error;
        }
      }
    }
    return { ok: true, skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.resendFromEmail,
      to: [env.leadNotificationEmail],
      subject: `[AIYouMe] ${input.service} lead: ${input.name}`,
      text: [
        `submissionId: ${submissionId}`,
        `service: ${input.service}`,
        `name: ${input.name}`,
        `email: ${input.email}`,
        `organization: ${input.organization || '-'}`,
        `role: ${input.role || '-'}`,
        `sourcePath: ${input.sourcePath || '/contact'}`,
        '',
        input.message,
        '',
        JSON.stringify(meta, null, 2),
      ].join('\n'),
    }),
  });

  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (db && hasLeadDatabase(bindings)) {
    try {
      await insertLeadEvent(
        db,
        submissionId,
        response.ok ? 'notification_sent' : 'notification_failed',
        payload
      );
    } catch (error) {
      if (!isMissingLeadTableError(error)) {
        throw error;
      }
    }
  }

  return { ok: response.ok, skipped: false };
}

export function getMemorySubmissions() {
  return memorySubmissions;
}
