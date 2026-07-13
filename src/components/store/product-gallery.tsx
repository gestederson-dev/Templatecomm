"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? null;

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        Sem imagem
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        <Image src={active!.url} alt={active!.alt ?? productName} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" priority />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border ${index === activeIndex ? "border-foreground" : "border-transparent"}`}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <Image src={image.url} alt={image.alt ?? productName} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
