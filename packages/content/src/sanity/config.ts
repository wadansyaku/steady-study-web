import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from '../schemas';

export function createStudioConfig(
  projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo',
  dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
) {
  return defineConfig({
    name: 'default',
    title: 'AIYouMe CMS',
    projectId,
    dataset,
    basePath: '/cms',
    plugins: [structureTool(), visionTool()],
    schema: {
      types: schemaTypes,
    },
  });
}

export const studioConfig = createStudioConfig();
