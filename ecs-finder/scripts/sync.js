import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { createRequire } from 'module';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

config(); // load .env

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const credentials = require('./credentials.json');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Form Responses 1';
const MOCK_FILE = resolve(__dirname, '../src/data/mockActivities.jsx');

// Convert any Google Drive sharing URL → direct image URL
function toDriveDirectUrl(raw) {
  if (!raw) return '';
  // Format: /file/d/FILE_ID/view
  const match1 = raw.match(/\/file\/d\/([^/]+)/);
  if (match1) return `https://drive.google.com/uc?export=view&id=${match1[1]}`;
  // Format: open?id=FILE_ID
  const match2 = raw.match(/[?&]id=([^&]+)/);
  if (match2) return `https://drive.google.com/uc?export=view&id=${match2[1]}`;
  return raw; // already a plain URL
}

function serializeActivity(act) {
  const tagsStr = act.tags
    .map(t => {
      const sub = t.subtopic ? `, subtopic: "${t.subtopic}"` : '';
      return `      { label: "${t.label}", type: "${t.type}"${sub} }`;
    })
    .join(',\n');

  const posStr = act.positions.map(p => `"${p}"`).join(', ');

  return `  {
    id: ${act.id},
    name: "${act.name}",
    image: "${act.image}",
    tags: [
${tagsStr}
    ],
    positions: [${posStr}],
    description: "${act.description.replace(/"/g, '\\"')}",
    location: "${act.location}",
    deadline: "${act.deadline}",
    link: "${act.link}"
  }`;
}

async function main() {
  // Auth
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
  });

  const [headers, ...rows] = res.data.values;

  // Find column indices by partial header match (robust to extra punctuation/description text)
  const col = (keyword) => headers.findIndex(h => h.trim().toLowerCase().includes(keyword.toLowerCase()));
  const iName      = col('Tên hoạt động');
  const iCategory  = col('Mô hình');
  const iTopic     = col('Chủ đề CHÍNH');
  const iSubtopic  = col('Chủ đề PHỤ');
  const iPositions = col('Vị trí tuyển');
  const iDesc      = col('Mô tả');
  const iLocation  = col('Địa điểm');
  const iDeadline  = col('Hạn đăng ký');
  const iLink      = col('Link bài đăng');
  const iImage     = col('hình ảnh đại diện');
  const iStatus    = col('Status');

  // Read existing file
  const fileText = readFileSync(MOCK_FILE, 'utf8');

  // Extract existing names for dedup
  const existingNames = new Set();
  for (const m of fileText.matchAll(/name:\s*["']([^"']+)["']/g)) {
    existingNames.add(m[1]);
  }

  // Find current max id
  let maxId = 0;
  for (const m of fileText.matchAll(/id:\s*(\d+)/g)) {
    maxId = Math.max(maxId, parseInt(m[1]));
  }

  // Filter approved rows
  const approved = rows.filter(r => (r[iStatus] || '').trim().toLowerCase() === 'approved');
  const newActivities = [];

  for (const row of approved) {
    const name = (row[iName] || '').trim();
    if (!name || existingNames.has(name)) continue; // skip dupes

    const category = (row[iCategory] || '').trim();
    const topic    = (row[iTopic]    || '').trim();
    const subtopic = (row[iSubtopic] || '').trim();
    const rawImage = (row[iImage]    || '').trim();

    const tags = [];
    if (category) tags.push({ label: category, type: 'category' });
    if (topic)    tags.push({ label: topic, type: 'topic', ...(subtopic ? { subtopic } : {}) });

    const positions = (row[iPositions] || '')
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    maxId++;
    newActivities.push({
      id: maxId,
      name,
      image: toDriveDirectUrl(rawImage),
      tags,
      positions,
      description: (row[iDesc]     || '').trim(),
      location:    (row[iLocation] || '').trim(),
      deadline:    (row[iDeadline] || '').trim(),
      link:        (row[iLink]     || '').trim(),
    });
  }

  if (newActivities.length === 0) {
    console.log('No new approved activities to sync.');
    return;
  }

  // Splice new entries before the closing ];
  const newEntries = newActivities.map(serializeActivity).join(',\n');
  const updated = fileText.replace(/(\s*\];)\s*$/, `,\n${newEntries}\n];\n`);
  writeFileSync(MOCK_FILE, updated, 'utf8');
  console.log(`Wrote ${newActivities.length} new activities to mockActivities.jsx`);

  // Git auto-push
  try {
    const cwd = resolve(__dirname, '../');
    execSync('git add src/data/mockActivities.jsx', { cwd, stdio: 'inherit' });
    execSync(
      `git commit -m "sync: add ${newActivities.length} approved activit${newActivities.length === 1 ? 'y' : 'ies'}"`,
      { cwd, stdio: 'inherit' }
    );
    execSync('git push', { cwd, stdio: 'inherit' });
    console.log('Pushed to remote.');
  } catch (e) {
    console.error('Git push failed:', e.message);
  }
}

main().catch(console.error);
