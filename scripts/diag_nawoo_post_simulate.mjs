// 김나우로 /api/activity-details 직접 POST 시뮬레이션
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);

const BASE = "http://localhost:3000";
const WEEK_ID = "05a5de8b-de2d-4e4d-80be-abeb0967542c";
const USERS = {
  김수현: "b4413d76-bb2c-494d-89f4-08d6f60e9b55",
  김나우: "89f3e14b-68c7-4d6c-bb98-7617cdbf3b8d",
};

for (const [name, userId] of Object.entries(USERS)) {
  const body = {
    user_id: userId,
    week_id: WEEK_ID,
    activity_type_id: "practical_project",
    sub_title: `[diag] ${name} 테스트 ${new Date().toISOString()}`,
    growth_point: `[diag] ${name} growth`,
    output_links: null,
    image_urls: [],
    image_captions: [],
  };
  console.log(`\n=== ${name} 으로 POST /api/activity-details ===`);
  console.log("body:", body);
  try {
    const res = await fetch(`${BASE}/api/activity-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log(`status: ${res.status}`);
    console.log(`response: ${text.slice(0, 800)}`);
  } catch (e) {
    console.log(`fetch error: ${e.message}`);
  }
}
