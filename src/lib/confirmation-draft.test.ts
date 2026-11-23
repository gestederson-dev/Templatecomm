import { describe, expect, it } from "vitest";
import { buildPaymentOptions, cardTotal, isAllowedImageUrl, paymentConfigFromOptions, validateDraft } from "./confirmation-draft";

const SUPA = "https://abc.supabase.co";
const base = {
  customer_label: "Compec",
  items: [
    {
      name: "Copo Térmico 473 ml",
      description: "Com tampa",
      quantity: 130,
      unit_price: 25.9,
      image_url: "/confirmacoes/copo-termico-473.jpg",
    },
  ],
  payment: {
    pix: true,
    card: true,
    cardInstallments: 5,
    cardRate: 7.57,
    entrada: true,
  },
  notes: "Frete a combinar.",
};

describe("cardTotal", () => {
  it("segue a conta da maquininha", () => {
    expect(cardTotal(1995, 7.57)).toBe(2158.39);
    expect(cardTotal(3497, 7.57)).toBe(3783.4);
    expect(cardTotal(3367, 7.57)).toBe(3642.76);
  });
});

describe("buildPaymentOptions", () => {
  it("monta as três opções da Compec", () => {
    const options = buildPaymentOptions(3367, base.payment);
    expect(options.map((o) => [o.id, o.amount])).toEqual([
      ["pix", 3367],
      ["cartao", 3642.76],
      ["entrada", 1683.5],
    ]);
    expect(options[1].label).toBe("Cartão de crédito em até 5x");
    expect(options[1].note).toMatch(/5x de R\$\s728,55/);
    expect(options[2].note).toMatch(/1\.683,50 agora e R\$\s1\.683,50 na entrega/);
  });

  it("entrada com centavo ímpar fecha o total", () => {
    const [entrada] = buildPaymentOptions(100.01, {
      ...base.payment,
      pix: false,
      card: false,
    });
    const rest = Number(entrada.note!.match(/e R\$\s([\d,]+) na entrega/)![1].replace(",", "."));
    expect(Math.round((entrada.amount + rest) * 100) / 100).toBe(100.01);
  });

  it("cartão em 1x não tem nota de parcelas", () => {
    const [card] = buildPaymentOptions(100, {
      ...base.payment,
      pix: false,
      entrada: false,
      cardInstallments: 1,
    });
    expect(card.label).toBe("Cartão de crédito à vista");
    expect(card.note).toBeUndefined();
  });
});

describe("paymentConfigFromOptions", () => {
  it("recupera parcelas e taxa de uma confirmação salva", () => {
    const config = paymentConfigFromOptions(3367, buildPaymentOptions(3367, base.payment));
    expect(config).toEqual({
      pix: true,
      card: true,
      cardInstallments: 5,
      cardRate: 7.57,
      entrada: true,
    });
  });
});

describe("isAllowedImageUrl", () => {
  it("aceita /public e Storage público do projeto", () => {
    expect(isAllowedImageUrl("/confirmacoes/copo.jpg", SUPA)).toBe(true);
    expect(isAllowedImageUrl(`${SUPA}/storage/v1/object/public/product-images/x.jpg`, SUPA)).toBe(true);
  });
  it("recusa outros endereços", () => {
    expect(isAllowedImageUrl("https://evil.com/x.jpg", SUPA)).toBe(false);
    expect(isAllowedImageUrl("/../segredo.jpg", SUPA)).toBe(false);
    expect(isAllowedImageUrl("javascript:alert(1)", SUPA)).toBe(false);
  });
});

describe("validateDraft", () => {
  it("aceita a Compec e calcula os valores no servidor", () => {
    const result = validateDraft(base, SUPA);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.items[0].unit_price).toBe(25.9);
      expect(result.value.payment_options[1].amount).toBe(3642.76);
    }
  });

  it.each([
    [{ ...base, customer_label: " " }, "nome do cliente"],
    [{ ...base, items: [] }, "ao menos um produto"],
    [{ ...base, items: [{ ...base.items[0], quantity: 1.5 }] }, "Quantidade"],
    [{ ...base, items: [{ ...base.items[0], unit_price: 0 }] }, "Preço"],
    [
      {
        ...base,
        items: [{ ...base.items[0], image_url: "https://evil.com/a.jpg" }],
      },
      "foto",
    ],
    [
      {
        ...base,
        payment: { ...base.payment, pix: false, card: false, entrada: false },
      },
      "forma de pagamento",
    ],
    [{ ...base, payment: { ...base.payment, cardInstallments: 13 } }, "Parcelas"],
  ])("recusa entrada inválida (%#)", (input, message) => {
    const result = validateDraft(input, SUPA);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(message);
  });

  it("observação vazia vira null", () => {
    const result = validateDraft({ ...base, notes: "  " }, SUPA);
    expect(result.ok && result.value.notes).toBe(null);
  });
});

describe("ligação com pedido e orçamento", () => {
  const order = "3f1c2b9a-1111-4222-8333-944455556666";
  it("leva order_id, quote_id e product_id válidos", () => {
    const result = validateDraft({ ...base, order_id: order, quote_id: "lixo", items: [{ ...base.items[0], product_id: order }] }, SUPA);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.order_id).toBe(order);
      expect(result.value.quote_id).toBeUndefined();
      expect(result.value.items[0].product_id).toBe(order);
    }
  });
});
