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
      className="group flex gap-3.5 overflow-hidden rounded-2xl border border-soil-200 bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:border-goguma-200 hover:shadow-[var(--shadow-lift)] sm:block sm:p-0 sm:pb-3.5"
    >
      <div
        className={`relative size-[5.5rem] shrink-0 overflow-hidden rounded-xl bg-goguma-100 sm:size-auto sm:aspect-square sm:w-full sm:rounded-b-none sm:rounded-t-2xl ${
          dimmed ? "opacity-50" : ""
        }`}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 88px, (max-width: 1024px) 50vw, 260px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl opacity-60">
            🍠
          </span>
        )}

        {product.status !== "selling" && (
          <span
            className={`absolute left-2 top-2 rounded-lg px-1.5 py-0.5 text-[0.7rem] font-semibold shadow-sm ${status.className}`}
          >
            {status.label}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col sm:px-3.5 sm:pt-3">
        <p className="line-clamp-2 text-[0.9rem] leading-snug text-soil-800">
          {product.title}
        </p>
        <p className="mt-1 text-[1.05rem] font-bold text-soil-900">
          {formatPrice(product.price)}
        </p>

        <p className="mt-auto truncate pt-2 text-xs text-soil-400">
          {product.region ? `${product.region} · ` : ""}
          {timeAgo(product.created_at)}
        </p>

        {(product.favorite_count > 0 || product.view_count > 0) && (
          <p className="mt-1 flex items-center gap-2.5 text-xs text-soil-400">
            {product.favorite_count > 0 && <span>❤️ {product.favorite_count}</span>}
            {product.view_count > 0 && <span>조회 {product.view_count}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
