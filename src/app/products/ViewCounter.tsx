"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 조회수 올리기.
 *
 * 화면이 뜰 때 한 번만 올립니다. 같은 브라우저에서 같은 글을 계속 새로고침해도
 * 중복으로 세지 않도록, 이미 본 글은 sessionStorage(탭을 닫으면 지워지는 메모장)에
 * 적어 둡니다. 보이는 것이 없는 부품이라 화면에는 아무것도 그리지 않습니다.
 */
export default function ViewCounter({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `goguma-viewed-${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // 사생활 보호 모드 등으로 막혀 있으면 그냥 세고 넘어갑니다.
    }

    // Supabase 쿼리는 await(또는 .then)을 붙여야 실제로 서버에 보내집니다.
    // 그냥 만들어만 두면 아무 일도 일어나지 않습니다.
    const supabase = createClient();
    void (async () => {
      await supabase.rpc("goguma_increment_view", { p_product_id: productId });
    })();
  }, [productId]);

  return null;
}
