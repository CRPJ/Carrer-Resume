// 위클리 상세 테마 스크린샷 — 디자인 비교 루프용.
// usage: node scripts/shot_weekly_theme.mjs [t5] [week-0] [out.png]
import { chromium } from "playwright";

const theme = process.argv[2] || "t5";
const weekId = process.argv[3] || "week-0";
const out = process.argv[4] || `/tmp/shot_${theme}.png`;
const url = `http://localhost:3000/weekly-ranking/${weekId}?demo=1`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 1000 },
  deviceScaleFactor: 2,
});
// 페이지가 읽기 전에 테마를 localStorage 에 주입.
await ctx.addInitScript((t) => {
  try {
    localStorage.setItem("weeklyArenaTheme", t);
    localStorage.setItem("demoMode", "true"); // 더미 카드(week-N) 사용
  } catch {}
}, theme);

const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
// 클라이언트 렌더 + 폰트/이미지 안정화 대기.
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("saved:", out);
