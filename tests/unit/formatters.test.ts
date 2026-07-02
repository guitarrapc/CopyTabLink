import { describe, expect, it } from "vitest";
import { formatMarkdown } from "../../src/core/formatters/markdown";
import { formatPlain } from "../../src/core/formatters/plain";
import { normalizePageInfo } from "../../src/core/pageInfo";

describe("formatters", () => {
  it("formats plain text as two lines", () => {
    const text = formatPlain({
      title: "Example title",
      url: "https://example.com/path"
    });
    expect(text).toBe("Example title\nhttps://example.com/path");
  });

  it("formats markdown link", () => {
    const text = formatMarkdown({
      title: "Example [title]",
      url: "https://example.com/path"
    });
    expect(text).toBe("[Example \\[title\\]](https://example.com/path)");
  });

  it("normalizes page info with trimming", () => {
    const info = normalizePageInfo({
      title: "  padded title  ",
      url: "  https://example.com  "
    });
    expect(info).toEqual({
      title: "padded title",
      url: "https://example.com"
    });
  });
});
