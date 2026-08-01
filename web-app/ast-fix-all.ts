import { Project, SyntaxKind, type SourceFile, type JsxAttribute } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: true
});
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

function cleanImports(sourceFile: SourceFile) {
    let changed = false;
    for (const imp of sourceFile.getImportDeclarations()) {
        const namedImports = imp.getNamedImports();
        for (const named of namedImports) {
            const name = named.getName();
            if (name === "ColorKey" || name === "ColorVariantKey" || name === "SpaceKey" || name === "TextColorKey" || name === "HStack" || name === "VStack") {
                named.remove();
                changed = true;
            }
        }
        if (imp.getNamedImports().length === 0 && imp.getDefaultImport() == null && imp.getNamespaceImport() == null) {
            imp.remove();
            changed = true;
        }
    }
    return changed;
}

function cleanProps(sourceFile: SourceFile) {
    let changed = false;
    const elements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
    const selfClosing = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);

    for (const element of [...elements, ...selfClosing]) {
        const nameNode = element.getTagNameNode();
        const name = nameNode.getText();

        if (name === "Text" || name === "Badge") {
            const attr = element.getAttribute("size");
            if (attr) { attr.remove(); changed = true; }
            const wAttr = element.getAttribute("weight");
            if (wAttr) { wAttr.remove(); changed = true; }
            const colorAttr = element.getAttribute("color");
            if (colorAttr && colorAttr.getKind() === SyntaxKind.JsxAttribute) {
                const attr = colorAttr as JsxAttribute;
                const init = attr.getInitializer();
                if (init && (init.getText().includes('TextColorKey') || init.getText().includes('ColorKey'))) {
                    attr.setInitializer('"muted"');
                    changed = true;
                }
            }
            const asAttr = element.getAttribute("as");
            if (asAttr) { asAttr.remove(); changed = true; }
        }

        if (name === "Button" || name === "IconButton") {
            const attrsToRemove = ["border", "bg", "rounded", "shadow", "zIndex", "padding", "p", "colorVariant", "label"];
            for (const attrName of attrsToRemove) {
                const attr = element.getAttribute(attrName);
                if (attr) { attr.remove(); changed = true; }
            }
        }

        if (name === "View" || name === "Flex" || name === "Stack") {
            const attrsToRemove = ["justify", "align", "wrap"];
            for (const attrName of attrsToRemove) {
                const attr = element.getAttribute(attrName);
                if (attr) { attr.remove(); changed = true; }
            }
        }
    }
    return changed;
}

for (const sourceFile of project.getSourceFiles()) {
    let changed = cleanImports(sourceFile);
    changed = cleanProps(sourceFile) || changed;

    // quick string replacements for lingering enums
    let text = sourceFile.getFullText();
    if (text.includes("TextColorKey.") || text.includes("SpaceKey.") || text.includes("ColorKey.")) {
        text = text.replace(/TextColorKey\.[A-Za-z]+/g, '"muted"');
        text = text.replace(/SpaceKey\.[A-Za-z]+/g, '"sm"');
        text = text.replace(/ColorKey\.[A-Za-z]+/g, '"primary"');
        sourceFile.replaceWithText(text);
        changed = true;
    }

    if (changed) {
        sourceFile.saveSync();
    }
}
