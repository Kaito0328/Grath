import { Project, SyntaxKind } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

for (const sourceFile of project.getSourceFiles()) {
  let changed = false;
  
  const elements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
  const selfClosing = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
  
  for (const element of [...elements, ...selfClosing]) {
     const name = element.getTagNameNode().getText();
     
     if (name === "View" || name === "Card" || name === "Text") {
         const borderAttr = element.getAttribute("border");
         if (borderAttr && borderAttr.getKind() === SyntaxKind.JsxAttribute) {
             const init = borderAttr.getInitializer();
             if (init && init.getText().includes('default')) {
               borderAttr.setInitializer('"base"');
               changed = true;
             }
         }
     }
     
     if (name === "Text" || name === "Badge") {
         const colorAttr = element.getAttribute("color");
         if (colorAttr && colorAttr.getKind() === SyntaxKind.JsxAttribute) {
             const init = colorAttr.getInitializer();
             const val = init?.getText().replace(/['"]/g, '');
             if (val === 'sub' || val === 'muted') {
                 colorAttr.setInitializer('"muted"');
                 changed = true;
             } else if (val === 'primary' || val === 'secondary' || val === 'danger' || val === 'white' || val === 'inherit') {
                 colorAttr.setInitializer('"' + val + '"');
                 changed = true;
             }
         }
         
         const weightAttr = element.getAttribute("weight");
         if (weightAttr && weightAttr.getKind() === SyntaxKind.JsxAttribute) {
             const w = weightAttr.getInitializer()?.getText().replace(/['"]/g, '');
             if (w === 'bold' || w === 'semibold' || w === 'medium' || w === 'normal' || w === 'light') {
                // these are valid fontWeights, wait, Text might not have weight prop in design/
                // weightAttr.remove();
                // changed = true;
             }
         }
     }
     
     if (name === "Button" || name === "IconButton") {
         const attrsToRemove = ["border", "bg", "rounded", "shadow", "zIndex", "padding", "p", "colorVariant"];
         for (const attrName of attrsToRemove) {
             const attr = element.getAttribute(attrName);
             if (attr) { attr.remove(); changed = true; }
         }
     }
  }

  if (changed) {
    sourceFile.saveSync();
  }
}
