// 윤재윤 — TYPICAL (자연스러운 중간 값)
export const CLUSTER3_DUMMY_PROFILE = {
  reliabilityRate: 87,
  engName: 'YUN JAEYUN',
  pointsData: { dangam: 25, injeolmi: 12, eoheung: 8 },
  gradeStats: { avgPercentile: 30, grade: 3, gradeLabel: '정 2품' },
  growthPeriodStats: {
    approvedWeeks: 18,
    unapprovedWeeks: 3,
    restWeeks: 2,
    clubBreakWeeks: 1,
    availableWeeks: 24,
    restSeasons: 1,
    approvedSeasons: 3,
  },
};

export const CLUSTER3_DUMMY_ARCHIVES = [
  'https://brunch.co.kr/@sample/marketing-channel',
  'https://www.youtube.com/@sample-channel',
  'https://blog.naver.com/sample-marketing',
  'https://www.instagram.com/sample_marketing/',
  '',
  '',
  '',
  '',
  '',
  '',
];

export const CLUSTER3_DUMMY_ARCHIVE_CHANNELS = [
  'instagram', 'youtube', 'blog', 'tistory', 'twitter',
  'threads', 'tiktok', 'behance', 'etc', 'etc',
];

export const CLUSTER3_DUMMY_OUTPUTS = [
  'https://brunch.co.kr/@sample/top-work-1',
  'https://medium.com/@sample/top-work-2',
  'https://blog.naver.com/sample/top-work-3',
  '',
  '',
];

export const CLUSTER3_DUMMY_OUTPUT_CHANNELS = [
  'threads', 'youtube', 'tiktok', 'youtube', 'tistory',
];

export const CLUSTER3_DUMMY_DETAILS = [
  'https://brunch.co.kr/@sample/detail-1',
  'https://medium.com/@sample/detail-2',
  'https://blog.naver.com/sample/detail-3',
  'https://www.instagram.com/p/sample-detail-4/',
  '',
  '',
  '',
  '',
  '',
  '',
];

export const CLUSTER3_DUMMY_DETAIL_CHANNELS = [
  'youtube', 'twitter', 'youtube', 'threads', 'instagram',
  'instagram', 'instagram', 'instagram', 'youtube', 'threads',
];

