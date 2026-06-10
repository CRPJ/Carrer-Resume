// ────────────────────────────────────────────────────────────────────────────
// 오랑캐 크루 클럽1.0 → 1.5 범용 마이그레이터 (조선규 검증 파이프라인 일반화)
//   매칭: placeholder-id(crew{old}@club15.local) → 생일+이름 → 전화
//   backfill: OLD 값(정규화)으로 빈칸 채움 + 틀린값 교정. OLD가 null인 필드는 NEW 보존(안 덮음).
//   주차: useractivities(활동텍스트+강화성공) + pointlogs(단감/인절미, 휴식류는 양수만, 가입전→온보딩)
//   🔒 베타15(LOCKED) 제외.  활동정지/졸업 제외(state 일반/운영진만).
//   실행:  DRY=1 OLD_IDS=1213,1290 node scripts/migrate_oranke_crews.mjs   (드라이런)
//          COMMIT=1 OLD_IDS=1213,1290 node scripts/migrate_oranke_crews.mjs (실제 반영)
// ────────────────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { normalizeSchool, normalizeMajor } = require("../lib/schoolNormalize.js");
const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(readFileSync(resolve(__dirname, "../.env.local"), "utf8").split("\n").map(l=>l.trim()).filter(l=>l&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,"")];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const COMMIT = !!process.env.COMMIT;       // 기본은 DRY. COMMIT=1 이어야 실제 쓰기.
const DRY = !COMMIT;
const NOW = "2026-06-10T00:00:00.000Z";
const OLD_DB = "oranke_base", CLUB = "오랑캐", LINE_ID = "club1_legacy_data";
const POINT_REASON = "클럽1.0 임시데이터 마이그레이션";
const OLD_IDS = (process.env.OLD_IDS || "").split(",").map(s=>s.trim()).filter(Boolean).map(Number);
const TEAM_MAP = { "신입": "클럽온보딩" }, PART_MAP = { "신입": "신입OT" };
const LOCKED_NAMES = new Set(["박건희","김시영","김예령","김현진","정우현","이용준","김혜윤","김나우","김승민","김수현","정재웅","고수림","최희원","윤재윤","빵떡이"]);
const SCHOOLSTATE_MAP = { "재학":"enrolled", "졸업":"graduated", "졸업예정":"expected", "휴학":"enrolled" };

const SSH_KEY = `${env.USERPROFILE || process.env.USERPROFILE}/.ssh/${env.OLD_SSH_KEY}`;
const runOldSql = (sql) => execFileSync("ssh", ["-i",SSH_KEY,"-o","StrictHostKeyChecking=accept-new","-o","ConnectTimeout=30",`${env.OLD_SSH_USER}@${env.OLD_SSH_HOST}`,`MYSQL_PWD='${env.OLD_DB_PASS}' mysql -u '${env.OLD_DB_USER}' --default-character-set=utf8mb4 -N`],{input:sql,encoding:"utf8",maxBuffer:64*1024*1024});
const j = (sql) => JSON.parse(runOldSql(sql).trim() || "null");

