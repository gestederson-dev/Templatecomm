/**
 * Storage (S3-compatible) rejeita chave com espaço, "+", acento e outros
 * caracteres fora de [A-Za-z0-9._-] — sobe erro "Invalid key" silencioso
 * pro usuário. Nome de arquivo de cliente nunca é confiável nesse ponto.
 */
export function sanitizeFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  const base = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  const ext = lastDot > 0 ? fileName.slice(lastDot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";

  const safeBase =
    base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "arquivo";

  return ext ? `${safeBase}.${ext}` : safeBase;
}
