import { contrastingForeground } from "@/lib/color";

/** Aplica as cores configuradas em site_settings ao tema da loja (não afeta o painel admin). */
export function ThemeInjector({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  const css = `:root {
    --primary: ${primaryColor};
    --primary-foreground: ${contrastingForeground(primaryColor)};
    --secondary: ${secondaryColor};
    --secondary-foreground: ${contrastingForeground(secondaryColor)};
    --ring: ${primaryColor};
  }`;

  // eslint-disable-next-line react/no-danger
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
