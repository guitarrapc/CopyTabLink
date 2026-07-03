import { describe, expect, it } from "vitest";
import enMessages from "../../public/_locales/en/messages.json";
import esMessages from "../../public/_locales/es/messages.json";
import frMessages from "../../public/_locales/fr/messages.json";
import jaMessages from "../../public/_locales/ja/messages.json";
import zhCNMessages from "../../public/_locales/zh_CN/messages.json";
import zhTWMessages from "../../public/_locales/zh_TW/messages.json";

describe("locale resources", () => {
  it("keeps all locale keys aligned with en keys", () => {
    const enKeys = Object.keys(enMessages).sort();
    expect(Object.keys(jaMessages).sort()).toEqual(enKeys);
    expect(Object.keys(esMessages).sort()).toEqual(enKeys);
    expect(Object.keys(frMessages).sort()).toEqual(enKeys);
    expect(Object.keys(zhCNMessages).sort()).toEqual(enKeys);
    expect(Object.keys(zhTWMessages).sort()).toEqual(enKeys);
  });

  it("contains japanese translations for user-facing toasts", () => {
    expect(jaMessages.toastCopySuccess.message).toBe("クリップボードにコピーしました");
    expect(jaMessages.toastCopyFailed.message).toBe("コピーに失敗しました");
  });

  it("contains spanish and french translations for user-facing toasts", () => {
    expect(esMessages.toastCopySuccess.message).toBe("Copiado al portapapeles");
    expect(esMessages.toastCopyFailed.message).toBe("No se pudo copiar");
    expect(frMessages.toastCopySuccess.message).toBe("Copié dans le presse-papiers");
    expect(frMessages.toastCopyFailed.message).toBe("Échec de la copie");
  });

  it("contains simplified and traditional chinese translations for user-facing toasts", () => {
    expect(zhCNMessages.toastCopySuccess.message).toBe("已复制到剪贴板");
    expect(zhCNMessages.toastCopyFailed.message).toBe("复制失败");
    expect(zhTWMessages.toastCopySuccess.message).toBe("已複製到剪貼簿");
    expect(zhTWMessages.toastCopyFailed.message).toBe("複製失敗");
  });
});
