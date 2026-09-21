import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "프로필 수정 — 고구마마켓" };

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage/edit");

  const { data: profile } = await supabase
    .from("goguma_profiles")
    .select("nickname, region")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-soil-900">프로필 수정</h1>
      <p className="mb-7 text-sm text-soil-600">{user.email}</p>
      <ProfileForm
        nickname={profile?.nickname ?? ""}
        region={profile?.region ?? ""}
      />
    </div>
  );
}