const clean = (v) => (v==null||String(v).trim()===""?null:String(v).trim());
const toBirth = (s)=>{ s=clean(s); return s&&/^\d{6}$/.test(s)?`20${s.slice(0,2)}-${s.slice(2,4)}-${s.slice(4,6)}`:null; };
const toPhone = (r)=>{ const d=clean(r)?.replace(/\D/g,""); if(!d) return null; if(d.length===11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`; if(d.length===10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`; return d; };
const firstMajor = (m)=>{ const s=clean(m); return s?normalizeMajor(s.split("/")[0].trim()):null; };
const normAddr = (a)=>{ let s=clean(a); if(!s) return null; s=s.replace(/[!~.\s]+$/,"").replace("서울특별시","서울시").replace("특별자치시","시").replace("광역시","시"); return s.trim()||null; };
const isPlaceholder = (e)=>/@club15\.local$/i.test(e||"");

(async () => {
  if (!OLD_IDS.length) { console.error("OLD_IDS 환경변수 필요 (예: OLD_IDS=1213,1290)"); process.exit(1); }
  console.log(`=== 오랑캐 크루 마이그레이션 ${DRY?"[DRY-RUN]":"[COMMIT]"} | 대상 OLD id: ${OLD_IDS.join(",")} ===\n`);

  // NEW weeks + 오랑캐 크루(매칭용)
  const { data: weeks } = await sb.from("weeks").select("id, season_id, week_number, start_date, end_date, is_club_break");
  const weekByStart = new Map(weeks.map(w=>[w.start_date, w]));
  // teams/parts (이름→id, 파트는 같은 팀 내 우선)
  const { data: teamsAll } = await sb.from("teams").select("id, name");
  const { data: partsAll } = await sb.from("parts").select("id, name, team_id");
  const teamByName = new Map((teamsAll||[]).map(t=>[t.name,t]));
  const partByNameTeam = new Map((partsAll||[]).map(p=>[`${p.name}|${p.team_id}`,p]));
  const partByName = new Map(); (partsAll||[]).forEach(p=>{ if(!partByName.has(p.name)) partByName.set(p.name,p); });
  const resolveTP = (tRaw, pRaw) => {
    const tn = TEAM_MAP[tRaw]||tRaw, pn = PART_MAP[pRaw]||pRaw;
    const team = teamByName.get(tn);
    const part = team ? (partByNameTeam.get(`${pn}|${team.id}`)||partByName.get(pn)) : partByName.get(pn);
    return { team, part };
  };

  const { data: newRows } = await sb.from("user_profiles").select("id, display_name, birth_date, phone, email, university, major_first, club").eq("club", CLUB);
  const byOldId=new Map(), byBirthName=new Map(), byPhone=new Map();
  for (const r of newRows||[]) {
    const m=(r.email||"").match(/^crew(\d+)@club15\.local$/i); if(m) byOldId.set(Number(m[1]), r);
    if(r.birth_date&&r.display_name) byBirthName.set(`${r.birth_date}|${r.display_name}`, r);
    const ph=(r.phone||"").replace(/\D/g,""); if(ph) byPhone.set(ph, r);
  }

  // OLD 대상자 일괄 로드
  const olds = j(`SELECT CAST(JSON_ARRAYAGG(JSON_OBJECT('old_id',u.id,'name',u.name,'mail',u.mail,'contact',u.contact,'school',u.school,'major',u.major,'address',u.address,'birthDay',u.birthDay,'gender',u.gender,'schoolState',u.schoolState,'state',c.state)) AS CHAR) FROM ${OLD_DB}.user_info u LEFT JOIN ${OLD_DB}.crew_info c ON c.user_id=u.id WHERE u.id IN (${OLD_IDS.join(",")});`) || [];

  for (const o of olds) {
    const cand = { display_name:clean(o.name), birth_date:toBirth(o.birthDay), phone:toPhone(o.contact) };
    // ── 매칭 ──
    let nw=null, via="";
    if (byOldId.has(o.old_id)) { nw=byOldId.get(o.old_id); via="placeholder-id"; }
    else if (cand.birth_date && byBirthName.has(`${cand.birth_date}|${cand.display_name}`)) { nw=byBirthName.get(`${cand.birth_date}|${cand.display_name}`); via="birth+name"; }
    else if (cand.phone && byPhone.has(cand.phone.replace(/\D/g,""))) { nw=byPhone.get(cand.phone.replace(/\D/g,"")); via="phone"; }

    console.log("═".repeat(70));
    console.log(`▶ OLD #${o.old_id} ${o.name} (${o.school}) [state=${o.state}]`);
    if (["활동정지","졸업"].includes(o.state)) { console.log("  ⏭️  제외 대상(활동정지/졸업) → 스킵"); continue; }
    if (!nw) { console.log("  ⚠️ NEW 매칭 실패 → 스킵 (신규 insert 는 별도 처리 필요)"); continue; }
    if (LOCKED_NAMES.has(nw.display_name)) { console.log(`  🔒 LOCKED(베타15) → 스킵`); continue; }
    console.log(`  매칭 ✅ NEW=${nw.id} via ${via}`);
    const U = nw.id;

    // ── 0) 폐기(이전) 임포트 잔여 정리 — 베타15는 위에서 이미 continue 로 제외됨.
    //   1.0 크루는 우리 club1 라인/마이그 포인트만 남아야 함. 비-club1 활동, 비-마이그 포인트,
    //   기존 weekly_growth(우리 set 으로 재구성) 전부 삭제 → 1.0/1.5 데이터 혼재 제거.
    if (COMMIT) {
      await sb.from("activity_records").delete().eq("user_id",U).neq("activity_type_id",LINE_ID);
      await sb.from("user_activity_details").delete().eq("user_id",U).neq("activity_type_id",LINE_ID);
      await sb.from("points").delete().eq("user_id",U).neq("reason",POINT_REASON);
      await sb.from("user_weekly_growth").delete().eq("user_id",U);
    }
    console.log("  0) 잔여 정리: 비-club1 활동/상세, 비-마이그 포인트, 기존 weekly_growth 삭제");

    // ── OLD 주차 데이터 ──
    const acts = j(`SELECT CAST(JSON_ARRAYAGG(JSON_OBJECT('start',DATE_FORMAT(StartDate,'%Y-%m-%d'),'team',UserTeam,'part',UserPart,'level',UserLevel,'active',IsActive,'star',Star,'activity',Activity)) AS CHAR) FROM oranke.useractivities WHERE UserId=${o.old_id} AND StartDate>'2000-01-01' ORDER BY StartDate;`) || [];
    const pts = j(`SELECT CAST(JSON_ARRAYAGG(JSON_OBJECT('wkmon',wkmon,'sp',sp,'sa',sa,'hp',hp,'ha',ha)) AS CHAR) FROM (SELECT DATE_FORMAT(DATE_SUB(ActivityTime,INTERVAL WEEKDAY(ActivityTime) DAY),'%Y-%m-%d') wkmon, SUM(GREATEST(Star,0)) sp, SUM(Star) sa, SUM(GREATEST(Shield,0)) hp, SUM(Shield) ha FROM oranke.pointlogs WHERE UserID=${o.old_id} AND IsDeleted=0 AND ActivityTime>'2000-01-01' GROUP BY wkmon) t;`) || [];

    const { data: restReq } = await sb.from("rest_requests").select("week_id").eq("user_id",U).eq("status","approved");
    const personalRest = new Set((restReq||[]).map(r=>r.week_id));
    const onboardStart = acts.length ? acts.map(a=>a.start).sort()[0] : null;
    const onboardWeek = onboardStart ? weekByStart.get(onboardStart) : null;
    const isRest = (w)=> w.is_club_break || personalRest.has(w.id) || (onboardWeek&&w.id===onboardWeek.id);

    const perWeek = new Map();
    const slot=(w)=>{ if(!perWeek.has(w.id)) perWeek.set(w.id,{week:w,star:0,shield:0,act:null}); return perWeek.get(w.id); };
    for (const p of pts) { let w=weekByStart.get(p.wkmon); if(onboardStart&&p.wkmon<onboardStart) w=onboardWeek; if(!w) continue; const s=slot(w); if(isRest(w)){s.star+=p.sp;s.shield+=p.hp;}else{s.star+=p.sa;s.shield+=p.ha;} }
    for (const a of acts) { const w=weekByStart.get(a.start); if(w) slot(w).act=a; }

    // ── 1) 프로필 backfill (OLD null 필드는 NEW 보존) ──
    const cands = {
      university: o.school?normalizeSchool(clean(o.school)):null,
      major_first: firstMajor(o.major),
      phone: toPhone(o.contact),
      email: clean(o.mail), auth_email: clean(o.mail),
      address: normAddr(o.address),
      birth_date: toBirth(o.birthDay),
      gender: clean(o.gender),
      onboarding_week_id: onboardWeek?.id||null, joined_week_id: onboardWeek?.id||null, joined_season_id: onboardWeek?.season_id||null,
    };
    const patch = { updated_at: NOW };
    for (const [k,v] of Object.entries(cands)) if (v!=null) patch[k]=v;   // OLD null → 건드리지 않음
    console.log("  1) profile:", Object.keys(patch).filter(k=>k!=="updated_at").join(", "));
    if (COMMIT) { const {error}=await sb.from("user_profiles").update(patch).eq("id",U); if(error) throw error; }

    // ── 2) educations (없으면 생성) ──
    const { data: edu } = await sb.from("user_educations").select("id").eq("user_id",U);
    if (!edu?.length && cands.university) {
      const row={ user_id:U, education_level:"university", school_name:cands.university, major_name_1:cands.major_first, admission_year:"", graduation_year:null, status:SCHOOLSTATE_MAP[clean(o.schoolState)]||"enrolled", sort_order:0, created_at:NOW, updated_at:NOW };
      console.log("  2) educations CREATE:", row.school_name, row.major_name_1, `(${row.status})`);
      if (COMMIT) { const {error}=await sb.from("user_educations").insert(row); if(error) throw error; }
    } else console.log(`  2) educations: ${edu?.length?`기존 ${edu.length}행`:"학교없음"} → 스킵`);

    // ── 2.5) user_team_parts (없으면 생성) — 활동의 팀/파트 변화 구간별 ──
    const { data: existUtp } = await sb.from("user_team_parts").select("id").eq("user_id",U);
    if (!existUtp?.length && acts.length) {
      const periodsAll=[];
      for (const a of acts) { const last=periodsAll[periodsAll.length-1]; if(!(last&&last.team===a.team&&last.part===a.part)) periodsAll.push({team:a.team,part:a.part,start:a.start}); }
      // 신입(온보딩) 구간은 UI가 '클럽 온보딩/신입OT'로 하드코딩 → user_team_parts 안 만듦.
      // 그래야 온보딩 직후 휴식주차(미배정 구간)가 팀/파트 '-'로 표시됨.
      const periods = periodsAll.filter(pr => pr.team !== "신입");
      const utpRows = periods.map((pr,i)=>{ const {team,part}=resolveTP(pr.team,pr.part); const w=weekByStart.get(pr.start);
        return { user_id:U, team_id:team?.id||null, part_id:part?.id||null, season_id:w?.season_id||null, joined_at:pr.start, left_at: i<periods.length-1?periods[i+1].start:null, is_current: i===periods.length-1 }; });
      console.log(`  2.5) user_team_parts ${utpRows.length}구간:`, periods.map(p=>`${p.team}/${p.part}`).join(" → "));
      if (COMMIT) { const {error}=await sb.from("user_team_parts").insert(utpRows); if(error) throw error; }
    } else console.log(`  2.5) user_team_parts: ${existUtp?.length?`기존 ${existUtp.length}행`:"활동없음"} → 스킵`);

    // ── 3) 활동라인 + 4) 포인트 + 5) growth + 6) 누적 ──
    const actWeeks=[...perWeek.values()].filter(s=>s.act);
    console.log(`  3) 클럽1.0 라인 ${actWeeks.length}주차`);
    for (const s of actWeeks) {
      if (COMMIT) {
        const { data: ex } = await sb.from("activity_records").select("id").eq("user_id",U).eq("week_id",s.week.id).eq("activity_type_id",LINE_ID).maybeSingle();
        if (!ex) await sb.from("activity_records").insert({ user_id:U, week_id:s.week.id, activity_type_id:LINE_ID, is_completed:true, status:"completed", completed_at:NOW });
        await sb.from("user_activity_details").upsert({ user_id:U, week_id:s.week.id, activity_type_id:LINE_ID, sub_title:s.act.activity, updated_at:NOW }, { onConflict:"user_id,week_id,activity_type_id" });
      }
    }
    if (COMMIT) await sb.from("points").delete().eq("user_id",U).eq("reason",POINT_REASON);
    // 단감은 분리: 활동주차면 '평점'(useractivities.Star)을 line_id=club1 행으로(평점 표시용), 나머지는 line_id=null.
    // 주차 총단감(카드가 star 전체 합산)은 그대로 유지됨.
    const pointRows=[];
    for (const s of perWeek.values()) {
      if (s.star) {
        const lineStar = s.act && s.act.star ? Math.min(s.act.star, s.star) : 0;
        if (lineStar) pointRows.push({user_id:U,week_id:s.week.id,point_type:"star",points:lineStar,line_id:LINE_ID,reason:POINT_REASON,given_by:U,given_at:NOW});
        const rest = s.star - lineStar;
        if (rest) pointRows.push({user_id:U,week_id:s.week.id,point_type:"star",points:rest,line_id:null,reason:POINT_REASON,given_by:U,given_at:NOW});
      }
      if (s.shield) pointRows.push({user_id:U,week_id:s.week.id,point_type:"shield",points:s.shield,line_id:null,reason:POINT_REASON,given_by:U,given_at:NOW});
    }
    console.log(`  4) points ${pointRows.length}행`);
    if (COMMIT && pointRows.length) { const {error}=await sb.from("points").insert(pointRows); if(error) throw error; }

    // is_success: 실제 활동(useractivities)이 있는 주차만 성공 인정. 신입=무조건성공.
    // 휴식/포인트만 있는 주차는 단감은 반영되지만 '활동 성공 주차'는 아님 → false (누적주차 미카운트).
    const growthRows=[...perWeek.values()].map(s=>({ user_id:U, week_id:s.week.id, is_success: s.act?(s.act.team==="신입"?true:!!s.act.active):false, earned_stars:s.star, is_club_break:!!s.week.is_club_break, calculated_at:NOW, updated_at:NOW }));
    console.log(`  5) user_weekly_growth ${growthRows.length}주차`);
    if (COMMIT && growthRows.length) { const {error}=await sb.from("user_weekly_growth").upsert(growthRows,{onConflict:"user_id,week_id"}); if(error) throw error; }

    let tStar=0,tShield=0; for(const s of perWeek.values()){tStar+=s.star;tShield+=s.shield;}
    console.log(`  6) 누적 단감 ${tStar} / 인절미 ${tShield} / 어흥 0`);
    if (COMMIT) { const {error}=await sb.from("user_cumulative_points").upsert({user_id:U,total_stars:tStar,total_shields:tShield,total_lightnings:0,last_calculated_at:NOW,updated_at:NOW},{onConflict:"user_id"}); if(error) throw error; }

    // ── 7) user_growth_stats.approved_weeks (Carrer-Resume 사이드바와 동일 산식) ──
    const today = NOW.slice(0,10);
    const successSet = new Set(growthRows.filter(g=>g.is_success).map(g=>g.week_id));
    let approved=0, clubBreak=0, restW=0;
    if (onboardWeek) for (const w of weeks) {
      if (w.start_date < onboardWeek.start_date) continue;   // 가입(온보딩) 이전 제외
      if (w.end_date >= today) continue;                      // 아직 안 끝난 주차 제외
      const hasAct = successSet.has(w.id), isBreak = !!w.is_club_break;
      if (w.id === onboardWeek.id) { approved++; continue; }  // 온보딩 +1
      if (isBreak && hasAct) { approved++; continue; }         // 공식휴식+활동 +1
      if (isBreak) { clubBreak++; continue; }                  // 공식휴식 단독 제외
      if (personalRest.has(w.id)) { restW++; continue; }       // 개인휴식 제외
      if (hasAct) approved++;                                  // 활동 성공 +1
    }
    console.log(`  7) user_growth_stats: 누적주차 ${approved} (공식휴식 ${clubBreak}, 개인휴식 ${restW})`);
    if (COMMIT) { const {error}=await sb.from("user_growth_stats").upsert({user_id:U, approved_weeks:approved, club_break_weeks:clubBreak, rest_weeks:restW, last_calculated_at:NOW, updated_at:NOW},{onConflict:"user_id"}); if(error) throw error; }
  }
  console.log("\n" + (DRY?"※ DRY-RUN — 쓰기 없음. COMMIT=1 로 실제 반영.":"✓ COMMIT 완료."));
})().catch(e=>{ console.error("오류:", e.message, e.details||""); process.exit(1); });
