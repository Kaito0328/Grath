const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

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
    if (file.includes('Markdown.tsx')) {
        text = text.replace(/import \{ cn \} from "\.\.\/\.\.\/shared\/utils\/cn";/g, "import { cn } from \"../../shared/utils/cn\";");
        // Oh wait, cn is at src/shared/utils/cn.ts or does it not exist?
        // Let's create a stub if it doesn't exist or just use className
        // Since the error was 'モジュール '../../shared/utils/cn' またはそれに対応する型宣言が見つかりません。'
    }

    if (changed) {
        fs.writeFileSync(file, text, 'utf8');
    }
});
