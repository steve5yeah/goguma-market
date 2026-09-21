import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";

export const metadata = { title: "판매하기 — 고구마마켓" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/products/new");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-soil-900">판매하기</h1>
      <p className="mb-6 text-sm text-soil-600">
        사진 한 장과 설명만 있으면 충분합니다.
      </p>
      <ProductForm />
    </div>
  );
}
