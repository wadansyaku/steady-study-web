import { handleLeadSubmission } from '@/lib/lead-route';

export async function POST(
  request: Request,
  context: { params: Promise<{ service: string }> }
) {
  const { service } = await context.params;
  return handleLeadSubmission(request, service);
}
