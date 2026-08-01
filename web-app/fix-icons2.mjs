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
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src');

files.forEach(file => {
    let text = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (text.includes('design/baseComponents/CopyIcon')) {
        text = text.replace(/import\s+{\s*CopyIcon\s*}\s*from\s*"[^"]+design\/baseComponents\/CopyIcon";/g, "import { Copy as CopyIcon } from 'lucide-react';");
        changed = true;
    }
    
    if (text.includes('design/baseComponents/SaveIcon')) {
        text = text.replace(/import\s+{\s*SaveIcon\s*}\s*from\s*"[^"]+design\/baseComponents\/SaveIcon";/g, "import { Save as SaveIcon } from 'lucide-react';");
        changed = true;
    }
    
    // Quick fix for NumberInput cn import error
    if (file.includes('Markdown.tsx') && text.includes('cn(')) {
        text = text.replace(/import\s*{\s*cn\s*}\s*from\s*"[^"]+";/g, "");
        text = text.replace(/cn\("markdown-body overflow-x-auto",\s*className\)/g, "((['markdown-body overflow-x-auto', className]).filter(Boolean).join(' '))");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, text, 'utf8');
    }
});
