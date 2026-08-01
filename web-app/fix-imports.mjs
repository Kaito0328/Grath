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
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(full, exts));
    } else if (exts.includes(path.extname(full))) {
      results.push(full);
    }
  }
  return results;
}

const files = findFiles(srcDir, ['.ts', '.tsx']);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix `import { x, y } from "...design/base"` to Button component path (placeholder for now, will map properly)
  // Reverting my previous sed disaster first
  content = content.replace(/import \{ ([^}]+) \} from "([^"]+)design\/baseComponents\/Button";/g, (match, imports, prefix) => {
     let out = "";
     for (const comp of imports.split(',').map(s => s.trim())) {
         if (!comp) continue;
         out += `import { ${comp} } from "${prefix}design/baseComponents/${comp}";\n`;
     }
     changed = true;
     return out;
  });

  // Also catch un-sedded ones
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+"([^"]+)design\/base";/g, (match, imports, prefix) => {
     let out = "";
     for (const comp of imports.split(',').map(s => s.trim())) {
         if (!comp) continue;
         out += `import { ${comp} } from "${prefix}design/baseComponents/${comp}";\n`;
     }
     changed = true;
     return out;
  });
  
  // Fix `import { Text } from "...design/primitives/Text"` => actually this one is already correct, but just in case
  
  if (changed) {
      fs.writeFileSync(file, content);
  }
}
