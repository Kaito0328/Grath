import { Project } from "ts-morph";
import * as fs from 'fs';

const project = new Project({ skipAddingFilesFromTsConfig: true });
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

for (const sourceFile of project.getSourceFiles()) {
    let changed = false;
    let text = sourceFile.getFullText();

    // 1. Fix ArrowDownIcon path
    if (text.includes('design/baseComponents/ArrowDownIcon')) {
        text = text.replace(/import\s*\{\s*ArrowDownIcon\s*\}\s*from\s*"[^"]+design\/baseComponents\/ArrowDownIcon";/g, "import { ArrowDown } from 'lucide-react';\nconst ArrowDownIcon = ArrowDown;");
        changed = true;
    }

    if (text.includes('design/baseComponents/CalculatorIcon') || text.includes('design/baseComponents/FunctionSquareIcon')) {
        text = text.replace(/import\s*\{\s*(CalculatorIcon|FunctionSquareIcon)\s*\}\s*from\s*"[^"]+design\/baseComponents\/\1";/g, "import { Calculator as CalculatorIcon, FunctionSquare as FunctionSquareIcon } from 'lucide-react';");
        changed = true;
    }

    // 2. Fix isLoading -> loading
    if (text.includes('isLoading={')) {
        text = text.replace(/isLoading=\{/g, "loading={");
        changed = true;
    }

    // 3. Fix ViewProps picking up bad types
    if (sourceFile.getFilePath().includes('VariablePickerIconButton.tsx')) {
        if (text.includes('bgVariants={[')) {
            text = text.replace(/bgVariants=\{\[[^\]]+\]\}/g, "");
            changed = true;
        }
    }

    // 4. Quick patch for design/tokens/keys.ts if there are still syntax issues in the internal base components
    if (sourceFile.getFilePath().includes('design/tokens/keys.ts')) {
        if (!text.includes('export type ColorVariantKey')) {
            text += `\nexport type ColorVariantKey = 'hover' | 'active' | 'focus';\n`;
            text += `export type SpaceKey = 'base' | 'sm' | 'md' | 'lg' | 'xl' | 'none';\n`;
            text += `export type ColorKey = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'inherit' | 'white' | 'default';\n`;
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(sourceFile.getFilePath(), text);
    }
}
