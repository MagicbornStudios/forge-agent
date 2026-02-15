"use client";

import { cn } from "@forge/ui/lib/utils";
import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

/** Shiki theme using shadcn CSS variables. Inlined to avoid extra theme files. */
const SHADCN_THEME = {
  name: "shadcn",
  type: "dark" as const,
  colors: {
    "editor.background": "var(--card)",
    "editor.foreground": "var(--foreground)",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment", "string.comment"], settings: { foreground: "var(--text-tertiary)" } },
    { scope: ["constant", "entity.name.constant", "variable.other.constant", "variable.other.enummember", "variable.language"], settings: { foreground: "var(--status-info)" } },
    { scope: ["entity", "entity.name"], settings: { foreground: "var(--chart-2)" } },
    { scope: ["entity.name.tag"], settings: { foreground: "var(--status-success)" } },
    { scope: ["keyword", "storage", "storage.type"], settings: { foreground: "var(--border-active)" } },
    { scope: ["storage.modifier.package", "storage.modifier.import", "storage.type.java"], settings: { foreground: "var(--foreground)" } },
    { scope: ["string", "punctuation.definition.string", "string punctuation.section.embedded source"], settings: { foreground: "var(--status-success)" } },
    { scope: ["support", "support.constant", "support.variable", "meta.module-reference"], settings: { foreground: "var(--status-info)" } },
    { scope: ["meta.property-name"], settings: { foreground: "var(--chart-3)" } },
    { scope: ["variable", "variable.parameter.function", "variable.other"], settings: { foreground: "var(--foreground)" } },
    { scope: ["constant.numeric", "constant.character", "constant.language"], settings: { foreground: "var(--chart-5)" } },
    { scope: ["punctuation", "punctuation.definition", "meta.brace", "brackethighlighter.tag", "brackethighlighter.curly", "brackethighlighter.round", "brackethighlighter.square", "brackethighlighter.angle"], settings: { foreground: "var(--text-secondary)" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "var(--chart-4)" } },
    { scope: ["invalid.broken", "invalid.deprecated", "invalid.illegal", "invalid.unimplemented", "message.error"], settings: { foreground: "var(--status-error)" } },
    { scope: ["string variable"], settings: { foreground: "var(--status-info)" } },
    { scope: ["source.regexp", "string.regexp"], settings: { foreground: "var(--status-info)" } },
    { scope: ["markup.heading", "markup.heading entity.name", "meta.diff.header", "meta.separator", "meta.output"], settings: { foreground: "var(--status-info)" } },
    { scope: ["markup.quote"], settings: { foreground: "var(--status-success)" } },
    { scope: ["markup.inline.raw"], settings: { foreground: "var(--status-info)" } },
    { scope: ["constant.other.reference.link", "string.other.link"], settings: { foreground: "var(--status-info)" } },
  ],
};

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

/** Shiki lang -> Prettier parser. Unmapped langs skip formatting. */
const PRETTIER_PARSER_MAP: Record<string, string> = {
  ts: "babel-ts",
  tsx: "babel-ts",
  js: "babel",
  jsx: "babel",
  json: "json",
  json5: "json5",
  html: "html",
  css: "css",
  scss: "scss",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  markdown: "markdown",
};

async function formatWithPrettier(code: string, parser: string): Promise<string> {
  const prettier = await import("prettier/standalone");
  const pluginModules = await (async () => {
    if (parser === "babel" || parser === "babel-ts") {
      const [babel, estree] = await Promise.all([
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
      ]);
      return [babel, estree];
    }
    if (parser === "html") return [await import("prettier/plugins/html")];
    if (parser === "css" || parser === "scss") return [await import("prettier/plugins/postcss")];
    if (parser === "yaml") return [await import("prettier/plugins/yaml")];
    if (parser === "markdown") return [await import("prettier/plugins/markdown")];
    if (parser === "json" || parser === "json5") return [await import("prettier/plugins/estree")];
    return [];
  })();
  const plugins = pluginModules.map((m) => (m as { default?: unknown }).default ?? m);
  return prettier.format(code, { parser, plugins });
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  /** Shiki theme name or theme object. Default: shadcn (uses app theme vars) */
  theme?: string | typeof SHADCN_THEME;
  /** Format code with Prettier before highlighting. Default: true */
  format?: boolean;
  /** Show line numbers in the left gutter. Default: false */
  showLineNumbers?: boolean;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function injectLineNumbers(html: string): string {
  return html.replace(/(<code[^>]*>)([\s\S]*?)(<\/code>)/, (_match, open: string, content: string, close: string) => {
    const lines = content.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') {
      lines.pop();
    }

    const numbered = lines
      .map((line: string, index: number) => {
        const safeLine = line.length > 0 ? line : '&#8203;';
        return `<span class="code-line" style="display:grid;grid-template-columns:2.25rem minmax(0,1fr);column-gap:0.5rem;line-height:1.45;"><span class="line-number" style="user-select:none;text-align:right;color:var(--text-tertiary,#7a7a85);font-size:11px;opacity:0.85;padding-right:0.125rem;">${index + 1}</span><span class="line-content" style="display:block;min-width:0;line-height:inherit;">${safeLine}</span></span>`;
      })
      .join('');

    return `${open}${numbered}${close}`;
  });
}

function CodeBlockCode({
  code,
  language = "tsx",
  theme: themeProp,
  format = true,
  showLineNumbers = false,
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const theme = themeProp ?? SHADCN_THEME;

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>");
        return;
      }
      let codeToHighlight = code;
      if (format) {
        const parser = PRETTIER_PARSER_MAP[language];
        if (parser) {
          try {
            codeToHighlight = await formatWithPrettier(code, parser);
          } catch {
            // Parse error: keep raw code
          }
        }
      }
      const html = await codeToHtml(codeToHighlight, { lang: language, theme });
      setHighlightedHtml(showLineNumbers ? injectLineNumbers(html) : html);
    }
    highlight();
  }, [code, language, theme, format, showLineNumbers]);

  const classNames = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4",
    className,
  );

  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
