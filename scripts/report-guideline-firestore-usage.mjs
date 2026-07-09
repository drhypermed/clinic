import fs from 'node:fs';
import { GoogleAuth } from 'google-auth-library';

const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0444130146';
const credentials = fs.existsSync('service-account.json')
  ? JSON.parse(fs.readFileSync('service-account.json', 'utf8'))
  : undefined;
const auth = new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/monitoring.read'],
});
const client = await auth.getClient();
const end = new Date();
const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

const fetchMetric = async (type, aligner, reducer) => {
  const params = new URLSearchParams();
  params.set('filter', `metric.type="${type}"`);
  params.set('interval.startTime', start.toISOString());
  params.set('interval.endTime', end.toISOString());
  params.set('aggregation.alignmentPeriod', '86400s');
  params.set('aggregation.perSeriesAligner', aligner);
  params.set('aggregation.crossSeriesReducer', reducer);
  params.set('view', 'FULL');
  params.set('pageSize', '10000');
  const response = await client.request({
    url: `https://monitoring.googleapis.com/v3/projects/${projectId}/timeSeries?${params}`,
  });
  return (response.data.timeSeries || [])
    .flatMap((series) => series.points || [])
    .map((point) => ({
      at: point.interval?.endTime || '',
      value: Number(point.value?.int64Value ?? point.value?.doubleValue ?? 0),
    }))
    .sort((a, b) => a.at.localeCompare(b.at));
};

const [storage, reads] = await Promise.all([
  fetchMetric(
    'firestore.googleapis.com/storage/data_and_index_storage_bytes',
    'ALIGN_MAX',
    'REDUCE_SUM',
  ),
  fetchMetric(
    'firestore.googleapis.com/document/read_count',
    'ALIGN_SUM',
    'REDUCE_SUM',
  ),
]);

const latestStorageBytes = storage.at(-1)?.value || 0;
const totalReads = reads.reduce((sum, point) => sum + point.value, 0);

console.log(JSON.stringify({
  projectId,
  periodStart: start.toISOString(),
  periodEnd: end.toISOString(),
  latestDataAndIndexStorageBytes: latestStorageBytes,
  latestDataAndIndexStorageGB: Number((latestStorageBytes / 1_000_000_000).toFixed(2)),
  documentReadsLast7Days: totalReads,
  dailyReads: reads,
}, null, 2));
