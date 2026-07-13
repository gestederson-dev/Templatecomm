import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">O que você procurava não existe ou foi removido.</p>
      <Button render={<Link href="/">Voltar à loja</Link>} />
    </div>
  );
}
