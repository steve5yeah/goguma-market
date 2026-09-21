import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase 메일 템플릿을 token_hash 방식으로 바꿨을 때 쓰는 경로.
 * (대시보드 > Authentication > Email Templates 에서
 *  {{ .ConfirmationURL }} 대신
 *  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email 로 바꾸면 이쪽으로 옵니다.)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirm`);
}
