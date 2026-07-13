import Image from "next/image";
import { Reveal } from "@/components/store/reveal";
import { btnAmberSm } from "@/components/store/button-styles";

export function QuoteBand() {
  return (
    <Reveal className="relative overflow-hidden rounded-[26px] bg-wine px-6 py-12 text-white sm:px-13 sm:py-14">
      <Image
        src="/logo/salmar-heart-mark.png"
        alt=""
        aria-hidden="true"
        width={280}
        height={280}
        className="pointer-events-none absolute -right-5 -top-7 w-[220px] opacity-10 brightness-0 invert sm:w-[280px]"
      />
      <div className="relative z-[1] max-w-[600px]">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber">Para empresas</p>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-[clamp(26px,3.4vw,40px)] font-bold leading-[1.08] tracking-[-0.02em]">
          Volume grande ou personalização especial?
        </h2>
        <p className="mb-7 max-w-[500px] text-[17px] text-white/82">
          Monte o kit da sua empresa, envie a arte com o logo e receba um orçamento sob medida — com preço por quantidade.
        </p>
        <a href="/produtos?quote=1" className={btnAmberSm}>
          Peça seu orçamento
        </a>
      </div>
    </Reveal>
  );
}
