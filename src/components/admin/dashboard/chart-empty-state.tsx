import Image from "next/image";

export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[190px] flex-col items-center justify-center gap-3 text-center">
      <Image src="/logo/salmar-heart-mark.png" alt="" width={40} height={40} className="opacity-[0.14]" />
      <p className="text-sm text-ink/45">{message}</p>
    </div>
  );
}
