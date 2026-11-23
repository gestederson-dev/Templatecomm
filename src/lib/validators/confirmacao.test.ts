import { describe, expect, it } from "vitest";
import { validateConfirmationInput, validateLogo } from "./confirmacao";

const PAGAMENTOS = ["pix", "cartao", "entrada"];

const base = {
  paymentChoice: "pix",
  wantsInvoice: "nao",
  contactName: "Maria Souza",
  contactPhone: "(45) 99999-1234",
  contactEmail: "Maria@Empresa.com.br",
};

const comNota = {
  ...base,
  wantsInvoice: "sim",
  document: "11.222.333/0001-81",
  cep: "85810-000",
  street: "Rua das Flores",
  number: "100",
  district: "Centro",
  city: "Cascavel",
  state: "pr",
};

describe("validateConfirmationInput", () => {
  it("sem nota: aceita só contato e descarta endereço/documento", () => {
    const r = validateConfirmationInput({ ...base, document: "123", cep: "1" }, PAGAMENTOS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.contactPhone).toBe("45999991234");
    expect(r.data.contactEmail).toBe("maria@empresa.com.br");
    expect(r.data.document).toBeNull();
    expect(r.data.cep).toBeNull();
  });

  it("com nota: exige e normaliza documento e endereço", () => {
    const r = validateConfirmationInput(comNota, PAGAMENTOS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.document).toBe("11222333000181");
    expect(r.data.cep).toBe("85810000");
    expect(r.data.state).toBe("PR");
  });

  it("com nota: recusa CNPJ inválido", () => {
    const r = validateConfirmationInput({ ...comNota, document: "11.222.333/0001-82" }, PAGAMENTOS);
    expect(r).toEqual({ ok: false, error: "CPF ou CNPJ inválido." });
  });

  it("com nota: recusa endereço sem número", () => {
    const r = validateConfirmationInput({ ...comNota, number: "" }, PAGAMENTOS);
    expect(r.ok).toBe(false);
  });

  it("recusa forma de pagamento que não está entre as oferecidas", () => {
    const r = validateConfirmationInput({ ...base, paymentChoice: "boleto" }, PAGAMENTOS);
    expect(r).toEqual({ ok: false, error: "Escolha a forma de pagamento." });
  });

  it("exige responder se quer nota", () => {
    const r = validateConfirmationInput({ ...base, wantsInvoice: "" }, PAGAMENTOS);
    expect(r.ok).toBe(false);
  });

  it("recusa telefone sem DDD", () => {
    const r = validateConfirmationInput({ ...base, contactPhone: "99999-1234" }, PAGAMENTOS);
    expect(r.ok).toBe(false);
  });
});

describe("validateLogo", () => {
  it("aceita formato de gráfica dentro do limite", () => {
    expect(validateLogo("Logo Compec.CDR", 2_000_000)).toBeNull();
  });
  it("recusa arquivo vazio, grande demais ou de formato estranho", () => {
    expect(validateLogo("logo.png", 0)).not.toBeNull();
    expect(validateLogo("logo.png", 9 * 1024 * 1024)).not.toBeNull();
    expect(validateLogo("logo.exe", 1000)).not.toBeNull();
  });
});
