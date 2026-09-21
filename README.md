# 고구마마켓 🍠

우리 동네 중고거래 웹사이트. Next.js(App Router) + Supabase로 한 단계씩 만들어 갑니다.

## 지금까지 만든 것 — 1단계: 회원가입 / 로그인 / 로그아웃

| 경로 | 내용 |
| --- | --- |
| `/` | 홈 (로그인 여부에 따라 버튼이 바뀝니다) |
| `/signup` | 이메일 · 닉네임 · 비밀번호로 가입 |
| `/login` | 로그인 |
| `/mypage` | 로그인해야 볼 수 있는 내 정보 (비로그인 시 `/login`으로 이동) |
| 헤더 로그아웃 | 어느 화면에서든 로그아웃 |

## 처음 실행하기

1. **Node.js 설치** (아직 없다면)

   ```
   winget install OpenJS.NodeJS.LTS
   ```

   설치 후 터미널을 새로 열어야 `node`, `npm` 명령이 잡힙니다.

2. **패키지 설치 후 실행**

   ```
   npm install
   npm run dev
   ```

3. 브라우저에서 http://localhost:3000

## Supabase 설정

가계부와 **같은 프로젝트**(`gagyebu`, `fpffmmbuiomcfdrjxnck`)를 씁니다. 테이블 이름이 겹치지 않도록 고구마마켓 테이블에는 `goguma_` 접두사를 붙였습니다.

| 테이블 | 내용 |
| --- | --- |
| `goguma_profiles` | 사용자 프로필 (`id`는 `auth.users.id`, `nickname`, `region`, `avatar_url`) |

- 가입하면 `auth.users`에 행이 생기고, **트리거**(`goguma_on_auth_user_created`)가 `goguma_profiles`에 프로필을 자동으로 만듭니다.
- RLS: 프로필 조회는 누구나, 수정·생성은 본인만.
- 가계부 테이블(`entries`, `ledger_meta`)은 건드리지 않았습니다.

### 메일 인증

이 프로젝트는 지금 **Confirm email이 꺼져 있어서** 가입하면 바로 로그인 상태가 됩니다. 공부하기 편한 설정입니다.

나중에 켜고 싶다면 Authentication → Sign In / Providers → Email → **Confirm email**. 켜면 가입 후 "메일을 확인해 주세요" 화면이 뜨고, 메일 링크는 `/auth/callback`으로 돌아옵니다 (코드는 이미 두 경우를 모두 처리합니다).

배포할 때는 Authentication → URL Configuration의 **Site URL**과 **Redirect URLs**에 실제 주소를 넣어 주세요.

## 폴더 구조

```
src/
├─ middleware.ts              로그인 세션 갱신 + /mypage 보호
├─ lib/supabase/
│  ├─ client.ts               브라우저용 클라이언트
│  ├─ server.ts               서버 컴포넌트 · 서버 액션용
│  └─ middleware.ts           세션 갱신 로직
├─ app/
│  ├─ layout.tsx              헤더 · 푸터 공통 틀
│  ├─ globals.css             고구마 색 팔레트 (@theme)
│  ├─ page.tsx                홈
│  ├─ auth/
│  │  ├─ actions.ts           signUp · signIn · signOut 서버 액션
│  │  ├─ callback/route.ts    메일 링크(?code=) 처리
│  │  └─ confirm/route.ts     메일 링크(token_hash 방식) 처리
│  ├─ login/                  page.tsx + LoginForm.tsx
│  ├─ signup/                 page.tsx + SignupForm.tsx
│  └─ mypage/page.tsx         보호된 페이지
└─ components/                SiteHeader · SubmitButton · GogumaLogo
```

## 색

군고구마에서 가져왔습니다. `globals.css`의 `@theme`에 정의되어 있어 `bg-goguma-500`처럼 바로 씁니다.

| 이름 | 쓰임 | 대표 색 |
| --- | --- | --- |
| `goguma-*` | 속살 주황 — 버튼, 강조 | `#e87f2a` (500) |
| `skin-*` | 껍질 자주 — 로고, 제목 | `#6d2f55` (700) |
| `soil-*` | 흙 — 글자, 테두리 | `#3d332b` (800) |

## 환경 변수

`.env.local` (git에 올라가지 않습니다)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 테스트 계정

동작 확인용으로 두 개 만들어 뒀습니다. 필요 없으면 Supabase 대시보드 Authentication → Users에서 지우세요.

| 이메일 | 비밀번호 | 닉네임 |
| --- | --- | --- |
| `goguma.test@gmail.com` | `goguma1234` | 테스트고구마 |
| `goguma.test2@gmail.com` | `goguma1234` | 두번째고구마 |

## 다음 단계 (예정)

- 2단계 — 상품 등록 · 목록 · 상세 (이미지는 Supabase Storage)
- 3단계 — 찜하기, 동네 설정, 채팅
