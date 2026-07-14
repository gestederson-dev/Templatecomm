import Image from "next/image";
import { btnWine, btnAmber } from "@/components/store/button-styles";

const GLINT_PATH = "M12 0 14 10 24 12 14 14 12 24 10 14 0 12 10 10Z";

function Glint({ className, size = 26, duration = 2.6, delay = 0 }: { className: string; size?: number; duration?: number; delay?: number }) {
  return (
    <div
      className={`salmar-glint pointer-events-none absolute z-[3] ${className}`}
      style={{ width: size, height: size, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-full w-full fill-amber">
        <path d={GLINT_PATH} />
      </svg>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-[15px] w-[15px] shrink-0 stroke-wine">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {children}
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 py-16 sm:px-7 sm:py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:py-[74px]">
        <div>
          <div className="salmar-rise d1 mb-5 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-wine">
            <Image src="/logo/salmar-heart-mark.png" alt="" width={17} height={17} className="h-[17px] w-auto" />
            Brindes personalizados com sua marca
          </div>

          <h1 className="salmar-rise d2 mb-6 font-[family-name:var(--font-display)] text-[clamp(38px,5vw,62px)] font-bold leading-[1.04] tracking-[-0.025em] text-ink">
            Sua marca merece um <span className="salmar-underline">brinde</span> à altura.
          </h1>

          <p className="salmar-rise d3 mb-8 max-w-[466px] text-lg text-ink/70">
            Canecas, ecobags, cadernos e kits executivos com o logo da sua empresa. Compre pronto ou peça um orçamento sob medida.
          </p>

          <div className="salmar-rise d4 mb-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5">
            <a href="/produtos" className={`${btnWine} w-full sm:w-auto`}>
              Ver catálogo
            </a>
            <a href="/produtos?quote=1" className={`${btnAmber} w-full sm:w-auto`}>
              Peça seu orçamento
            </a>
          </div>

          <div className="salmar-rise d5 hidden flex-wrap gap-5 text-[13px] text-ink/60 sm:flex">
            <CheckItem>Personalização com sua marca</CheckItem>
            <CheckItem>A partir de 25 unidades</CheckItem>
            <CheckItem>Entrega para todo o Brasil</CheckItem>
          </div>
        </div>

        <div>
          <div className="salmar-rise d3 relative grid h-[220px] place-items-center sm:h-[320px] md:h-[430px]">
            <div className="salmar-halo absolute h-[210px] w-[210px] rounded-full bg-[radial-gradient(circle_at_50%_45%,var(--amber-tint),transparent_60%)] sm:h-[300px] sm:w-[300px] md:h-[440px] md:w-[440px]" />

            <div className="salmar-gem relative w-[168px] sm:w-[240px] md:w-[330px]">
              <Image src="/logo/salmar-heart-mark.png" alt="Salmar Personalizados" width={330} height={330} priority className="block w-full" />
            </div>

            <Glint className="left-[26%] top-[18%]" duration={2.6} />
            <Glint className="left-[64%] top-[36%]" size={22} duration={3.1} delay={0.7} />
            <Glint className="left-[56%] top-[12%]" size={16} duration={2.2} delay={1.3} />

            <div
              className="salmar-chip absolute right-[2%] top-8 z-[4] hidden rounded-full bg-wine px-4 py-2.5 text-xs font-semibold text-white shadow-[var(--shadow-brand-lift)] sm:block"
              style={{ animationDelay: "0.8s" }}
            >
              Compra direta
            </div>
            <div
              className="salmar-chip absolute bottom-11 left-[2%] z-[4] hidden rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-wine shadow-[var(--shadow-brand-lift)] sm:block"
              style={{ animationDelay: "1.6s" }}
            >
              Sob orçamento
            </div>
          </div>

          <div className="salmar-rise d5 flex justify-center gap-2.5 sm:hidden">
            <span className="rounded-full bg-wine px-4 py-2 text-xs font-semibold text-white">Compra direta</span>
            <span className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold text-wine">Sob orçamento</span>
          </div>
        </div>
      </div>
    </section>
  );
}
