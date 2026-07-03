import { describe, expect, it } from "vitest";
import enMessages from "../../public/_locales/en/messages.json";
import jaMessages from "../../public/_locales/ja/messages.json";

describe("locale resources", () => {
  it("keeps ja keys aligned with en keys", () => {
    const enKeys = Object.keys(enMessages).sort();
    const jaKeys = Object.keys(jaMessages).sort();
    expect(jaKeys).toEqual(enKeys);
  });

  it("contains japanese translations for user-facing toasts", () => {
    expect(jaMessages.toastCopySuccess.message).toBe("クリップボードにコピーしました");
    expect(jaMessages.toastCopyFailed.message).toBe("コピーに失敗しました");
  });
});
