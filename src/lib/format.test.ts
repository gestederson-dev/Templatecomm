import { describe, expect, it } from "vitest";
import { formatCEP, formatPhoneBR, whatsappLink } from "./format";

describe("formatos de contato", () => {
  it("telefone", () => {
    expect(formatPhoneBR("45991348838")).toBe("(45) 99134-8838");
    expect(formatPhoneBR("4532221111")).toBe("(45) 3222-1111");
    expect(formatPhoneBR("123")).toBe("123");
  });
  it("CEP", () => {
    expect(formatCEP("85825000")).toBe("85825-000");
    expect(formatCEP("85825-000")).toBe("85825-000");
  });
  it("WhatsApp", () => {
    expect(whatsappLink("(45) 99134-8838")).toBe("https://wa.me/5545991348838");
    expect(whatsappLink(null, "Olá & link")).toBe("https://wa.me/?text=Ol%C3%A1%20%26%20link");
  });
});
