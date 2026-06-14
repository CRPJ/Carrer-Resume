// 김수현, 최희원 두 크루 + 비교군(박건희, 빵떡이) 진단
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

const TARGETS = [
  { name: "김수현", kakao: "tngus200506@naver.com" },
  { name: "최희원", kakao: "heewon3d2004@naver.com" },
  // 비교군 — 본인 수정 잘 되는 크루
  { name: "박건희", kakao: "parkgh05@naver.com" },
  { name: "빵떡이", kakao: "songjiwoo2731@gmail.com" },
];

async function main() {
  for (const t of TARGETS) {
    console.log(`\n=========== ${t.name} (kakao=${t.kakao}) ===========`);

    // user_profiles by display_name
    const { data: byName } = await sb
      .from("user_profiles")
      .select("id, display_name, email, auth_email, status, growth_status, role, club, created_at, updated_at")
      .eq("display_name", t.name);
    console.log(`[display_name 매칭] ${byName?.length || 0}건`);
    console.log(byName);

    // user_profiles by kakao email (email or auth_email)
    const { data: byMail } = await sb
      .from("user_profiles")
      .select("id, display_name, email, auth_email, status")
      .or(`email.eq.${t.kakao},auth_email.eq.${t.kakao}`);
    console.log(`[kakao 메일 매칭(email|auth_email)] ${byMail?.length || 0}건`);
    console.log(byMail);

    // applicants에 잔류 행 있는지
    const { data: app } = await sb
      .from("applicants")
      .select("id, name, email, status, applied_date")
      .or(`email.eq.${t.kakao},name.eq.${t.name}`);
    console.log(`[applicants 잔류] ${app?.length || 0}건`);
    console.log(app);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
