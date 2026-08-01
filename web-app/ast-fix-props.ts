import { Project, SyntaxKind, type JsxElement, type JsxAttribute } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

for (const sourceFile of project.getSourceFiles()) {
    let changed = false;

    // Replace <Stack gap="xs"> with <Stack gap="sm"> (xs is missing)
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    const jsxSelfClosingElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);

    for (const element of [...jsxElements, ...jsxSelfClosingElements]) {
        const opening = element.getKind() === SyntaxKind.JsxElement
            ? (element as JsxElement).getOpeningElement()
            : element;

        const name = opening.getTagNameNode().getText();
        if (name === "Stack" || name === "View" || name === "Flex" || name === "Container") {
            const gapAttr = opening.getAttribute("gap");
            if (gapAttr && gapAttr.getKind() === SyntaxKind.JsxAttribute) {
                const attr = gapAttr as JsxAttribute;
                const val = attr.getInitializer()?.getText();
                if (val === '"xs"' || val === '"xxl"' || val === '"none"') {
                    // Change to valid spacing key
                    attr.setInitializer('"sm"');
                    changed = true;
                }
            }
            const pAttr = opening.getAttribute("p");
            if (pAttr && pAttr.getKind() === SyntaxKind.JsxAttribute) {
                const attr = pAttr as JsxAttribute;
                const val = attr.getInitializer()?.getText();
                if (val === '"xs"' || val === '"xxl"') {
                    attr.setInitializer('"sm"');
                    changed = true;
                }
            }
        }

        // Remove undefined properties on base components
        if (name === "Button" || name === "IconButton") {
            const borderAttr = opening.getAttribute("border");
            if (borderAttr) { borderAttr.remove(); changed = true; }
            const bgAttr = opening.getAttribute("bg");
            if (bgAttr) { bgAttr.remove(); changed = true; }
        }
    }

    if (changed) {
        sourceFile.saveSync();
    }
}
