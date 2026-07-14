import { ContaTabs } from "@/components/account/conta-tabs";

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-7">
      <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Minha conta</h1>
      <ContaTabs />
      {children}
    </div>
  );
}
