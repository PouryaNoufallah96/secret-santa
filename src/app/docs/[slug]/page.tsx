import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import fs from "fs";
import path from "path";

import { Button } from "@/components/ui/button";

const validSlugs = [
  "getting-started",
  "creating-groups",
  "joining-groups",
  "the-draw",
  "wishlists",
  "messaging",
  "events",
  "ai-suggestions",
  "faq",
];

interface DocPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }));
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;

  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const filePath = path.join(process.cwd(), "docs", `${slug}.md`);

  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  // Parse markdown to HTML (simple conversion)
  const html = parseMarkdown(content);

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/docs" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Docs
          </Link>
        </Button>

        <article
          className="prose prose-slate dark:prose-invert max-w-none
            prose-headings:font-nunito prose-headings:font-bold
            prose-h1:text-3xl prose-h1:mb-4 prose-h1:text-christmas-red prose-h1:dark:text-christmas-gold
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-christmas-red/90 prose-h2:dark:text-christmas-gold/90
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-base prose-p:leading-7
            prose-li:text-base prose-li:leading-7
            prose-a:text-christmas-red prose-a:dark:text-christmas-gold prose-a:no-underline prose-a:hover:underline
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg
            prose-table:text-sm
            prose-th:bg-muted prose-th:px-4 prose-th:py-2
            prose-td:px-4 prose-td:py-2 prose-td:border-t
            prose-strong:text-foreground
            prose-blockquote:border-l-christmas-red prose-blockquote:dark:border-l-christmas-gold"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-12 pt-6 border-t">
          <Button variant="outline" asChild>
            <Link href="/docs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to all documentation
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Remove the title (first h1) since we show it separately
  html = html.replace(/^# .+\n+/, "");

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Tables
  html = html.replace(
    /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g,
    (_, header, body) => {
      const headers = header
        .split("|")
        .filter((h: string) => h.trim())
        .map((h: string) => `<th>${h.trim()}</th>`)
        .join("");
      const rows = body
        .trim()
        .split("\n")
        .map((row: string) => {
          const cells = row
            .split("|")
            .filter((c: string) => c.trim())
            .map((c: string) => `<td>${c.trim()}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    }
  );

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs (lines that aren't already wrapped)
  html = html
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (
        block.startsWith("<h") ||
        block.startsWith("<ul") ||
        block.startsWith("<ol") ||
        block.startsWith("<pre") ||
        block.startsWith("<table") ||
        block.startsWith("<blockquote")
      ) {
        return block;
      }
      if (block.includes("<li>") && !block.startsWith("<ul")) {
        return `<ul>${block}</ul>`;
      }
      return `<p>${block.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  // Clean up nested ul tags
  html = html.replace(/<ul><ul>/g, "<ul>");
  html = html.replace(/<\/ul><\/ul>/g, "</ul>");

  return html;
}
