import { contrastingForeground } from "@/lib/color";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Nunca interpolar direto no <style> sem validar — mesmo sendo admin-controlled, é a única defesa contra dado corrompido/legado. */
function safeHex(value: string, fallback: string): string {
  return HEX_COLOR.test(value) ? value : fallback;
}

/** Aplica as cores configuradas em site_settings ao tema da loja (não afeta o painel admin). */
export function ThemeInjector({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  const primary = safeHex(primaryColor, "#1e40af");
  const secondary = safeHex(secondaryColor, "#f59e0b");

  const css = `:root {
    --primary: ${primary};
    --primary-foreground: ${contrastingForeground(primary)};
    --secondary: ${secondary};
    --secondary-foreground: ${contrastingForeground(secondary)};
    --ring: ${primary};
  }`;

  // eslint-disable-next-line react/no-danger
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