// Output Top 5 상세 카드 데이터 (윤재윤 기준 샘플)
export const CLUSTER3_DUMMY_OUTPUT_CARDS: any[] = [
  {
    id: 1,
    mainTitle: '브랜드 런칭 캠페인',
    subTitle: '신규 뷰티 브랜드의 온오프라인 통합 런칭 캠페인을 기획·운영하며 초기 시장 진입에 기여했습니다.',
    contribution: 70,
    platform: '유튜브',
    roleDescription: '전체 기획 및 팀 리딩, 콘텐츠 제작 총괄',
    roles: ['leading', 'planning', 'execution', 'communication'],
    tools: ['notion', 'figma', 'photoshop', 'premiere', 'chatgpt'],
    periodStartYear: 2024, periodStartMonth: 3, periodStartDay: 2,
    periodEndYear: 2024, periodEndMonth: 6, periodEndDay: 30,
    mainImage: '/images/0/1/3.png',
    subImages: ['/images/0/1/1.png', '/images/0/1/5.png'],
    mainImageCaption: '캠페인 메인 비주얼',
    subImageCaptions: ['팀 협업', '런칭 이벤트'],
    metrics: ['조회 15만', '참여율 8.2%', '구독 +3.2K', 'CPC 320원', '전환 1.8%', 'ROAS 470%'],
    report: '초기 3개월 누적 조회수 15만을 돌파하며 브랜드 인지도를 빠르게 확보했습니다.',
    insight: '런칭 초기 타겟 정의를 구체화한 덕분에 광고비 효율이 크게 개선되었고, 크리에이터 협업이 ROAS 향상의 핵심 요인이었습니다. 이후 콘텐츠 포맷을 재사용 가능하게 모듈화한 것이 운영 비용 절감에 큰 도움이 되었습니다.',
    links: ['https://brunch.co.kr/@sample/top-work-1', 'https://www.instagram.com/sample_campaign/', ''],
  },
  {
    id: 2,
    mainTitle: 'SNS 운영 리뉴얼',
    subTitle: '기존 운영 방식 전면 재설계로 팔로워 증가율 3배 달성.',
    contribution: 50,
    platform: '인스타그램',
    roleDescription: '콘텐츠 기획, 인사이트 분석 및 개선 제안',
    roles: ['planning', 'analysis', 'production'],
    tools: ['figma', 'canva', 'chatgpt', 'excel'],
    periodStartYear: 2023, periodStartMonth: 9, periodStartDay: 1,
    periodEndYear: 2024, periodEndMonth: 2, periodEndDay: 28,
    mainImage: '/images/0/1/2.png',
    subImages: ['/images/0/1/4.png', '/images/0/1/1.png'],
    mainImageCaption: '리뉴얼 피드',
    subImageCaptions: ['분석 대시보드', ''],
    metrics: ['팔로워 +210%', '도달 4.5배', '릴스 평균 조회 8만', '저장률 4.8%', '', ''],
    report: '피드 톤·포스팅 주기를 개편하여 팔로워 증가율과 리치를 크게 향상시켰습니다.',
    insight: '사용자 세그먼트별 콘텐츠를 AB 테스트로 검증하며 운영해나간 것이 주효했고, 분석 주기를 주 1회로 고정한 것이 빠른 의사결정에 결정적이었습니다.',
    links: ['https://medium.com/@sample/top-work-2', '', ''],
  },
  {
    id: 3,
    mainTitle: '자체 채널 콘텐츠 시리즈',
    subTitle: '콘텐츠 포맷 실험을 통해 구독자 전환율을 높인 기획 중심 프로젝트.',
    contribution: 60,
    platform: '유튜브',
    roleDescription: '기획/편집 디렉션',
    roles: ['planning', 'production', 'analysis'],
    tools: ['premiere', 'photoshop', 'notion'],
    periodStartYear: 2024, periodStartMonth: 1, periodStartDay: 10,
    periodEndYear: 2024, periodEndMonth: 5, periodEndDay: 20,
    mainImage: '/images/0/1/5.png',
    subImages: ['/images/0/1/3.png', '/images/0/1/2.png'],
    mainImageCaption: '대표 썸네일',
    subImageCaptions: ['스토리보드', '편집 화면'],
    metrics: ['평균 조회 6만', '구독 전환 2.4%', '댓글 +180%', '유지율 58%', '', ''],
    report: '시리즈 기획을 통해 조회수 편차를 줄이고 안정적인 구독 전환을 이끌어냈습니다.',
    insight: '시리즈물 기획이 플랫폼 알고리즘과 결합되면서 지속 가시성을 확보했고, 특히 인트로 포맷 고정이 유지율 개선에 결정적이었습니다.',
    links: ['https://blog.naver.com/sample/top-work-3', '', ''],
  },
  {
    id: 4,
    mainTitle: '', subTitle: '', contribution: 0, platform: '',
    roleDescription: '', roles: [], tools: [],
    periodStartYear: null, periodStartMonth: null, periodStartDay: null,
    periodEndYear: null, periodEndMonth: null, periodEndDay: null,
    mainImage: null, subImages: [null, null],
    mainImageCaption: '', subImageCaptions: ['', ''],
    metrics: ['', '', '', '', '', ''], report: '', insight: '', links: ['', '', ''],
  },
  {
    id: 5,
    mainTitle: '', subTitle: '', contribution: 0, platform: '',
    roleDescription: '', roles: [], tools: [],
    periodStartYear: null, periodStartMonth: null, periodStartDay: null,
    periodEndYear: null, periodEndMonth: null, periodEndDay: null,
    mainImage: null, subImages: [null, null],
    mainImageCaption: '', subImageCaptions: ['', ''],
    metrics: ['', '', '', '', '', ''], report: '', insight: '', links: ['', '', ''],
  },
];

