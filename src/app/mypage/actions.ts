"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  error?: string;
  values?: { nickname?: string; region?: string };
};

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const values = { nickname, region };

  if (nickname.length < 2 || nickname.length > 12) {
    return { error: "닉네임은 2~12자로 지어 주세요.", values };
  }
  if (region.length > 30) {
    return { error: "동네 이름이 너무 깁니다. (30자까지)", values };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage/edit");

  const { error } = await supabase
    .from("goguma_profiles")
    .update({ nickname, region: region || null })
    .eq("id", user.id);

  if (error) {
    // 닉네임 중복은 DB의 유일 색인이 잡아 줍니다.
    if (error.code === "23505") {
      return { error: "이미 쓰이고 있는 닉네임입니다. 다른 이름으로 지어 주세요.", values };
    }
    return { error: `저장하지 못했습니다: ${error.message}`, values };
  }

  revalidatePath("/", "layout");
  redirect("/mypage");
}
