import { Project } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

const primitiveSet = new Set(["Container", "Flex", "Grid", "Portal", "Stack", "View"]);
const baseComponentSet = new Set([
    "Badge", "Breadcrumbs", "Button", "Card", "Checkbox", "Divider", "Drawer",
    "FormField", "IconButton", "Input", "Label", "Modal", "Range", "SecurityNotice",
    "Select", "Skeleton", "Slider", "Spinner", "Switch", "Tabs", "Text", "TextArea",
    "Toast", "Tooltip"
]);

for (const sourceFile of project.getSourceFiles()) {
    let changed = false;

    // Find all imports
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
        const moduleSpecifier = imp.getModuleSpecifierValue();

        // Check if it imports from some variation of design/base or design/primitives incorrectly
        if (moduleSpecifier.includes("design/base") || moduleSpecifier.includes("design/primitives")) {
            const namedImports = imp.getNamedImports();
            if (namedImports.length > 0) {
                const isBarrel = moduleSpecifier.endsWith("design/base") || moduleSpecifier.endsWith("design/primitives") || moduleSpecifier.endsWith("design/baseComponents/Button"); // my previous hack

                if (isBarrel || namedImports.length > 1) {
                    // we need to break this import into multiple specific imports
                    const importMap = new Map(); // componentName -> new specifier

                    for (const named of namedImports) {
                        const name = named.getName();
                        let newPath = moduleSpecifier;

                        if (primitiveSet.has(name)) {
                            newPath = moduleSpecifier.substring(0, moduleSpecifier.indexOf("design/")) + "design/primitives/" + name;
                        } else if (baseComponentSet.has(name)) {
                            newPath = moduleSpecifier.substring(0, moduleSpecifier.indexOf("design/")) + "design/baseComponents/" + name;
                        } else if (name === "ArrowDownIcon") {
                            // Icons usually come from lucide-react in these templates, check fallback
                            newPath = "lucide-react";
                        }

                        if (!importMap.has(newPath)) importMap.set(newPath, []);
                        importMap.get(newPath).push(name);
                    }

                    // Remove old import
                    imp.remove();
                    changed = true;

                    // Add new specific imports
                    for (const [newPath, names] of importMap.entries()) {
                        sourceFile.addImportDeclaration({
                            namedImports: names,
                            moduleSpecifier: newPath,
                        });
                    }
                }
            }
        }
    }

    if (changed) {
        sourceFile.saveSync();
    }
}
