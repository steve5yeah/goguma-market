# 고구마마켓 🍠

우리 동네 중고거래 웹사이트. Next.js(App Router) + Supabase로 한 단계씩 만들어 갑니다.

## 진행 상황

- **1단계 — 회원가입 / 로그인 / 로그아웃** ✅
- **2단계 — 거래글 등록 · 목록 · 상세 · 수정 · 삭제** ✅
- 3단계 — 찜하기, 채팅 (예정)

## 화면

| 경로 | 내용 |
| --- | --- |
| `/` | 홈 — 방금 올라온 물건 8개 |
| `/products` | 목록 — 검색, 카테고리 필터, 거래완료 숨기기 |
| `/products/new` | 판매하기 (로그인 필요) |
| `/products/[id]` | 상세 — 글쓴이에게만 상태 변경·수정·삭제 버튼 |
| `/products/[id]/edit` | 글 수정 (글쓴이만) |
| `/signup` `/login` | 회원가입 · 로그인 |
| `/mypage` | 내 정보 + 내 판매글 (로그인 필요) |

## 처음 실행하기

```
npm install
npm run dev
```

브라우저에서 http://localhost:3000

> **PowerShell에서 `npm`이 막힌다면** — Windows PowerShell 기본 실행 정책(`Restricted`)이 `npm.ps1` 실행을 막습니다.
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` 로 풀거나, `npm.cmd run dev` 처럼 `.cmd`를 직접 부르세요.

## Supabase

가계부와 **같은 프로젝트**(`gagyebu`, `fpffmmbuiomcfdrjxnck`)를 씁니다. 테이블 이름이 겹치지 않도록 고구마마켓 것에는 `goguma_` 접두사를 붙였습니다. 가계부 테이블(`entries`, `ledger_meta`)은 건드리지 않습니다.

### 테이블

| 테이블 | 내용 |
| --- | --- |
| `goguma_profiles` | 사용자 프로필 (`id` = `auth.users.id`, `nickname`, `region`, `avatar_url`) |
| `goguma_products` | 거래글 (`seller_id`, `title`, `description`, `price`, `category`, `region`, `status`, `image_url`, `image_path`) |

- 가입하면 트리거(`goguma_on_auth_user_created`)가 프로필을 자동으로 만듭니다.
- `status`는 `selling` · `reserved` · `sold` 셋 중 하나입니다.
- `price`가 `0`이면 화면에 **나눔**으로 나옵니다.
- `seller_id`에는 외래키가 둘 붙어 있습니다 — `auth.users`(진짜 주인)와 `goguma_profiles`(PostgREST가 `select("*, goguma_profiles(nickname)")`로 닉네임을 붙여 오기 위해).

### RLS

| | 조회 | 생성 | 수정 · 삭제 |
| --- | --- | --- | --- |
| `goguma_profiles` | 누구나 | 본인 | 본인 |
| `goguma_products` | 누구나 | 로그인 사용자(자기 글) | 글쓴이만 |

남의 글은 UI에서 버튼이 안 보일 뿐 아니라 DB에서도 막힙니다. 다른 사용자로 `update`/`delete`를 직접 날려도 0행이 바뀝니다.

### Storage

- 버킷 `goguma-products` (공개 읽기, 5MB, jpeg/png/webp/gif만)
- 경로는 `<사용자 id>/<uuid>.<확장자>` — 정책상 **자기 폴더에만** 올리고 지울 수 있습니다.
- 사진은 서버 액션을 거치지 않고 **브라우저에서 Storage로 곧장** 올라갑니다. 서버 액션 본문은 기본 1MB 제한이 있어 사진을 통째로 보내기엔 좁기 때문입니다.
- 글을 지우면 붙어 있던 사진 파일도 함께 지웁니다. 사진을 바꿔 저장하면 예전 파일을 지웁니다.

### 메일 인증

지금 **Confirm email이 꺼져 있어서** 가입하면 바로 로그인됩니다. 켜고 싶다면 Authentication → Sign In / Providers → Email → **Confirm email**. 켜진 경우의 메일 링크 처리는 `/auth/callback`에 이미 만들어 두었습니다.

## 폴더 구조

```
src/
├─ middleware.ts                세션 갱신 + /mypage, /products/new 보호
├─ lib/
│  ├─ products.ts               카테고리·상태 목록, 가격/시간 표시 함수
│  └─ supabase/                 client · server · middleware 클라이언트
├─ app/
│  ├─ layout.tsx  globals.css   공통 틀과 고구마 색 팔레트
│  ├─ page.tsx                  홈
│  ├─ auth/                     actions.ts (가입·로그인·로그아웃) + 메일 링크 라우트
│  ├─ login/  signup/  mypage/
│  └─ products/
│     ├─ actions.ts             createProduct · updateProduct · deleteProduct · updateStatus
│     ├─ page.tsx               목록
│     ├─ ProductCard.tsx  ProductForm.tsx  ImageUploader.tsx
│     ├─ DeleteButton.tsx  StatusButtons.tsx
│     ├─ new/page.tsx
│     └─ [id]/page.tsx  [id]/edit/page.tsx
└─ components/                  SiteHeader · SubmitButton · GogumaLogo
```

## 색

군고구마에서 가져왔습니다. `globals.css`의 `@theme`에 정의돼 있어 `bg-goguma-500`처럼 바로 씁니다.

| 이름 | 쓰임 | 대표 색 |
| --- | --- | --- |
| `goguma-*` | 속살 주황 — 버튼, 강조 | `#e87f2a` (500) |
| `skin-*` | 껍질 자주 — 로고, 예약중 | `#6d2f55` (700) |
| `soil-*` | 흙 — 글자, 테두리 | `#3d332b` (800) |

## 알아 둘 점

- **사진은 글 1개당 1장**입니다. 여러 장은 나중에 `goguma_product_images` 같은 표를 따로 두는 쪽이 깔끔합니다.
- **버려진 사진 파일** — 사진만 올리고 글을 저장하지 않으면 그 파일은 Storage에 남습니다. 나중에 주기적으로 청소하는 작업이 필요합니다.
- **닉네임 중복**은 아직 막지 않았습니다.
- 조회수, 찜, 채팅은 아직 없습니다.

## 샘플 데이터

동작 확인용으로 거래글 10개(판매중 8 · 예약중 1 · 거래완료 1)와 테스트 계정 2개(`테스트고구마`, `두번째고구마`)를 넣어 두었습니다.

계정 비밀번호는 공개 저장소에 적지 않습니다. Supabase 대시보드 **Authentication → Users**에서 확인하거나 비밀번호를 재설정하세요. 필요 없어지면 같은 화면에서 계정을 지우면 됩니다.

## 환경 변수

`.env.local` (git에 올라가지 않습니다)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

배포할 때는 Supabase의 Authentication → URL Configuration에서 **Site URL**과 **Redirect URLs**에 실제 주소를 넣어 주세요.
