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
    const lines = text.split('\n');
    const useClientIdx = lines.findIndex(l => l.includes('"use client"'));
    
    // If "use client" exists but is not on the first line
    if (useClientIdx > 0) {
        // Remove it from its current position
        lines.splice(useClientIdx, 1);
        // Add to top
        lines.unshift('"use client";');
        fs.writeFileSync(file, lines.join('\n'));
    }
});
