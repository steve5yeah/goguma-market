"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_IMAGE_BUCKET, isCategory, isStatus } from "@/lib/products";

export type ProductFormState = {
  error?: string;
  values?: {
    title?: string;
    description?: string;
    price?: string;
    category?: string;
    region?: string;
    imageUrl?: string;
    imagePath?: string;
  };
};

type ParsedInput = {
  title: string;
  description: string;
  price: number;
  category: string;
  region: string | null;
  imageUrl: string | null;
  imagePath: string | null;
};

/** 폼 값을 읽고 검증합니다. 문제가 있으면 오류 상태를, 없으면 정리된 값을 돌려줍니다. */
function parse(
  formData: FormData,
): { ok: true; data: ParsedInput } | { ok: false; state: ProductFormState } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imagePath = String(formData.get("imagePath") ?? "").trim();

  const values = {
    title,
    description,
    price: priceRaw,
    category,
    region,
    imageUrl,
    imagePath,
  };
  const fail = (error: string) => ({ ok: false as const, state: { error, values } });

  if (title.length < 2 || title.length > 40) return fail("제목은 2~40자로 적어 주세요.");
  if (description.length < 5) return fail("설명을 5자 이상 적어 주세요.");
  if (description.length > 2000) return fail("설명이 너무 깁니다. (2000자까지)");
  if (!isCategory(category)) return fail("카테고리를 골라 주세요.");

  // "12,000" 처럼 쉼표가 섞여 들어와도 받아 줍니다.
  const price = Number(priceRaw.replace(/,/g, ""));
  if (!Number.isInteger(price) || price < 0) return fail("가격은 0 이상의 숫자로 적어 주세요.");
  if (price > 1_000_000_000) return fail("가격이 너무 큽니다.");

  return {
    ok: true,
    data: {
      title,
      description,
      price,
      category,
      region: region || null,
      imageUrl: imageUrl || null,
      imagePath: imagePath || null,
    },
  };
}

/* ------------------------------- 등록 ------------------------------- */

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parse(formData);
  if (!parsed.ok) return parsed.state;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/products/new");

  const { data, error } = await supabase
    .from("goguma_products")
    .insert({
      seller_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      region: parsed.data.region,
      image_url: parsed.data.imageUrl,
      image_path: parsed.data.imagePath,
    })
    .select("id")
    .single();

  if (error) {
    return {
      error: `등록에 실패했습니다: ${error.message}`,
      values: {
        title: parsed.data.title,
        description: parsed.data.description,
        price: String(parsed.data.price),
        category: parsed.data.category,
        region: parsed.data.region ?? "",
        imageUrl: parsed.data.imageUrl ?? "",
        imagePath: parsed.data.imagePath ?? "",
      },
    };
  }

  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/products/${data.id}`);
}

/* ------------------------------- 수정 ------------------------------- */

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 접근입니다." };

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.state;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/products/${id}/edit`);

  // 사진을 바꿨다면 예전 파일은 지웁니다.
  const previousPath = String(formData.get("previousImagePath") ?? "").trim();
  if (previousPath && previousPath !== parsed.data.imagePath) {
    await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([previousPath]);
  }

  const { error } = await supabase
    .from("goguma_products")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      region: parsed.data.region,
      image_url: parsed.data.imageUrl,
      image_path: parsed.data.imagePath,
    })
    .eq("id", id)
    .eq("seller_id", user.id); // RLS와 별개로 한 번 더 못 박아 둡니다.

  if (error) return { error: `수정에 실패했습니다: ${error.message}` };

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/");
  redirect(`/products/${id}`);
}

/* ------------------------------- 삭제 ------------------------------- */

export async function deleteProduct(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: product } = await supabase
    .from("goguma_products")
    .select("image_path, seller_id")
    .eq("id", id)
    .maybeSingle();

  if (!product || product.seller_id !== user.id) redirect("/products");

  const { error } = await supabase
    .from("goguma_products")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) redirect(`/products/${id}?error=delete`);

  if (product.image_path) {
    await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([product.image_path]);
  }

  revalidatePath("/products");
  revalidatePath("/");
  redirect("/products");
}

/* --------------------------- 상태 바꾸기 --------------------------- */

/**
 * 버튼마다 값을 bind로 미리 묶어 둡니다.
 * (제출 버튼의 name/value에 기대지 않아서 폼이 하나든 여럿이든 똑같이 동작합니다.)
 */
export async function updateStatus(
  id: string,
  status: string,
  _formData: FormData,
): Promise<void> {
  if (!id || !isStatus(status)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("goguma_products")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", user.id);

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/");
}
