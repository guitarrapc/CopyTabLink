import type { PageInfo } from "../pageInfo";

function escapeMarkdownLabel(text: string): string {
  return text.replace(/[[\]\\]/g, "\\$&");
}

export function formatMarkdown(info: PageInfo): string {
  return `[${escapeMarkdownLabel(info.title)}](${info.url})`;
}
