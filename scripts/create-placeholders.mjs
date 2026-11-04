#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const items = ['venomous-staff', 'sea-tremor', 'ominous-premonition', 'cuirass-of-savagery', 'eye-of-phoenix', 'splendor', 'nightmarish-gaze', 'breakthrough-armor', 'shadow-blade', 'armor-piercing'];
const dir = path.join(process.cwd(), 'public', 'items');
fs.mkdirSync(dir, { recursive: true });
items.forEach(i => {
  fs.writeFileSync(path.join(dir, `${i}.webp`), Buffer.alloc(0));
});
console.log('Created placeholder .webp files for ' + items.length + ' items');