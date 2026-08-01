import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('src');

files.forEach(file => {
    let text = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (text.includes('@/src/shared/utils/cn')) {
        // Calculate relative path to src/shared/utils/cn
        const depth = file.split('/').length - 2; // src/ is 1, so if src/features/foo.tsx -> length is 3. 3-2 = 1.
        let rel = depth === 0 ? './shared/utils/cn' : '../'.repeat(depth) + 'shared/utils/cn';
        
        text = text.replace(/@\/src\/shared\/utils\/cn/g, rel);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, text, 'utf8');
    }
});
