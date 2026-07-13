import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-muted/20 px-4 py-16">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        Salmar Brindes
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
