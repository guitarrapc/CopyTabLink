import type { PageInfo } from "../pageInfo";

export function formatPlain(info: PageInfo): string {
  return `${info.title} ${info.url}`;
}
