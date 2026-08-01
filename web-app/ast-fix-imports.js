"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var project = new ts_morph_1.Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");
var primitiveSet = new Set(["Container", "Flex", "Grid", "Portal", "Stack", "View"]);
var baseComponentSet = new Set([
    "Badge", "Breadcrumbs", "Button", "Card", "Checkbox", "Divider", "Drawer",
    "FormField", "IconButton", "Input", "Label", "Modal", "Range", "SecurityNotice",
    "Select", "Skeleton", "Slider", "Spinner", "Switch", "Tabs", "Text", "TextArea",
    "Toast", "Tooltip"
]);
for (var _i = 0, _a = project.getSourceFiles(); _i < _a.length; _i++) {
    var sourceFile = _a[_i];
    var changed = false;
    // Find all imports
    var imports = sourceFile.getImportDeclarations();
    for (var _b = 0, imports_1 = imports; _b < imports_1.length; _b++) {
        var imp = imports_1[_b];
        var moduleSpecifier = imp.getModuleSpecifierValue();
        // Check if it imports from some variation of design/base or design/primitives incorrectly
        if (moduleSpecifier.includes("design/base") || moduleSpecifier.includes("design/primitives")) {
            var namedImports = imp.getNamedImports();
            if (namedImports.length > 0) {
                var isBarrel = moduleSpecifier.endsWith("design/base") || moduleSpecifier.endsWith("design/primitives") || moduleSpecifier.endsWith("design/baseComponents/Button"); // my previous hack
                if (isBarrel || namedImports.length > 1) {
                    // we need to break this import into multiple specific imports
                    var importMap = new Map(); // componentName -> new specifier
                    for (var _c = 0, namedImports_1 = namedImports; _c < namedImports_1.length; _c++) {
                        var named = namedImports_1[_c];
                        var name_1 = named.getName();
                        var newPath = moduleSpecifier;
                        if (primitiveSet.has(name_1)) {
                            newPath = moduleSpecifier.substring(0, moduleSpecifier.indexOf("design/")) + "design/primitives/" + name_1;
                        }
                        else if (baseComponentSet.has(name_1)) {
                            newPath = moduleSpecifier.substring(0, moduleSpecifier.indexOf("design/")) + "design/baseComponents/" + name_1;
                        }
                        else if (name_1 === "ArrowDownIcon") {
                            // Icons usually come from lucide-react in these templates, check fallback
                            newPath = "lucide-react";
                        }
                        if (!importMap.has(newPath))
                            importMap.set(newPath, []);
                        importMap.get(newPath).push(name_1);
                    }
                    // Remove old import
                    imp.remove();
                    changed = true;
                    // Add new specific imports
                    for (var _d = 0, _e = importMap.entries(); _d < _e.length; _d++) {
                        var _f = _e[_d], newPath = _f[0], names = _f[1];
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
