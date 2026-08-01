const fs = require('fs');
const path = require('path');
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

  const primitiveExports = ['Container', 'Flex', 'Grid', 'Portal', 'Stack', 'View'];
  // replace individual primitive imports gracefully
  for (const p of primitiveExports) {
      const regex = new RegExp(`import\\s*\\{\\s*([^}]+)\\s*\\}\\s*from\\s*"([^"]+)design/primitives(?:/[a-zA-Z]+)?";`, 'g');
      content = content.replace(regex, (match, imports, prefix) => {
         let out = "";
         let hasOthers = false;
         let others = [];
         
         const parts = imports.split(',').map(s => s.trim()).filter(Boolean);
         for (const comp of parts) {
             if (primitiveExports.includes(comp)) {
                 out += `import { ${comp} } from "${prefix}design/primitives/${comp}";\n`;
                 changed = true;
             } else if (comp === 'Text') {
                 out += `import { Text } from "${prefix}design/baseComponents/Text";\n`;
                 changed = true;
             } else {
                 hasOthers = true;
                 others.push(comp);
             }
         }
         if (hasOthers) return `import { ${others.join(', ')} } from "${prefix}design/baseComponents/Button";\n` + out; // hacky fallback
         return out;
      });
  }
  
  // also fix tokens keys SpaceKey -> literal strings
  content = content.replace(/SpaceKey\.([a-zA-Z0-9]+)/g, (match, key) => `"${key.toLowerCase()}"`);
  // fix remaining missing imports for Stack
  if (content.includes('<Stack') && !content.includes('import { Stack }')) {
     const up = file.split('src/')[1].split('/').length - 1;
     const prefix = '../'.repeat(up);
     content = `import { Stack } from "${prefix}design/primitives/Stack";\n` + content;
     changed = true;
  }
  if (content.includes('<Text') && !content.includes('import { Text }')) {
     const up = file.split('src/')[1].split('/').length - 1;
     const prefix = '../'.repeat(up);
     content = `import { Text } from "${prefix}design/baseComponents/Text";\n` + content;
     changed = true;
  }

  if (changed) {
      fs.writeFileSync(file, content);
  }
}
