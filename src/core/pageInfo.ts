export interface PageInfo {
  title: string;
  url: string;
}

export function normalizePageInfo(info: PageInfo): PageInfo {
  return {
    title: info.title.trim(),
    url: info.url.trim()
  };
}
