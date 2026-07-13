import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  variant?: "mark" | "lockup";
  siteName?: string;
  href?: string;
  className?: string;
};

/**
 * mark: coração facetado + wordmark serif (header, contextos compactos).
 * lockup: imagem de lockup completa já pronta (rodapé, contextos grandes).
 */
export function Logo({ variant = "mark", siteName = "Salmar", href = "/", className = "" }: LogoProps) {
  if (variant === "lockup") {
    return (
      <Link href={href} className={`inline-flex items-center ${className}`}>
        <Image src="/logo/salmar-logo-lockup.png" alt={siteName} width={220} height={88} className="h-16 w-auto object-contain" priority={false} />
      </Link>
    );
  }

  const [first, ...rest] = siteName.split(" ");
  const small = rest.join(" ");

  return (
    <Link href={href} className={`flex items-center gap-3 ${className}`}>
      <Image src="/logo/salmar-heart-mark.png" alt="" width={46} height={46} className="h-[46px] w-auto" priority />
      <span className="font-[family-name:var(--font-serif)] text-[23px] font-semibold leading-[0.95] tracking-[-0.01em] text-wine">
        {first}
        {small ? (
          <small className="mt-1 block font-[family-name:var(--font-body)] text-[9.5px] font-medium uppercase tracking-[0.34em] text-ink/60">
            {small}
          </small>
        ) : null}
      </span>
    </Link>
  );
}
