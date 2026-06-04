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

async function checkEmbeddings() {
  console.log("Checking Firestore database for chunk embeddings...");
  
  const schoolsToCheck = ['NICE', 'GINA', 'KDIGO', 'ADA'];
  
  for (const school of schoolsToCheck) {
    const snapshot = await db.collection('guideline_chunk_search')
      .where('school', '==', school)
      .limit(10)
      .get();
      
    let hasEmbeddingCount = 0;
    let totalChecked = 0;
    
    snapshot.forEach(doc => {
      totalChecked++;
      const data = doc.data();
      if (data.embedding && Array.isArray(data.embedding) && data.embedding.length > 0) {
        hasEmbeddingCount++;
      }
    });
    
    console.log(`- ${school}: Checked ${totalChecked} chunks. ${hasEmbeddingCount} have embeddings.`);
  }
}

checkEmbeddings().catch(console.error).finally(() => process.exit(0));
