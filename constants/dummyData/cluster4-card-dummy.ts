// constants/dummyData/cluster4-card-dummy.ts
// TODO: 더미 데이터 — 기획자 확인용, 실서버 노출 안 됨

import { randomCrewProfile } from "@/utils/randomImage";

export const DUMMY_WEEK_CARD_DATA = {
  // === 상단: 주차 제목 + 배지 ===
  title: "2025 여름 시즌, 3주차",
  growthStatus: "성장(성공)",
  date: "2025 - 03 - 23 (월) ~ 2025 - 03 - 30 (일)",
  role: "운영진(앰배서더)",
  weekNumber: 25,
  totalWeeks: 30,
  team: "미디어일이삼사오육칠팔",
  part: "웹툰드라마일이삼사오육",
  stats: { dangam: 25, injeolmi: 30, eoheung: 2 },

  // === 주차 평판 카드 (최소/중간/최대 글자수 혼합) ===
  reputations: [
    {
      id: "rep-1",
      name: "김아", // 최소 (2자)
      gender: "여",
      age: 24,
      school: "한대", // 최소 (2자)
      schoolSuffix: "학교",
      major: "경영", // 최소 (2자)
      majorSuffix: "학과",
      team: "기획", // 최소 (2자)
      teamSuffix: "팀",
      part: "전략파", // 최소 (3자)
      partSuffix: "트",
      nickname: "별명짧", // 최소 (3자)
      rating: 3,
      ratingMax: 10,
      comment: "짧은코멘트입니다", // 최소 (~10자)
      fmScore: 1, // 1자리
      tag: "#힘", // 최소 (2자)
      tagColor: "#00FFBE",
      profileImage: randomCrewProfile(),
    },
    {
      id: "rep-2",
      name: "박준혁", // 중간 (3자)
      gender: "남",
      age: 25,
      school: "성균관", // 중간 (3자)
      schoolSuffix: "대학교",
      major: "컴퓨터공학", // 중간 (5자)
      majorSuffix: "과",
      team: "마케팅전략", // 중간 (4자)
      teamSuffix: "팀",
      part: "브랜드콘텐", // 중간 (4자)
      partSuffix: "츠파트",
      nickname: "디지털마케터", // 중간 (6자)
      rating: 7,
      ratingMax: 10,
      comment: "이번시즌에서가장인상깊었던점은팀워크였습니다정말로", // 중간 (~30자)
      fmScore: 42, // 2자리
      tag: "#추진력있는사람", // 중간 (7자)
      tagColor: "#EBF748",
      profileImage: randomCrewProfile(),
    },
    {
      id: "rep-3",
      name: "알렉산더최", // 최대 (5자)
      gender: "남",
      age: 23,
      school: "한국예술종합", // 최대 (6자)
      schoolSuffix: "학교",
      major: "미디어커뮤니케이션", // 최대 (9자)
      majorSuffix: "학과",
      team: "엔터테인먼트사업", // 최대 (7자)
      teamSuffix: "팀",
      part: "글로벌마케팅전", // 최대 (7자)
      partSuffix: "략파트",
      nickname: "엔비디아구글테슬라쿵", // 최대 (10자)
      rating: 10,
      ratingMax: 10,
      comment: "이번시즌을통해서정말많은것을배웠고특히마케팅전략수립과실행그리고팀원들과의협업과정에서크게성장했다고생각합니다앞으로도계속해서노력", // 최대 (~80자)
      fmScore: 999, // 3자리
      tag: "#추진력추진력추진력력", // 최대 (10자)
      tagColor: "#48F768",
      profileImage: randomCrewProfile(),
    },
  ],

  // === 연계 동료 (최소/중간/최대 글자수 혼합) ===
  colleagues: [
    {
      id: "col-1",
      name: "이수", // 최소 (2자)
      gender: "여",
      age: 22,
      school: "서대", // 최소 (2자)
      schoolSuffix: "학교",
      major: "사회", // 최소 (2자)
      majorSuffix: "학과",
      team: "기획", // 최소 (2자)
      teamSuffix: "팀",
      part: "전략파", // 최소 (3자)
      partSuffix: "트",
      nickname: "전략가", // 최소 (3자)
      date: "2026-03-01 (토)",
      profileImage: randomCrewProfile(),
    },
    {
      id: "col-2",
      name: "정민수", // 중간 (3자)
      gender: "남",
      age: 26,
      school: "성균관", // 중간 (3자)
      schoolSuffix: "대학교",
      major: "컴퓨터공학", // 중간 (5자)
      majorSuffix: "과",
      team: "마케팅전략", // 중간 (4자)
      teamSuffix: "팀",
      part: "브랜드콘텐", // 중간 (4자)
      partSuffix: "츠파트",
      nickname: "코딩마스터", // 중간 (5자)
      date: "2026-03-02 (일)",
      profileImage: randomCrewProfile(),
    },
    {
      id: "col-3",
      name: "알렉산더최", // 최대 (5자)
      gender: "여",
      age: 24,
      school: "한국예술종합", // 최대 (6자)
      schoolSuffix: "학교",
      major: "미디어커뮤니케이션", // 최대 (9자)
      majorSuffix: "학과",
      team: "엔터테인먼트사업", // 최대 (7자)
      teamSuffix: "팀",
      part: "글로벌마케팅전", // 최대 (7자)
      partSuffix: "략파트",
      nickname: "엔비디아구글테슬라쿵", // 최대 (10자)
      date: "2026-03-03 (월)",
      profileImage: randomCrewProfile(),
    },
  ],

  // === 주차 성장률 ===
  growthRate: {
    total: 15,
    completed: 9,
    rate: 60,
  },

  // === 실무 4섹션 ===
  workSections: {
    info: {
      total: 7,
      completed: 5,
      rate: 71,
      cards: [
        { category: "위즈덤", categoryColor: "#FF4A4A", status: "success", mainTitle: "Main Title", body: "CU의 무덤이 몽골에 이어 하와이까지 엽습하는 가운데, 한국 유통업계가 돌파해나가야 하는 코스피는 어디가 쌍봉 양대 산맥일지가 관건입니다. 80일이삼사오육칠팔구십" },
        { category: "에세이", categoryColor: "#EBF748", status: "failed", mainTitle: "Main Title", body: "짧은 본문 텍스트입니다" },
        { category: "인포데스크", categoryColor: "#8F00FF", status: "failed", mainTitle: "Main Title", body: "중간 길이의 본문 텍스트로 대략 서른자 정도 되는 분량을 채워봅니다" },
        { category: "캘린더", categoryColor: "#00FFBE", status: "success", mainTitle: "Main Title", body: "최대 길이 테스트용 본문으로 가능한 한 많은 글자를 채워서 UI가 어디까지 버틸 수 있는지 확인하는 목적의 더미 텍스트이며 팔십자를 목표로 작성하고 있습니다" },
        { category: "포럼", categoryColor: "#48F768", status: "success", mainTitle: "Main Title", body: "포럼 콘텐츠 본문 샘플" },
        { category: "세션", categoryColor: "#48F7EE", status: "success", mainTitle: "Main Title", body: "세션 참여 후기 및 인사이트 공유 내용" },
        { category: "기타a", categoryColor: "#FFFFFF", status: "success", mainTitle: "Main Title", body: "기타 활동 기록" },
      ],
    },
    ability: {
      total: 1,
      completed: 1,
      rate: 100,
      cards: [
        {
          code: "CP09 - UN010",
          category: "[실무 Info]인하우스 & 에이전시",
          rating: 6,
          mainBody: "[마케팅 실무] 현업에서 마케팅 업계를 구성하고 있는 인하우스 와 에이전시 의 개념, 그리고 내부 속성을 알아보자구!",
          subBody: "실무 역량의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재가 매력 매79..",
        },
      ],
    },
    experience: {
      total: 3,
      completed: 2,
      rate: 67,
      cards: [
        {
          code: "EX01 - SFA01",
          category: "[커리어]마케터 Launch",
          rating: 6,
          mainBody: '[역량 파악 & 성장점 분석] "백날 말로만 떠드는 마케팅 커리어가 아니라, 지금 당장 어느 정도로 준비되었는지 그 현실을 뼈저리게 느껴보자구!"',
          subBody: "실무 역량의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재가 매력적으로 보이나 보이지 않나 보일까 보이지 않을까 보이는가 안 보이는가 보여 93...",
        },
        { code: "EX02 - RUA99", category: "[생산성]상호 피드백", rating: 6, mainBody: '[상호 피드백] "100명의 사람이 있으면, 100개의 시각과 관점이 있다고 하지. 과연 내 마케팅은, 내가 의도한대로 전달되고 있는 것이 맞을까?"', subBody: "짧은 서브 텍스트" },
        { code: "EX03 - RUA99", category: "[콘텐츠]마케팅 실무", rating: 6, mainBody: "[콘텐츠 마케팅] \"어떤 제품/서비스더라도, 마케터가 제대로 '표현' 하지 못한다면, 그저 '낙서' 에 불과해.\"", subBody: "중간 길이의 서브타이틀 텍스트로 이 정도면 적당한 분량이 됩니다" },
      ],
    },
    career: {
      total: 5,
      completed: 3,
      rate: 60,
      cards: [
        { grade: "S", date: "2025-12-22 (월)", supervisorName: "김아", supervisorRole: "기획팀 | 네이버 | 사원", categoryTag: "마케팅(바이럴)", currentBid: "0,99", mainBody: "짧은 경력 메인 타이틀", subBody: "짧은 서브", profileImage: randomCrewProfile() },
        {
          grade: "A",
          date: "2025-12-22 (월)",
          supervisorName: "박준혁",
          supervisorRole: "브랜드마케팅 | 에스엠엔터테인먼트 | 과장",
          categoryTag: "마케팅(바이럴) 혹시 몰라",
          currentBid: "0,99",
          mainBody: "실무 역량의 메인타이틀이 브랜딩 입장에서 어디까지 소화되고 보여져야 UI상 문제가 없을지...",
          subBody: "실무 경력의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재의 매력도가 보여지나",
          profileImage: randomCrewProfile(),
        },
        {
          grade: "D",
          date: "2025-12-22 (월)",
          supervisorName: "알렉산더워싱턴최",
          supervisorRole: "글로벌마케팅전략사업부 | 에스엠엔터테인먼트코리아글로벌 | 수석매니저",
          categoryTag: "콘텐츠마케팅(퍼포먼스바이럴) 혹시 모를 카테고리",
          currentBid: "999,999",
          mainBody: "최대길이메인타이틀로이정도면충분히길텍스트가될것이라고생각하며브랜딩관점에서어디까지소화가능한지확인하는목적으로작성합니다아마도이정도면충분할것",
          subBody: "최대길이서브타이틀로가능한한많은글자를채워서어디까지보이는지확인하려는목적의텍스트이며구십삼자정도를목표로쓰고있습니다만약더필요하면더추가하겠습니다여기까지",
          profileImage: randomCrewProfile(),
        },
      ],
    },
  },
};
