import fs from 'fs';
import glob from 'glob';

// We don't have glob, so we'll just manually list the files that failed.
const files = [
  'src/features/algebraic/nav/AlgebraicMenu.tsx',
  'src/features/algebraic/ops/ComplexOperations.tsx',
  'src/features/algebraic/ops/RationalOperations.tsx',
  'src/shared/nav/AppMenu.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.match(/import.*\n"use client";/)) {
    content = content.replace(/(import.*)\n("use client";)/g, '$2\n$1');
    fs.writeFileSync(file, content);
  } else {
    // If it doesn't strictly match the regex, let's just do it manually by finding lines
    const lines = content.split('\n');
    const useClientIndex = lines.findIndex(l => l.includes('"use client"'));
    if (useClientIndex > 0) {
      lines.splice(useClientIndex, 1);
      lines.unshift('"use client";');
      fs.writeFileSync(file, lines.join('\n'));
    }
  }
});
