import { storeCard, storeSectionTitle } from "@/components/store/ui-styles";

export default function VerifiqueSeuEmailPage() {
  return (
    <div className={`${storeCard} flex flex-col gap-3`}>
      <h1 className={storeSectionTitle}>Confirme seu e-mail</h1>
      <p className="text-sm text-ink/62">
        Enviamos um link de confirmação para o e-mail informado. Clique no link para ativar sua conta e continuar.
      </p>
    </div>
  );
}
