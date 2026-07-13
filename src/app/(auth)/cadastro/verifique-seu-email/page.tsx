import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifiqueSeuEmailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirme seu e-mail</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de confirmação para o e-mail informado. Clique no link para ativar sua conta e continuar.
        </p>
      </CardContent>
    </Card>
  );
}
