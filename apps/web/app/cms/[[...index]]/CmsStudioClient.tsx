'use client';

import { createStudioConfig } from '@aiyoume/content/sanity';
import { NextStudio } from 'next-sanity/studio';

export function CmsStudioClient({
  projectId,
  dataset,
}: {
  projectId: string;
  dataset: string;
}) {
  return <NextStudio config={createStudioConfig(projectId, dataset)} />;
}
