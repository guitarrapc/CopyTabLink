import { describe, expect, it } from "vitest";
import enMessages from "../../public/_locales/en/messages.json";
import esMessages from "../../public/_locales/es/messages.json";
import frMessages from "../../public/_locales/fr/messages.json";
import jaMessages from "../../public/_locales/ja/messages.json";

describe("locale resources", () => {
  it("keeps all locale keys aligned with en keys", () => {
    const enKeys = Object.keys(enMessages).sort();
    expect(Object.keys(jaMessages).sort()).toEqual(enKeys);
    expect(Object.keys(esMessages).sort()).toEqual(enKeys);
    expect(Object.keys(frMessages).sort()).toEqual(enKeys);
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
});
