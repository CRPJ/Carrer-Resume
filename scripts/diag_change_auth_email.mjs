// auth.users.email 변경 테스트 (잠깐 가설 검증용)
// 사용법:
//   node scripts/diag_change_auth_email.mjs to-2732   ← 2731 → 2732 변경
//   node scripts/diag_change_auth_email.mjs revert    ← 2732 → 2731 복구
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

const FROM = "songjiwoo2731@gmail.com";
const TO   = "songjiwoo2732@gmail.com";

async function findByEmail(email) {
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return (data?.users || []).find(u => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
}

async function main() {
  const mode = process.argv[2] || "to-2732";
  const [from, to] = mode === "revert" ? [TO, FROM] : [FROM, TO];

  const u = await findByEmail(from);
  if (!u) {
    console.log(`auth.users에 email=${from} 없음 (이미 변경됐을 수 있음)`);
    const alt = await findByEmail(to);
    if (alt) console.log(`현재 ${to}로 존재: id=${alt.id}`);
    return;
  }
  console.log(`변경 전: id=${u.id}  email=${u.email}`);
  const { data, error } = await sb.auth.admin.updateUserById(u.id, { email: to, email_confirm: true });
  if (error) { console.error("업데이트 실패:", error); return; }
  console.log(`변경 후: id=${data.user?.id}  email=${data.user?.email}`);
}

main().catch(e => { console.error(e); process.exit(1); });
