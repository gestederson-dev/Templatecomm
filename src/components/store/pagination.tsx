import Link from "next/link";
import { Button } from "@/components/ui/button";

function buildHref(basePath: string, params: URLSearchParams, page: number): string {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  return `${basePath}?${next.toString()}`;
}

export function CatalogPagination({
  basePath,
  currentParams,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  currentParams: URLSearchParams;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-2 pt-8">
      {isFirstPage ? (
        <Button variant="outline" size="sm" disabled>
          Anterior
        </Button>
      ) : (
        <Button render={<Link href={buildHref(basePath, currentParams, page - 1)}>Anterior</Link>} variant="outline" size="sm" />
      )}

      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>

      {isLastPage ? (
        <Button variant="outline" size="sm" disabled>
          Próxima
        </Button>
      ) : (
        <Button render={<Link href={buildHref(basePath, currentParams, page + 1)}>Próxima</Link>} variant="outline" size="sm" />
      )}
    </nav>
  );
}
