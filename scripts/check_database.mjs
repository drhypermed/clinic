import admin from 'firebase-admin';
import fs from 'node:fs';

const serviceAccountPath = 'service-account.json';
if (fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
  });
} else {
  admin.initializeApp({ projectId: 'gen-lang-client-0444130146' });
}

const db = admin.firestore();

async function checkDatabase() {
  console.log("Checking Firestore database for guideline books...");
  const snapshot = await db.collection('guideline_books').get();
  
  const booksBySchool = {};
  let totalBooks = 0;
  let totalChunks = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const school = data.school || 'Unknown';
    if (!booksBySchool[school]) {
      booksBySchool[school] = { count: 0, chunks: 0 };
    }
    booksBySchool[school].count += 1;
    booksBySchool[school].chunks += (data.chunkCount || 0);
    totalBooks++;
    totalChunks += (data.chunkCount || 0);
  });

  console.log("\n====== DATABASE REPORT ======");
  console.log(`Total Books: ${totalBooks}`);
  console.log(`Total Chunks: ${totalChunks}`);
  console.log("Breakdown by School:");
  for (const [school, stats] of Object.entries(booksBySchool)) {
    console.log(`- ${school}: ${stats.count} books, ${stats.chunks} text chunks`);
  }
  console.log("=============================\n");
}

checkDatabase().catch(console.error).finally(() => process.exit(0));
