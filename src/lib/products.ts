export const CATEGORIES = [
  "디지털기기",
  "생활가전",
  "가구/인테리어",
  "생활/주방",
  "유아동",
  "의류",
  "뷰티/미용",
  "스포츠/레저",
  "취미/게임/음반",
  "도서",
  "반려동물용품",
  "기타",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATUSES = {
  selling: { label: "판매중", className: "bg-goguma-500 text-white" },
  reserved: { label: "예약중", className: "bg-skin-500 text-white" },
  sold: { label: "거래완료", className: "bg-soil-400 text-white" },
} as const;

export type ProductStatus = keyof typeof STATUSES;

export type Product = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  region: string | null;
  status: ProductStatus;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

/** 목록에서 판매자 닉네임까지 함께 읽어올 때의 모양 */
export type ProductWithSeller = Product & {
  goguma_profiles: { nickname: string } | null;
};

export const PRODUCT_IMAGE_BUCKET = "goguma-products";

/** 0원은 '나눔'으로 보여 줍니다. */
export function formatPrice(price: number): string {
  return price === 0 ? "나눔" : `${price.toLocaleString("ko-KR")}원`;
}

/** 방금 · 3분 전 · 2시간 전 · 5일 전 · 날짜 */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function isCategory(value: string): boolean {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isStatus(value: string): value is ProductStatus {
  return value === "selling" || value === "reserved" || value === "sold";
}
