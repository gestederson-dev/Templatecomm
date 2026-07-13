import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriaLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-6 h-8 w-40" />
      <Skeleton className="mb-6 h-16 w-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  );
}
