// Weekly League 상세 페이지 — 섹션 1(주차 정보) 더미.
// 주차 카드(WeeklyCardData)에 이미 있는 통계(활동/휴식/성공/실패 크루 수, 성장 성공율, 이미지, 기간)는 재사용하고,
// 카드에 없는 필드(주차 개요, 시즌 휴식 크루 수, 주차 사회 소식 3개)만 여기서 더미로 채운다.
// 실제 API 연동 시 이 파일을 서버 응답으로 대체. seasonName 으로 매핑되, 없으면 deterministic fallback 생성.

export type SocialNewsItem = {
  category: string;   // 예: "경제", "기술", "사회"
  title: string;
  source: string;     // 출처/매체
};

export type WeeklyDetailInfo = {
  overview: string;            // [1.3] 주차 개요 — 이번 주가 어떤 주였고 어떻게 진행되었는지 짧은 평
  seasonRestCrews: number;     // [1.6] 시즌 휴식 크루 (클럽 차원 휴식, 카드에는 없음)
  socialNews: SocialNewsItem[]; // [1.10] 주차 사회 소식 3개
};

// seasonName → 상세 정보. 운영진이 직접 등록하는 영역(개요/소식)이라 명시 데이터를 우선 사용.
const DETAIL_BY_SEASON: Record<string, WeeklyDetailInfo> = {
  "2026년, 봄 시즌, 3주차": {
    overview:
      "봄 시즌의 흐름이 완연히 자리 잡은 한 주였습니다.팀 목록 · TEAM ROSTER\n 신규 합류 크루들이 첫 성장 사이클을 완주하며 도전율이 크게 올랐고, 팀별 실무 프로젝트가 본격 궤도에 올랐어요. 중간 점검을 앞두고 전반적으로 밀도 높은 활동이 이어진 주차였습니다.",
    seasonRestCrews: 12,
    socialNews: [
      { category: "기술", title: "차세대 온디바이스 AI, 모바일 시장 판도를 흔들다", source: "테크리뷰" },
      { category: "경제", title: "청년 창업 지원 예산 전년 대비 30% 확대 편성", source: "경제일보" },
      { category: "사회", title: "전국 대학가, 봄 학기 동아리 활동 재개 열기", source: "한청신문" },
    ],
  },
  "2026년, 봄 시즌, 2주차": {
    overview:
      "한 주 사이 크루들의 손발이 빠르게 맞춰졌습니다. 파트별 협업이 안정화되며 성장 성공율이 반등했고, 첫 주 휴식 후 복귀한 크루들의 재도전이 두드러진 주차였습니다.",
    seasonRestCrews: 9,
    socialNews: [
      { category: "기술", title: "오픈소스 LLM 생태계, 스타트업 진입장벽 낮춘다", source: "테크리뷰" },
      { category: "문화", title: "도심 속 팝업 전시, MZ세대 발길 이어져", source: "컬처위크" },
      { category: "경제", title: "고용 지표 개선세… 청년 취업률 소폭 상승", source: "경제일보" },
    ],

  },
  "2026년, 봄 시즌, 1주차": {
    overview:
      "새 시즌의 첫 출발입니다. 오리엔테이션과 팀 빌딩을 마친 크루들이 첫 성장 목표를 설정하고 활동을 시작했어요. 도전의 설렘이 가득했던, 기준점이 되는 한 주였습니다.",
    seasonRestCrews: 6,
    socialNews: [
      { category: "사회", title: "새 학기 시작, 캠퍼스에 활력 돌아오다", source: "한청신문" },
      { category: "기술", title: "AI 코딩 어시스턴트, 신입 개발자 학습 곡선 단축", source: "테크리뷰" },
      { category: "경제", title: "봄철 소비 심리 회복… 내수 진작 기대감", source: "경제일보" },
    ],
  },
};

// 명시 데이터가 없는 주차용 deterministic fallback.
const seededPick = <T,>(arr: T[], seed: number): T => {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return arr[Math.floor(frac * arr.length)] ?? arr[0];
};

const FALLBACK_OVERVIEWS = [
  "전반적으로 안정적인 활동이 이어진 한 주였습니다. 크루들이 각자의 성장 목표를 향해 꾸준히 도전했고, 팀별 협업도 무리 없이 진행되었습니다.",
  "도전의 열기가 뜨거웠던 주차입니다. 성장 사이클을 완주한 크루들이 늘며 성공율이 견조하게 유지되었고, 팀 간 선의의 경쟁이 활발했습니다.",
  "차분히 내실을 다진 한 주였습니다. 실무 프로젝트의 완성도를 끌어올리는 데 집중하며, 크루들의 역량 강화가 두드러진 주차였습니다.",
];

const FALLBACK_NEWS: SocialNewsItem[][] = [
  [
    { category: "기술", title: "생성형 AI, 산업 전반으로 빠르게 확산", source: "테크리뷰" },
    { category: "경제", title: "청년 일자리 정책, 민관 협력 강화 흐름", source: "경제일보" },
    { category: "사회", title: "지역 청년 커뮤니티 활동, 전국으로 확대", source: "한청신문" },
  ],
  [
    { category: "문화", title: "청년 창작자 플랫폼, 신규 콘텐츠 급증", source: "컬처위크" },
    { category: "기술", title: "데이터 직군 채용 수요 꾸준한 상승세", source: "테크리뷰" },
    { category: "경제", title: "스타트업 투자 심리, 점진적 회복 신호", source: "경제일보" },
  ],
];

const seasonSeed = (seasonName: string): number => {
  let sum = 0;
  for (let i = 0; i < seasonName.length; i += 1) sum += seasonName.charCodeAt(i) * (i + 1);
  return sum;
};

// seasonName 으로 상세 정보를 조회. 명시 데이터 우선, 없으면 deterministic fallback.
export const getWeeklyDetailInfo = (seasonName: string): WeeklyDetailInfo => {
  const explicit = DETAIL_BY_SEASON[seasonName];
  if (explicit) return explicit;
  const seed = seasonSeed(seasonName);
  return {
    overview: seededPick(FALLBACK_OVERVIEWS, seed),
    seasonRestCrews: 5 + (seed % 11),
    socialNews: seededPick(FALLBACK_NEWS, seed + 7),
  };
};
