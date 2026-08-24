const { Client } = require('pg');

async function testConnection(port, mode) {
  console.log(`\nTesting port ${port} (${mode})...`);
  const client = new Client({
    connectionString: `postgresql://postgres.fepwzsjcjwamrnapwzie:1234sayanSayan@aws-0-ap-northeast-2.pooler.supabase.com:${port}/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log(`✅ Connected successfully on port ${port}!`);
    const res = await client.query('SELECT current_timestamp, version();');
    console.log(`Result:`, res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ Port ${port} failed:`, err.message);
    try { await client.end(); } catch {}
    return false;
  }
}

async function run() {
  await testConnection(6543, 'Transaction Pooler');
  await testConnection(5432, 'Session Pooler');
}

run();
