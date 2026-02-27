#!/usr/bin/env node

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import process from "node:process";
import { execSync } from "node:child_process";
import ts from "typescript";

const ROOT_GLOBS = [
  "apps/repo-studio",
  "apps/platform",
  "packages/shared",
  "packages/ui",
];

const interactiveNative = new Set(["button", "a", "input", "select", "textarea"]);
const forgeUIButtonLike = new Set([
  "Button",
  "Switch",
  "SidebarTrigger",
  "SidebarMenuButton",
  "CollapsibleTrigger",
  "PopoverTrigger",
  "DropdownMenuTrigger",
  "ContextMenuTrigger",
  "MenubarTrigger",
  "TabsTrigger",
  "DialogTrigger",
  "AlertDialogTrigger",
  "NavigationMenuTrigger",
  "SelectTrigger",
  "AccordionTrigger",
  "TooltipTrigger",
  "HoverCardTrigger",
  "SheetTrigger",
  "DrawerTrigger",
  "Toggle",
  "ToggleGroupItem",
  "RadioGroupItem",
  "Checkbox",
]);

function getJsxTagName(tagName) {
  if (!tagName) return null;
  if (ts.isIdentifier(tagName)) return tagName.text;
  if (ts.isPropertyAccessExpression(tagName)) return tagName.name.text;
  return tagName.getText();
}

function hasTruthyAsChild(attributes) {
  const props = attributes?.properties ?? [];
  for (const prop of props) {
    if (!ts.isJsxAttribute(prop)) continue;
    if (prop.name.text !== "asChild") continue;
    if (!prop.initializer) return true;
    if (ts.isJsxExpression(prop.initializer)) {
      const expr = prop.initializer.expression;
      if (!expr || expr.kind === ts.SyntaxKind.TrueKeyword) return true;
    }
  }
  return false;
}

function buildImportMap(sourceFile) {
  const map = new Map();
  sourceFile.statements.forEach((statement) => {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) return;
    const module = statement.moduleSpecifier.getText(sourceFile).slice(1, -1);
    const clause = statement.importClause;
    if (clause.name) {
      map.set(clause.name.text, { module, imported: "default" });
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      clause.namedBindings.elements.forEach((element) => {
        map.set(element.name.text, {
          module,
          imported: element.propertyName ? element.propertyName.text : element.name.text,
        });
      });
    }
  });
  return map;
}

function classifyElement(tagName, attributes, importMap) {
  const tag = getJsxTagName(tagName);
  if (!tag) return null;

  const isNative = tag === tag.toLowerCase();
  if (isNative) {
    if (tag === "button") return { kind: "buttonLike", name: "button" };
    if (tag === "a") return { kind: "anchorLike", name: "a" };
    if (interactiveNative.has(tag)) return { kind: "interactive", name: tag };
    return null;
  }

  const imported = importMap.get(tag);
  if (!imported) return null;
  if (hasTruthyAsChild(attributes)) return null;

  const isKnownButtonLike =
    (imported.module.startsWith("@forge/ui/") &&
      forgeUIButtonLike.has(imported.imported)) ||
    (imported.module === "@forge/shared" && imported.imported === "WorkspaceButton") ||
    (imported.module === "@forge/shared/components/workspace" &&
      imported.imported === "WorkspaceButton");

  if (isKnownButtonLike) return { kind: "buttonLike", name: tag };
  return null;
}

function listTsxFiles() {
  const targets = ROOT_GLOBS.filter((target) => existsSync(target)).join(" ");
  if (!targets) {
    throw new Error("No scan targets exist for hydration nesting doctor.");
  }
  const output = execSync(`rg --files ${targets} -g "*.tsx"`, {
    encoding: "utf8",
  });
  return output.split(/\r?\n/).filter(Boolean);
}

async function collectViolations(files) {
  const violations = [];

  for (const file of files) {
    const text = await fs.readFile(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const importMap = buildImportMap(sourceFile);
    const stack = [];

    const isForbiddenDescendant = (ancestor, current) => {
      if (!ancestor || !current) return false;
      if (ancestor.kind === "buttonLike") {
        return (
          current.kind === "buttonLike" ||
          current.kind === "anchorLike" ||
          current.kind === "interactive"
        );
      }
      if (ancestor.kind === "anchorLike") {
        return (
          current.kind === "buttonLike" ||
          current.kind === "anchorLike" ||
          current.kind === "interactive"
        );
      }
      return false;
    };

    const record = (node, current) => {
      const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      const ancestor = stack[stack.length - 1];
      violations.push({
        file,
        line: pos.line + 1,
        col: pos.character + 1,
        ancestor: ancestor.name,
        descendant: current.name,
      });
    };

    const visit = (node) => {
      if (ts.isJsxElement(node)) {
        const current = classifyElement(
          node.openingElement.tagName,
          node.openingElement.attributes,
          importMap,
        );
        const entersInteractiveWrapper =
          current?.kind === "buttonLike" || current?.kind === "anchorLike";

        if (current && stack.length > 0 && isForbiddenDescendant(stack[stack.length - 1], current)) {
          record(node.openingElement, current);
        }

        if (entersInteractiveWrapper) stack.push(current);
        node.children.forEach(visit);
        if (entersInteractiveWrapper) stack.pop();
        return;
      }

      if (ts.isJsxSelfClosingElement(node)) {
        const current = classifyElement(node.tagName, node.attributes, importMap);
        if (current && stack.length > 0 && isForbiddenDescendant(stack[stack.length - 1], current)) {
          record(node, current);
        }
        return;
      }

      if (ts.isJsxFragment(node)) {
        node.children.forEach(visit);
        return;
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return violations.sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col,
  );
}

async function main() {
  const files = listTsxFiles();
  const violations = await collectViolations(files);

  if (violations.length === 0) {
    console.log(
      "[hydration-doctor] PASS: no nested interactive descendants in button/anchor wrappers",
    );
    return;
  }

  console.error("[hydration-doctor] FAIL: found nested interactive descendants:");
  violations.forEach((v) => {
    console.error(
      `  - ${v.file}:${v.line}:${v.col} -> ${v.descendant} inside ${v.ancestor}`,
    );
  });
  process.exit(1);
}

main().catch((error) => {
  console.error("[hydration-doctor] Unhandled error:", error);
  process.exit(1);
});
