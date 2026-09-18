import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Row = { access_token: string; refresh_token: string; expires_at: string };

// tabela shipping_provider_tokens em memória (uma linha, provider = melhor_envio)
const db = vi.hoisted(() => ({ row: null as Row | null }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: db.row && { ...db.row }, error: null }) }) }),
      upsert: async (values: Row) => {
        db.row = { access_token: values.access_token, refresh_token: values.refresh_token, expires_at: values.expires_at };
        return { error: null };
      },
      delete: () => ({
        eq: () => ({
          eq: async (_column: string, refreshToken: string) => {
            if (db.row?.refresh_token === refreshToken) db.row = null;
            return { error: null };
          },
        }),
      }),
    }),
  }),
}));

import { forceRefreshToken, getValidAccessToken, MelhorEnvioNotConnectedError } from "./melhor-envio-token";

const DAY = 24 * 60 * 60 * 1000;
const inDays = (days: number) => new Date(Date.now() + days * DAY).toISOString();

function tokenResponse(access: string, refresh: string) {
  return new Response(JSON.stringify({ access_token: access, refresh_token: refresh, expires_in: 30 * 24 * 60 * 60 }), { status: 200 });
}

const refreshTokenExpired = () =>
  new Response(JSON.stringify({ error: "invalid_request", error_description: "The refresh token is invalid.", hint: "Token has expired" }), {
    status: 401,
  });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("MELHOR_ENVIO_CLIENT_ID", "client-id");
  vi.stubEnv("MELHOR_ENVIO_CLIENT_SECRET", "client-secret");
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getValidAccessToken", () => {
  it("usa o token salvo sem chamar a API quando ainda está válido", async () => {
    db.row = { access_token: "acc-1", refresh_token: "ref-1", expires_at: inDays(10) };

    await expect(getValidAccessToken()).resolves.toBe("acc-1");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renova via refresh_token quando está perto de expirar e salva o par novo", async () => {
    db.row = { access_token: "acc-1", refresh_token: "ref-1", expires_at: inDays(-1) };
    fetchMock.mockResolvedValueOnce(tokenResponse("acc-2", "ref-2"));

    await expect(getValidAccessToken()).resolves.toBe("acc-2");
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("ref-1");
    expect(db.row).toMatchObject({ access_token: "acc-2", refresh_token: "ref-2" });
  });

  it("refresh_token expirado: remove a conexão e pede reconexão", async () => {
    db.row = { access_token: "acc-1", refresh_token: "ref-1", expires_at: inDays(-1) };
    fetchMock.mockResolvedValueOnce(refreshTokenExpired());

    await expect(getValidAccessToken()).rejects.toBeInstanceOf(MelhorEnvioNotConnectedError);
    expect(db.row).toBeNull();
  });

  it("corrida: se outra request já renovou, usa o token novo em vez de derrubar a conexão", async () => {
    db.row = { access_token: "acc-1", refresh_token: "ref-1", expires_at: inDays(-1) };
    fetchMock.mockImplementationOnce(async () => {
      // a outra request consumiu ref-1 e salvou o par novo antes da nossa chegar na API
      db.row = { access_token: "acc-2", refresh_token: "ref-2", expires_at: inDays(30) };
      return refreshTokenExpired();
    });

    await expect(getValidAccessToken()).resolves.toBe("acc-2");
    expect(db.row).toMatchObject({ refresh_token: "ref-2" });
  });

  it("erro de configuração do app (invalid_client) não descarta o token salvo", async () => {
    db.row = { access_token: "acc-1", refresh_token: "ref-1", expires_at: inDays(-1) };
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: "invalid_client" }), { status: 401 }));

    const promise = getValidAccessToken();
    await expect(promise).rejects.toThrow("invalid_client");
    await expect(promise).rejects.not.toBeInstanceOf(MelhorEnvioNotConnectedError);
    expect(db.row).toMatchObject({ refresh_token: "ref-1" });
  });

  it("sem conexão salva: pede pra conectar", async () => {
    db.row = null;

    await expect(getValidAccessToken()).rejects.toBeInstanceOf(MelhorEnvioNotConnectedError);
  });
});

describe("forceRefreshToken", () => {
  it("renova mesmo com o access_token ainda válido", async () => {
    db.row = { access_token: "acc-1", refresh_token: "ref-1", expires_at: inDays(20) };
    fetchMock.mockResolvedValueOnce(tokenResponse("acc-2", "ref-2"));

    await forceRefreshToken();
    expect(db.row).toMatchObject({ access_token: "acc-2", refresh_token: "ref-2" });
  });
});
