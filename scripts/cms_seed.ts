import { createClient } from '@sanity/client';
import { buildSeedDocuments } from '../packages/content/src/seed-data';

const apiVersion = '2026-03-11';

function getArgFlag(flag: string) {
  return process.argv.includes(flag);
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function main() {
  const dryRun = getArgFlag('--dry-run');
  const projectId = requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID');
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const documents = buildSeedDocuments();

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          projectId,
          dataset,
          count: documents.length,
          ids: documents.map((document) => document._id),
        },
        null,
        2
      )
    );
    return;
  }

  const token = requireEnv('SANITY_API_WRITE_TOKEN');
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  let transaction = client.transaction();
  for (const document of documents) {
    transaction = transaction.createOrReplace(document);
  }

  const result = await transaction.commit({ autoGenerateArrayKeys: true });
  console.log(
    JSON.stringify(
      {
        mode: 'write',
        projectId,
        dataset,
        count: documents.length,
        transactionId: result.transactionId,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