type Cluster3UserData = {
  profile: typeof CLUSTER3_DUMMY_PROFILE;
  archives: string[];
  archiveChannels: string[];
  outputs: string[];
  outputChannels: string[];
  details: string[];
  detailChannels: string[];
};

const OVERFLOW_LONG_URL = 'https://very-long-overflow-test-domain.example.com/path/segment/with/many/parts/to-test-input-max-length-constraints/and-additional-long-query-params?utm_source=overflow&utm_medium=test';

export const CLUSTER3_DUMMY_BY_USER: Record<string, Cluster3UserData> = {
  // 1) 윤재윤 — TYPICAL: 자연스러운 중간 값
  "윤재윤": {
    profile: CLUSTER3_DUMMY_PROFILE,
    archives: CLUSTER3_DUMMY_ARCHIVES,
    archiveChannels: CLUSTER3_DUMMY_ARCHIVE_CHANNELS,
    outputs: CLUSTER3_DUMMY_OUTPUTS,
    outputChannels: CLUSTER3_DUMMY_OUTPUT_CHANNELS,
    details: CLUSTER3_DUMMY_DETAILS,
    detailChannels: CLUSTER3_DUMMY_DETAIL_CHANNELS,
  },

  // 2) 전민경 — VOID: 모든 필드 0/빈 문자열
  "전민경": {
    profile: {
      reliabilityRate: 0,
      engName: '',
      pointsData: { dangam: 0, injeolmi: 0, eoheung: 0 },
      gradeStats: { avgPercentile: 0, grade: 0, gradeLabel: '' },
      growthPeriodStats: {
        approvedWeeks: 0,
        unapprovedWeeks: 0,
        restWeeks: 0,
        clubBreakWeeks: 0,
        availableWeeks: 0,
        restSeasons: 0,
        approvedSeasons: 0,
      },
    },
    archives: ['', '', '', '', '', '', '', '', '', ''],
    archiveChannels: ['', '', '', '', '', '', '', '', '', ''],
    outputs: ['', '', '', '', ''],
    outputChannels: ['', '', '', '', ''],
    details: ['', '', '', '', '', '', '', '', '', ''],
    detailChannels: ['', '', '', '', '', '', '', '', '', ''],
  },

  // 3) 안지혜 — OVERFLOW: 최대치/긴 URL/모든 슬롯 가득
  "안지혜": {
    profile: {
      reliabilityRate: 100,
      engName: 'AHN JIHYE THE OVERFLOW QUEEN OF VERY VERY LONG ENGLISH NAME FOR TESTING',
      pointsData: { dangam: 9999, injeolmi: 9999, eoheung: 9999 },
      gradeStats: { avgPercentile: 1, grade: 1, gradeLabel: '정 1품 최상위 등급 테스트' },
      growthPeriodStats: {
        approvedWeeks: 999,
        unapprovedWeeks: 999,
        restWeeks: 999,
        clubBreakWeeks: 999,
        availableWeeks: 999,
        restSeasons: 99,
        approvedSeasons: 99,
      },
    },
    archives: [
      OVERFLOW_LONG_URL + '/archive-1',
      OVERFLOW_LONG_URL + '/archive-2',
      OVERFLOW_LONG_URL + '/archive-3',
      OVERFLOW_LONG_URL + '/archive-4',
      OVERFLOW_LONG_URL + '/archive-5',
      OVERFLOW_LONG_URL + '/archive-6',
      OVERFLOW_LONG_URL + '/archive-7',
      OVERFLOW_LONG_URL + '/archive-8',
      OVERFLOW_LONG_URL + '/archive-9',
      OVERFLOW_LONG_URL + '/archive-10',
    ],
    archiveChannels: ['instagram', 'youtube', 'blog', 'tistory', 'twitter', 'threads', 'tiktok', 'behance', 'etc', 'etc'],
    outputs: [
      OVERFLOW_LONG_URL + '/output-1',
      OVERFLOW_LONG_URL + '/output-2',
      OVERFLOW_LONG_URL + '/output-3',
      OVERFLOW_LONG_URL + '/output-4',
      OVERFLOW_LONG_URL + '/output-5',
    ],
    outputChannels: ['youtube', 'youtube', 'youtube', 'youtube', 'youtube'],
    details: [
      OVERFLOW_LONG_URL + '/detail-1',
      OVERFLOW_LONG_URL + '/detail-2',
      OVERFLOW_LONG_URL + '/detail-3',
      OVERFLOW_LONG_URL + '/detail-4',
      OVERFLOW_LONG_URL + '/detail-5',
      OVERFLOW_LONG_URL + '/detail-6',
      OVERFLOW_LONG_URL + '/detail-7',
      OVERFLOW_LONG_URL + '/detail-8',
      OVERFLOW_LONG_URL + '/detail-9',
      OVERFLOW_LONG_URL + '/detail-10',
    ],
    detailChannels: ['instagram', 'instagram', 'instagram', 'instagram', 'instagram', 'instagram', 'instagram', 'instagram', 'instagram', 'instagram'],
  },

  // 4) 곽예원 — PARTIAL: 순차 입력의 첫 1~2개만 채움
  "곽예원": {
    profile: {
      reliabilityRate: 45,
      engName: 'KWAK YEWON',
      pointsData: { dangam: 5, injeolmi: 0, eoheung: 0 },
      gradeStats: { avgPercentile: 60, grade: 5, gradeLabel: '정 3품' },
      growthPeriodStats: {
        approvedWeeks: 2,
        unapprovedWeeks: 0,
        restWeeks: 0,
        clubBreakWeeks: 0,
        availableWeeks: 24,
        restSeasons: 0,
        approvedSeasons: 0,
      },
    },
    archives: [
      'https://brunch.co.kr/@yewon',
      'https://medium.com/@yewon',
      '', '', '', '', '', '', '', '',
    ],
    archiveChannels: ['blog', 'tistory', '', '', '', '', '', '', '', ''],
    outputs: [
      'https://brunch.co.kr/@yewon/case-1',
      '', '', '', '',
    ],
    outputChannels: ['blog', '', '', '', ''],
    details: [
      'https://medium.com/@yewon/research-1',
      'https://medium.com/@yewon/research-2',
      '', '', '', '', '', '', '', '',
    ],
    detailChannels: ['tistory', 'tistory', '', '', '', '', '', '', '', ''],
  },

  // 5) 김의환 — MINIMAL: 1자리/단일 항목
  "김의환": {
    profile: {
      reliabilityRate: 1,
      engName: 'K',
      pointsData: { dangam: 1, injeolmi: 1, eoheung: 1 },
      gradeStats: { avgPercentile: 100, grade: 10, gradeLabel: '정 9품' },
      growthPeriodStats: {
        approvedWeeks: 1,
        unapprovedWeeks: 1,
        restWeeks: 1,
        clubBreakWeeks: 1,
        availableWeeks: 1,
        restSeasons: 1,
        approvedSeasons: 1,
      },
    },
    archives: ['https://a.co', '', '', '', '', '', '', '', '', ''],
    archiveChannels: ['etc', '', '', '', '', '', '', '', '', ''],
    outputs: ['https://b.co', '', '', '', ''],
    outputChannels: ['etc', '', '', '', ''],
    details: ['https://c.co', '', '', '', '', '', '', '', '', ''],
    detailChannels: ['etc', '', '', '', '', '', '', '', '', ''],
  },
};
