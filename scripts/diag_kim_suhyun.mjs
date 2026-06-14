// 김수현 계정 진단: 동명이인/이메일 매칭 후보 전수 점검
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const KAKAO_EMAIL = "tngus200506@naver.com";
const NAME = "김수현";

async function main() {
  // 1) display_name == "김수현" 동명이인 전수
  const { data: byName, error: e1 } = await sb
    .from("user_profiles")
    .select("id, display_name, email, auth_email, status, club, created_at")
    .eq("display_name", NAME);
  if (e1) console.error(e1); else {
    console.log(`[display_name == "${NAME}"]  ${byName?.length || 0}건`);
    console.log(JSON.stringify(byName, null, 2));
  }

  // 2) email/auth_email에 카카오 메일 있는 행 전수
  const { data: byMail, error: e2 } = await sb
    .from("user_profiles")
    .select("id, display_name, email, auth_email, status")
    .or(`email.eq.${KAKAO_EMAIL},auth_email.eq.${KAKAO_EMAIL}`);
  if (e2) console.error(e2); else {
    console.log(`\n[email/auth_email == "${KAKAO_EMAIL}"]  ${byMail?.length || 0}건`);
    console.log(JSON.stringify(byMail, null, 2));
  }

  // 3) maybeSingle 시뮬레이션: NextAuth 콜백이 실제로 매칭 가능한지
  const trySingle = async (filter, label) => {
    const { data, error } = await filter;
    console.log(`\n[${label}] data=${data ? JSON.stringify(data) : "null"} err=${error ? error.code + " " + error.message : "none"}`);
  };
  await trySingle(
    sb.from("user_profiles").select("id, display_name, email, auth_email").eq("email", KAKAO_EMAIL).maybeSingle(),
    "1차 email maybeSingle"
  );
  await trySingle(
    sb.from("user_profiles").select("id, display_name, email, auth_email").eq("auth_email", KAKAO_EMAIL).maybeSingle(),
    "2차 auth_email maybeSingle"
  );
  await trySingle(
    sb.from("user_profiles").select("id, display_name, email, auth_email").eq("display_name", NAME).maybeSingle(),
    "3차 display_name maybeSingle (2명 이상이면 PGRST116 에러)"
  );

  // 4) 김수현 row의 auth.users 상태
  const targetId = "b4413d76-bb2c-494d-89f4-08d6f60e9b55";
  const { data: au } = await sb.auth.admin.getUserById(targetId);
  console.log(`\n[auth.users] last_sign_in_at=${au?.user?.last_sign_in_at} provider=${au?.user?.app_metadata?.provider} identities=${(au?.user?.identities || []).map(i => i.provider).join(",")}`);
}

main().catch(e => { console.error(e); process.exit(1); });
