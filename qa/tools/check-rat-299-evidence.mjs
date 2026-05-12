#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node qa/tools/check-rat-299-evidence.mjs <matrix-markdown-file>');
  process.exit(2);
}

const text = fs.readFileSync(file, 'utf8');
const lines = text.split('\n');
const rowLines = lines.filter((line) => line.trim().startsWith('| iOS') || line.trim().startsWith('| Android'));

if (rowLines.length !== 6) {
  console.error(`FAIL: expected 6 matrix rows, found ${rowLines.length}`);
  process.exit(1);
}

let failed = false;
for (const [idx, line] of rowLines.entries()) {
  const cols = line.split('|').map((c) => c.trim());
  const platform = cols[1] || '';
  const flowStep = cols[4] || '';
  const recording = cols[5] || '';
  const transcript = cols[6] || '';
  const verdict = (cols[7] || '').toUpperCase();
  const defect = cols[8] || '';

  const prefix = `Row ${idx + 1} (${platform} ${flowStep})`;

  if (!recording || recording === 'PENDING') {
    console.error(`FAIL: ${prefix} missing recording`);
    failed = true;
  }
  if (!transcript || transcript === 'PENDING') {
    console.error(`FAIL: ${prefix} missing transcript`);
    failed = true;
  }
  if (verdict !== 'PASS' && verdict !== 'FAIL') {
    console.error(`FAIL: ${prefix} verdict must be PASS or FAIL`);
    failed = true;
  }
  if (verdict === 'FAIL' && (!defect || defect === 'N/A' || defect === 'PENDING')) {
    console.error(`FAIL: ${prefix} requires defect ID when verdict is FAIL`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('PASS: RAT-299 evidence matrix completeness check succeeded.');
