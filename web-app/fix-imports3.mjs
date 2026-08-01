import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function findFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(findFiles(full, exts));
    } else if (exts.includes(path.extname(full))) {
      results.push(full);
    }
  }
  return results;
}

for (const file of findFiles(srcDir, ['.ts', '.tsx'])) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Remove broken token imports entirely
  content = content.replace(/import\s*\{\s*ColorKey(?:,\s*ColorVariantKey(?:,\s*SpaceKey,?)?)?\s*\}\s*from\s*"[^"]+design\/tokens\/keys";?\n?/g, "");
  content = content.replace(/import\s*\{\s*TextColorKey\s*\}\s*from\s*"[^"]+design\/tokens\/keys";?\n?/g, "");
  
  // Fix VStack and HStack that were imported from Button mistakenly by my first codemod
  content = content.replace(/import\s*\{\s*VStack,\s*HStack\s*\}\s*from\s*"[^"]+design\/baseComponents\/Button";/g, "");
  
  // Fix stray SpaceKey usage
  content = content.replace(/SpaceKey\.[a-zA-Z]+/g, '"sm"');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
