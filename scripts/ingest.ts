import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local if it exists, then fallback to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config();


async function main() {
  console.log('Starting ingestion run...', new Date().toISOString());
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Ingestion might fail if RLS is enabled.');
  }

  // Dynamically import modules so they evaluate AFTER env vars are loaded
  const { ThaiWaterSource } = await import('../lib/water-sources/thaiwater');
  const { upsertStations, upsertReadings, pruneReadings } = await import('../lib/db/repository');

  try {
    const thaiWater = new ThaiWaterSource();

    console.log('Fetching stations from ThaiWater...');
    const stations = await thaiWater.fetchStations();
    console.log(`Found ${stations.length} stations.`);

    console.log('Upserting stations...');
    await upsertStations(stations);

    console.log('Fetching readings from ThaiWater...');
    const readings = await thaiWater.fetchReadings();
    console.log(`Found ${readings.length} readings.`);

    console.log('Upserting readings...');
    await upsertReadings(readings);

    console.log('Pruning readings older than 30 days...');
    await pruneReadings(30);

    console.log('Ingestion completed successfully.');
  } catch (error) {
    console.error('Ingestion failed:', error);
    process.exit(1);
  }
}

main();
