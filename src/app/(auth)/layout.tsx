import { Logo } from "@/components/store/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-paper px-4 py-16 font-[family-name:var(--font-body)] text-ink">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
