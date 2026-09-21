import type { NextConfig } from "next";

/**
 * 환경 변수 이름 정리
 *
 * Vercel에는 접두사 없이 SUPABASE_URL / SUPABASE_ANON_KEY / SITE_URL 로 넣어 둡니다.
 * 그런데 브라우저에서 돌아가는 코드(사진 올리기 등)는 NEXT_PUBLIC_ 이 붙은 이름만
 * 읽을 수 있습니다. 그래서 여기서 한 번 옮겨 담아 줍니다.
 *
 * 아래 env 항목에 적으면 Next.js가 빌드할 때 그 값을 코드 안에 그대로 박아 넣어 주고,
 * 서버 코드와 브라우저 코드 양쪽에서 process.env.NEXT_PUBLIC_... 으로 읽을 수 있게 됩니다.
 * (예전처럼 NEXT_PUBLIC_ 이 붙은 이름으로 넣어 둔 곳에서도 그대로 동작하도록 둘 다 받습니다.)
 */
const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  images: {
    // 상품 사진은 Supabase Storage에서 옵니다.
    // 외부 주소를 next/image로 쓰려면 이렇게 허용 목록에 넣어야 합니다.
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
