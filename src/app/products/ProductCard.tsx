import Link from "next/link";
import Image from "next/image";
import {
  STATUSES,
  formatPrice,
  timeAgo,
  type ProductWithSeller,
} from "@/lib/products";

export default function ProductCard({ product }: { product: ProductWithSeller }) {
  const status = STATUSES[product.status];
  const dimmed = product.status === "sold";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex gap-4 rounded-2xl border border-soil-200 bg-white p-3 transition hover:border-goguma-300 hover:shadow-sm sm:flex-col sm:p-0 sm:pb-4"
    >
      <div
        className={`relative size-24 shrink-0 overflow-hidden rounded-xl bg-goguma-100 sm:size-auto sm:aspect-square sm:w-full sm:rounded-b-none sm:rounded-t-2xl ${
          dimmed ? "opacity-55" : ""
        }`}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 96px, 260px"
            className="object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl">
            🍠
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 sm:px-4">
        <div className="mb-1 flex items-center gap-1.5">
          {product.status !== "selling" && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          )}
          <p className="truncate text-sm font-medium text-soil-900">
            {product.title}
          </p>
        </div>
        <p className="font-bold text-soil-900">{formatPrice(product.price)}</p>
        <p className="mt-1 truncate text-xs text-soil-400">
          {product.goguma_profiles?.nickname ?? "탈퇴한 사용자"}
          {product.region ? ` · ${product.region}` : ""} · {timeAgo(product.created_at)}
        </p>
        {product.favorite_count > 0 && (
          <p className="mt-1 text-xs text-soil-400">❤️ {product.favorite_count}</p>
        )}
      </div>
    </Link>
  );
}
