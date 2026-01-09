"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { WeekData, weeklyData } from "@/data/weeklyData";

interface Cluster4CardContentProps {
  weekData?: WeekData;
}

interface SelectedColleague {
  id: number;
  name: string;
  gender: string;
  age: number;
  profileImg: string;
  university: string;
  major: string;
  team: string;
  part: string;
  nickname: string;
  rank: number;
  message: string;
}

const Cluster4CardContent = ({ weekData }: Cluster4CardContentProps) => {
  // 세션 및 본인 프로필 여부 확인
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get('userId');
  const isOwner = !urlUserId || (session?.user?.id === urlUserId);
  // 모달 상태 관리
  const [workInfoModalOpen, setWorkInfoModalOpen] = useState(false);
  const [workAbilityModalOpen, setWorkAbilityModalOpen] = useState(false);
  const [workExpModalOpen, setWorkExpModalOpen] = useState(false);
  const [workCareerModalOpen, setWorkCareerModalOpen] = useState(false);

  // 상단 섹션 선택 모달 상태
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [headerModalOpen, setHeaderModalOpen] = useState(false);
  const [headerModalType, setHeaderModalType] = useState<'본인' | '타크루' | null>(null);

  // 연계 동료 선택 상태 (1st, 2nd, 3rd 각각 별도 저장)
  const [selectedColleagues, setSelectedColleagues] = useState<SelectedColleague[]>([
    {
      id: 7,
      name: "윤서영",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 5.jpg",
      university: "중앙대",
      major: "영화학과",
      team: "엔터테인먼트",
      part: "로봇",
      nickname: "영상편집마스터",
      rank: 1,
      message: "",
    },
    {
      id: 10,
      name: "오승우",
      gender: "남",
      age: 25,
      profileImg: "/images/0/crew profile/남 8.webp",
      university: "건국대",
      major: "미디어콘텐츠학과",
      team: "미디어",
      part: "AI",
      nickname: "아이디어뱅크",
      rank: 2,
      message: "",
    },
  ]);

  // 크루 검색어 상태
  const [crewSearchQuery, setCrewSearchQuery] = useState("");

  // 타크루 모달 상태 (주차 평판 카드 편집)
  const [selectedCrewForReputation, setSelectedCrewForReputation] = useState<number | null>(null);
  const [reputationEditData, setReputationEditData] = useState<{
    rating: number;
    content: string;
    keyword: string;
  }>({ rating: 0, content: "", keyword: "" });
  const [otherCrewSearchQuery, setOtherCrewSearchQuery] = useState("");

  // 주차 평판 카드 상세보기 모달 상태
  const [reputationViewModalOpen, setReputationViewModalOpen] = useState(false);
  const [selectedReputationCard, setSelectedReputationCard] = useState<any>(null);

  // 연계 동료 카드 상세보기 모달 상태
  const [colleagueViewModalOpen, setColleagueViewModalOpen] = useState(false);
  const [selectedColleagueCard, setSelectedColleagueCard] = useState<any>(null);
  const [selectedColleagueIndex, setSelectedColleagueIndex] = useState<number>(0);

  // 실무 정보 카드 상세보기 모달 상태
  const [workInfoViewModalOpen, setWorkInfoViewModalOpen] = useState(false);
  const [selectedWorkInfoCard, setSelectedWorkInfoCard] = useState<any>(null);

  // 실무 역량 카드 상세보기 모달 상태
  const [workAbilityViewModalOpen, setWorkAbilityViewModalOpen] = useState(false);

  // 실무 경험 카드 상세보기 모달 상태
  const [workExpViewModalOpen, setWorkExpViewModalOpen] = useState(false);
  const [selectedWorkExpCard, setSelectedWorkExpCard] = useState<any>(null);

  // 실무 경력 카드 상세보기 모달 상태
  const [workCareerViewModalOpen, setWorkCareerViewModalOpen] = useState(false);
  const [selectedWorkCareerCard, setSelectedWorkCareerCard] = useState<any>(null);

  // 동료 삭제 함수
  const removeColleague = (id: number) => {
    setSelectedColleagues(prev => prev.filter(c => c.id !== id));
  };

  // 동료 추가 함수 (순위 지정)
  const addColleague = (user: typeof allCrewData[0], rank: number) => {
    if (selectedColleagues.length >= 3) return;
    if (selectedColleagues.find(c => c.id === user.id)) return;
    // 해당 순위가 이미 사용중인지 확인
    if (selectedColleagues.find(c => c.rank === rank)) return;

    const newColleague = { ...user, message: "", rank };
    const newList = [...selectedColleagues, newColleague];

    // rank 순서대로 정렬
    newList.sort((a, b) => a.rank - b.rank);

    setSelectedColleagues(newList);
  };

  // 메시지 업데이트 함수
  const updateColleagueMessage = (id: number, message: string) => {
    setSelectedColleagues(prev => prev.map(c =>
      c.id === id ? { ...c, message } : c
    ));
  };

  // 타크루 선택 함수 (주차 평판 편집용)
  const selectCrewForReputation = (crewId: number) => {
    const crew = reputationData.find(u => u.id === crewId);
    if (crew && !crew.isEmpty) {
      setSelectedCrewForReputation(crewId);
      setReputationEditData({
        rating: crew.rating,
        content: crew.description,
        keyword: crew.tagText.replace('#', ''),
      });
    }
  };

  // 타크루 편집 뒤로가기
  const backToCrewList = () => {
    setSelectedCrewForReputation(null);
    setReputationEditData({ rating: 0, content: "", keyword: "" });
  };

  // 서브 타이틀 글자수 관리
  const [subTitleText, setSubTitleText] = useState("");

  // 기본값 설정
  const defaultImage = "/images/0/cluster 4/주차 이미지/여름 3주차 (7월 3주차).png";
  const defaultTitle = "2025 여름 시즌, 3주차";
  const restImage = "/images/0/cluster%204/주차%20이미지/휴식(개인,공식).png";

  // 휴식 모드 체크 (휴식(개인), 휴식(공식)일 때 모든 카드 비활성화)
  const isRestMode = weekData?.growthStatus?.includes('휴식') || false;

  // 휴식 모드일 때는 휴식 전용 이미지 사용
  const currentImage = isRestMode ? restImage : (weekData?.image || defaultImage);
  const currentTitle = weekData?.shortTitle || defaultTitle;

  // 성장 상태에 따른 뱃지 정보
  const getStatusBadgeInfo = (status: string | undefined) => {
    switch (status) {
      case '성공':
        return {
          className: 'success',
          text: '성장(성공)',
          icon: '/images/0/cluster 4/icon/icon - 성장(성공).png'
        };
      case '실패':
        return {
          className: 'fail',
          text: '성장(실패)',
          icon: '/images/0/cluster 4/icon/icon - 성장(실패).png'
        };
      case '휴식(개인)':
        return {
          className: 'rest-personal',
          text: '휴식(개인)',
          icon: '/images/0/cluster 4/icon/icon - 휴식(개인).png'
        };
      case '휴식(공식)':
        return {
          className: 'rest-official',
          text: '휴식(공식)',
          icon: '/images/0/cluster 4/icon/icon - 휴식(공식).png'
        };
      default:
        return {
          className: 'success',
          text: '성장(성공)',
          icon: '/images/0/cluster 4/icon/icon - 성장(성공).png'
        };
    }
  };

  const statusBadgeInfo = getStatusBadgeInfo(weekData?.growthStatus);

  // 이전/다음 주차 계산
  const currentIndex = weeklyData.findIndex(w => w.id === weekData?.id);
  const prevWeekId = currentIndex < weeklyData.length - 1 ? weeklyData[currentIndex + 1]?.id : null;
  const nextWeekId = currentIndex > 0 ? weeklyData[currentIndex - 1]?.id : null;

  // 태그 색상 배열
  const tagColors = ['tag--pink', 'tag--red', 'tag--yellow', 'tag--purple', 'tag--green', 'tag--cyan', 'tag--mint', 'tag--dark'];

  // 주차 평판 데이터
  const reputationData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 3.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 3.5,
      ratingCount: "7 / 10",
      description: "팀 프로젝트에서 항상 적극적으로 참여하고 아이디어를 제시해주셔서 정말 감사했습니다. 덕분에 좋은 결과물을 만들 수 있었어요. 앞으로도 함께 일하고 싶은 동료입니다.",
      fm: 325,
      tagColor: 'tag--mint',
      tagText: '#추진력추진력추',
    },
    {
      id: 2,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/남 5.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 4.5,
      ratingCount: "9 / 10",
      description: "리더십이 뛰어나고 팀원들을 잘 이끌어주셨습니다. 어려운 상황에서도 침착하게 문제를 해결하는 모습이 인상적이었어요. 배울 점이 정말 많은 분이십니다.",
      fm: 325,
      tagColor: 'tag--purple',
      tagText: '#리더십리더십리',
    },
    {
      id: 3,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 7.webp",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      rating: 2.5,
      ratingCount: "5 / 10",
      description: "창의적인 아이디어로 프로젝트에 새로운 방향을 제시해주셨습니다. 독특한 시각으로 문제를 바라보는 능력이 탁월해요. 함께 브레인스토밍하면 좋은 결과가 나옵니다.",
      fm: 325,
      tagColor: 'tag--yellow',
      tagText: '#창의력창의력창',
    },
    {
      id: 4,
      name: "-",
      gender: "",
      age: "",
      profileImg: "",
      university: "",
      major: "",
      team: "",
      part: "",
      nickname: "",
      rating: 0,
      ratingCount: "- / 10",
      description: "-",
      fm: "-",
      tagColor: 'tag--dark',
      tagText: '-',
      isEmpty: true,
    },
  ];

  // 크루 검색용 더미 데이터
  const allCrewData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 3.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
    },
    {
      id: 2,
      name: "이준혁",
      gender: "남",
      age: 26,
      profileImg: "/images/0/crew profile/남 2.jpg",
      university: "연세대",
      major: "경영학과",
      team: "미디어",
      part: "브랜드",
      nickname: "마케팅마스터",
    },
    {
      id: 3,
      name: "박소연",
      gender: "여",
      age: 23,
      profileImg: "/images/0/crew profile/여 1.jpg",
      university: "고려대",
      major: "심리학과",
      team: "콘텐츠",
      part: "스타일",
      nickname: "콘텐츠퀸",
    },
    {
      id: 4,
      name: "정민수",
      gender: "남",
      age: 27,
      profileImg: "/images/0/crew profile/남 4.jpg",
      university: "성균관대",
      major: "컴퓨터공학",
      team: "헬스케어",
      part: "AI",
      nickname: "코딩천재개발자",
    },
    {
      id: 5,
      name: "최유진",
      gender: "여",
      age: 25,
      profileImg: "/images/0/crew profile/여 6.jpg",
      university: "이화여대",
      major: "디자인학부",
      team: "스타일",
      part: "브랜드",
      nickname: "디자인요정",
    },
    {
      id: 6,
      name: "강동현",
      gender: "남",
      age: 28,
      profileImg: "/images/0/crew profile/남 7.jpg",
      university: "한양대",
      major: "광고홍보학과",
      team: "라이프",
      part: "자동차",
      nickname: "광고의신",
    },
    {
      id: 7,
      name: "윤서영",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 5.jpg",
      university: "중앙대",
      major: "영화학과",
      team: "엔터테인먼트",
      part: "로봇",
      nickname: "영상편집마스터",
    },
    {
      id: 8,
      name: "임재현",
      gender: "남",
      age: 26,
      profileImg: "/images/0/crew profile/남 5.jpg",
      university: "서강대",
      major: "경제학과",
      team: "푸드",
      part: "디저트",
      nickname: "전략가임재현",
    },
    {
      id: 9,
      name: "한지민",
      gender: "여",
      age: 23,
      profileImg: "/images/0/crew profile/여 7.webp",
      university: "숙명여대",
      major: "언론정보학부",
      team: "콘텐츠",
      part: "내돈내산",
      nickname: "소통의달인",
    },
    {
      id: 10,
      name: "오승우",
      gender: "남",
      age: 25,
      profileImg: "/images/0/crew profile/남 8.webp",
      university: "건국대",
      major: "미디어콘텐츠학과",
      team: "미디어",
      part: "AI",
      nickname: "아이디어뱅크",
    },
    {
      id: 11,
      name: "김하늘",
      gender: "여",
      age: 22,
      profileImg: "/images/0/crew profile/여 2.jpg",
      university: "동국대",
      major: "광고홍보학과",
      team: "스타일",
      part: "스타일",
      nickname: "카피라이터하늘",
    },
    {
      id: 12,
      name: "신동욱",
      gender: "남",
      age: 27,
      profileImg: "/images/0/crew profile/남 3.jpg",
      university: "홍익대",
      major: "시각디자인과",
      team: "헬스케어",
      part: "로봇",
      nickname: "UX디자이너",
    },
  ];

  // 검색 필터링된 크루 목록 (이름과 닉네임으로만 검색)
  const filteredCrewData = allCrewData.filter(user => {
    if (!crewSearchQuery) return true;
    const query = crewSearchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.nickname.toLowerCase().includes(query)
    );
  }).filter(user => !selectedColleagues.find(c => c.id === user.id));

  // 연계 동료 데이터
  const colleagueData = [
    {
      id: 1,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/여 5.jpg",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "2025 - 12 - 22 (월)",
      message: "프로젝트에서 많은 도움을 주셔서 정말 감사합니다. 덕분에 성장할 수 있었어요! 앞으로도 함께 좋은 결과물 만들어가요. 항상 응원하겠습니다. 파이팅!일이삼사오육칠팔구십",
    },
    {
      id: 2,
      name: "김미현",
      gender: "여",
      age: 24,
      profileImg: "/images/0/crew profile/남 8.webp",
      university: "서울대",
      major: "미디어커뮤니케이션",
      team: "엔터테인먼트",
      part: "내돈내산",
      nickname: "엔비디아구글태슬라킹",
      date: "2025 - 12 - 22 (월)",
      message: "항상 응원해주시고 조언해주셔서 감사합니다. 앞으로도 잘 부탁드려요! 함께 성장하며 멋진 프로젝트 완성해봐요. 최고의 파트너입니다!일이삼사오육칠팔구십 최고의 파트너입니다!!!!!!!",
    },
    {
      id: 3,
      name: "-",
      gender: "-",
      age: "-",
      profileImg: "",
      university: "-",
      major: "-",
      team: "-",
      part: "-",
      nickname: "-",
      date: "0000 - 00 - 00 (일)",
      message: "",
      isEmpty: true,
    },
  ];

  // 실무 정보 카드 데이터
  const workInfoCards = [
    { id: 1, title: "Main Title", verified: true, category: "위즈덤", tagColor: "tag--red", status: "success", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 위즈덤.png", isFruit: true },
    { id: 2, title: "Main Title", verified: true, category: "에세이", tagColor: "tag--yellow", status: "fail", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 에세이.png", isFruit: true, isFailed: true },
    { id: 3, title: "Main Title", verified: true, category: "인포데스크", tagColor: "tag--purple", status: "fail", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 인포데스크.png", isFruit: true, isFailed: true },
    { id: 4, title: "Main Title", verified: true, category: "캘린더", tagColor: "tag--dark", status: "success", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 캘린더.png", isFruit: true },
    { id: 5, title: "Main Title", verified: true, category: "포럼", tagColor: "tag--green", status: "waiting", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 포럼.png", isFruit: true },
    { id: 6, title: "Main Title", verified: true, category: "세션", tagColor: "tag--cyan", status: "success", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 세션.png", isFruit: true },
    { id: 7, title: "Main Title", verified: true, category: "기타a", tagColor: "tag--mint", status: "waiting", icon: "/images/0/cluster 4/icon/실무 정보/실무 정보 - 기타a.png", isFruit: false },
    { id: 8, title: "Main Title", verified: true, category: "", tagColor: "", status: "", icon: "", isEmpty: true },
    { id: 9, title: "Main Title", verified: true, category: "", tagColor: "", status: "", icon: "", isEmpty: true },
  ];

  // 실무 경험 카드 데이터 (rating * 2 = 점수, 반개당 1점)
  const workExpCards = [
    { id: 1, code: "EX01 - SFA01", badge: "[커리어]마케터 Launch", title: "Main Title", verified: true, rating: 4, ratingCount: "8 / 10", hasWeb: true, icon: "/images/0/cluster%204/icon/실무%20경험/실무%20경험%20-%20[커리어]마케터%20Launch.png" },
    { id: 2, code: "EX02 - RUA99", badge: "[생산성]상호 피드백", title: "Main Title", verified: true, rating: 3.5, ratingCount: "7 / 10", hasWeb: true, icon: "/images/0/cluster%204/icon/실무%20경험/실무%20경험%20-%20[생산성]상호%20피드백.png" },
    { id: 3, code: "EX03 - RUA99", badge: "[콘텐츠]마케팅 실무", title: "Main Title", verified: true, rating: 3, ratingCount: "6 / 10", hasWeb: false, icon: "/images/0/cluster%204/icon/실무%20경험/실무%20경험%20-%20[콘텐츠]마케팅%20실무.png" },
    { id: 4, code: "", badge: "", title: "Main Title", verified: true, rating: 0, ratingCount: "- / 10", hasWeb: false, isEmpty: true, icon: "" },
  ];

  // 실무 경력 카드 데이터
  const workCareerCards = [
    { id: 1, code: "AA22-11111", badge: "마케팅|마이릿|축시 출시", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/배민.png", supervisorImg: "/images/0/crew profile/남 2.jpg", supervisorName: "이준혁", supervisorDept: "서비스기획팀", supervisorCompany: "우아한형제들", supervisorPosition: "대리", statusBadge: "/images/0/cluster 4/icon/5 강화 성공.png", grade: "S" },
    { id: 2, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/sm.webp", supervisorImg: "/images/0/crew profile/여 1.jpg", supervisorName: "김민지", supervisorDept: "마케팅팀", supervisorCompany: "네이버", supervisorPosition: "과장", statusBadge: "/images/0/cluster 4/icon/6 강화 대기.png", grade: "A" },
    { id: 3, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/Logo_tvN.svg.png", supervisorImg: "/images/0/crew profile/남 4.jpg", supervisorName: "박성호", supervisorDept: "전략기획팀", supervisorCompany: "카카오", supervisorPosition: "차장", statusBadge: "/images/0/cluster 4/icon/8 해당 없음.png", isNotApplicable: true, grade: "B" },
    { id: 4, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/naver%20webtoon.png", supervisorImg: "/images/0/cluster 4/4-1-card/조지 워싱턴.png", supervisorName: "조지 워싱턴", supervisorDept: "", supervisorCompany: "", supervisorPosition: "", statusBadge: "/images/0/cluster 4/icon/5 강화 성공.png", grade: "S" },
    { id: 5, code: "AA22-11111", badge: "마케팅|마이릿|축시 진행", title: "Main Title", verified: true, date: "2025 - 12 - 22 (월)", likes: "0.99", hasWeb: true, icon: "/images/0/CJ_logo.svg.png", supervisorImg: "/images/0/crew profile/남 7.jpg", supervisorName: "정재원", supervisorDept: "개발팀", supervisorCompany: "쿠팡", supervisorPosition: "사원", statusBadge: "/images/0/cluster 4/icon/8 해당 없음.png", isNotApplicable: true, grade: "C" },
    { id: 6, code: "", badge: "", title: "Main Title", verified: true, date: "0000 - 00 - 00 (월)", likes: "0.99", hasWeb: false, isEmpty: true, icon: "", supervisorImg: "", supervisorName: "", supervisorDept: "", supervisorCompany: "", supervisorPosition: "", statusBadge: "", grade: "" },
  ];

  // 별점 렌더링 함수 (반개 지원)
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // 채워진 별
        stars.push(
          <img
            key={i}
            src="/images/0/cluster 4/icon/icon - star.png"
            alt="star"
            className="star filled"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        // 반개 별
        stars.push(
          <span key={i} className="star half">
            <img src="/images/0/cluster 4/icon/icon - star.png" alt="star" className="star-half-filled" />
            <img src="/images/0/cluster 4/icon/icon - empty star.png" alt="star" className="star-half-empty" />
          </span>
        );
      } else {
        // 빈 별
        stars.push(
          <img
            key={i}
            src="/images/0/cluster 4/icon/icon - empty star.png"
            alt="star"
            className="star empty"
          />
        );
      }
    }
    return stars;
  };

  return (
    <div className="cluster4-card-content weekly-card-detail">
      {/* 탭 영역 */}
      <div className="top-tabs-wrapper">
        <div className="top-tabs">
          <Link href="/cluster-4" className="tab active">
            <img src="/images/0/cluster%204/icon/icon%20-%20%EC%A0%84%EA%B5%AC.png" alt="전구" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Weekly Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
          <Link href="/cluster-4-1" className="tab">
            <img src="/images/0/cluster%204/icon/icon%20-%20book.png" alt="book" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Season Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
        </div>
        <div className="nav-buttons">
          {prevWeekId ? (
            <Link href={`/cluster-4-card/${prevWeekId}`} className="nav-btn-prev">
              <span>이전 주</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20left.png" alt="left" className="arrow-icon" />
            </Link>
          ) : (
            <button className="nav-btn-prev disabled" disabled>
              <span>이전 주</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20left.png" alt="left" className="arrow-icon" />
            </button>
          )}
          {nextWeekId ? (
            <Link href={`/cluster-4-card/${nextWeekId}`} className="nav-btn-next">
              <span>다음 주</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20right.png" alt="right" className="arrow-icon" />
            </Link>
          ) : (
            <button className="nav-btn-next disabled" disabled>
              <span>다음 주</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20arrow%20right.png" alt="right" className="arrow-icon" />
            </button>
          )}
          <Link href="/cluster-4" className="nav-btn-filled">
            <img src="/images/0/cluster%204/icon/icon%20-%201.png" alt="list" className="list-icon" />
            <span>전체 목록으로 돌아가기</span>
          </Link>
        </div>
      </div>

      {/* ========== 섹션 1: 주차 이미지 + 헤더 + 평판 + 동료 ========== */}
      <div className="section1-layout">
        {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => setSelectionModalOpen(true)} style={{ cursor: 'pointer' }}>
              <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
            </div>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
        )}
        {/* 왼쪽: 큰 주차 이미지 */}
        <div className="section1-left">
          <div className="main-image-container">
            <img src={currentImage} alt="주차 이미지" className="main-week-image" />
            {/* 뱃지 두 개 */}
            <div className="image-badges">
              <div className="badge-item heart-badge">
                <span className="badge-count">99</span>
                <i className="ti ti-heart"></i>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 정보 영역 */}
        <div className="section1-right">
          {/* 헤더 */}
          <div className="section1-header">
            <div className="header-title-row">
              <h1 className="section1-title">{currentTitle}</h1>
              <div className={`status-badge ${statusBadgeInfo.className}`}>
                <span>{statusBadgeInfo.text}</span>
                <img src={statusBadgeInfo.icon} alt={statusBadgeInfo.text} />
              </div>
            </div>
            <div className="header-info-row">
              <div className="info-badge date">
                <img src="/images/0/cluster 4/icon/icon - 6.png" alt="calendar" />
                <span>2025 - 03 - 23 (월) ~ 2025 - 03 - 30 (일)</span>
              </div>
              <div className="info-badge role">
                <img src="/images/0/cluster 4/icon/Interface/Star-3.png" alt="role" />
                <span>운영진(앰배서더)</span>
              </div>
              <div className="info-badge week">
                <img src="/images/0/cluster 4/icon/icon - 7.png" alt="week" />
                <span><span className="highlight">25</span> / 30 주차</span>
              </div>
            </div>
            <div className="header-info-row2">
              <div className="info-group left">
                <span className="info-item team"><strong>[팀]</strong> <span className="text-gray">미디어</span></span>
                <span className="info-divider">|</span>
                <span className="info-item part"><strong>[파트]</strong> <span className="text-gray">웹툰드라마</span></span>
              </div>
              <div className="info-group right">
                <span className="info-item with-icon">
                  단감
                  <img src="/images/0/cluster 4/icon/icon - 단감.png" alt="단감" className="item-icon" />
                  <strong className="number-value">25</strong>
                  개
                </span>
                <span className="info-divider">·</span>
                <span className="info-item with-icon">
                  인절미
                  <img src="/images/0/cluster 4/icon/icon - 인절미.png" alt="인절미" className="item-icon" />
                  <strong className="number-value">30</strong>
                  개
                </span>
                <span className="info-divider">·</span>
                <span className="info-item with-icon">
                  어흥
                  <img src="/images/0/cluster 4/icon/icon - 어흥.png" alt="어흥" className="item-icon" />
                  <strong className="number-value">-2</strong>
                  개
                </span>
              </div>
            </div>
          </div>

          {/* 주차 평판 */}
          <div className="reputation-section">
            <div className="section-title-row">
              <img src="/images/0/cluster 4/icon/icon - 주차 평판.png" alt="주차 평판" className="section-icon" />
              <span className="section-label">주차 평판</span>
              <span className="section-count"><span className="count-num">3</span>/3</span>
            </div>
            <div className="reputation-cards-grid">
              {reputationData.map((user, index) => {
                const isEmpty = user.isEmpty || isRestMode;
                return (
                <div
                  key={user.id}
                  className={`reputation-card ${isEmpty ? 'empty' : ''}`}
                  onClick={() => {
                    if (!isEmpty) {
                      setSelectedReputationCard(user);
                      setReputationViewModalOpen(true);
                    }
                  }}
                  style={{ cursor: isEmpty ? 'default' : 'pointer' }}
                >
                  <div className="card-profile">
                    <div className="profile-image">
                      {!isEmpty && user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}
                    </div>
                    <div className="profile-info">
                      <div className="profile-name"><span className="text">{isEmpty ? '-' : user.name}</span>{!isEmpty && <> | <span className="text">{user.gender}</span> | <span className="text">{user.age}</span></>}</div>
                      <div className="profile-details">
                        {isEmpty ? (
                          <>
                            <div className="detail-line"><span className="text">-</span></div>
                            <div className="detail-line"><span className="text">&nbsp;</span></div>
                            <div className="detail-line"><span className="text">&nbsp;</span></div>
                          </>
                        ) : (
                          <>
                            <div className="detail-line"><span className="text">{user.university}</span><span className="label">학교</span> | <span className="text">{user.major}</span><span className="label">학과</span></div>
                            <div className="detail-line"><span className="text">{user.team}</span><span className="label">팀</span> | <span className="text">{user.part}</span><span className="label">파트</span></div>
                            <div className="detail-line"><span className="nickname">{user.nickname}</span></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <div className="card-rating">
                    <div className="stars">{renderStars(isEmpty ? 0 : user.rating)}</div>
                    <span className="rating-count">{isEmpty ? '- / 10' : user.ratingCount}</span>
                  </div>
                  <div className="card-description">{isEmpty ? '-' : <>{user.description.slice(0, 20)}... <img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="more-icon" /></>}</div>
                  <div className="card-footer">
                    <span className="fm-badge"><img src="/images/0/cluster 4/icon - wifi.png" alt="wifi" className="wifi-icon" /> FM : {isEmpty ? '-' : user.fm}</span>
                    <span className="footer-divider">|</span>
                    <span className={`tag ${isEmpty ? 'tag--dark' : user.tagColor}`}>{isEmpty ? '-' : user.tagText}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* 연계 동료 */}
          <div className="colleague-section">
            <div className="section-title-row">
              <img src="/images/0/cluster 4/icon/icon - 연계 동료.png" alt="연계 동료" className="section-icon" />
              <span className="section-label">연계 동료</span>
              <span className="section-count"><span className="count-num">2</span>/3</span>
            </div>
            <div className="colleague-cards">
              {colleagueData.map((user, index) => {
                const isEmpty = user.isEmpty || isRestMode;
                return (
                <div
                  key={user.id}
                  className={`colleague-card ${isEmpty ? 'empty' : ''}`}
                  onClick={() => {
                    if (!isEmpty) {
                      setSelectedColleagueCard(user);
                      setSelectedColleagueIndex(index);
                      setColleagueViewModalOpen(true);
                    }
                  }}
                  style={{ cursor: isEmpty ? 'default' : 'pointer' }}
                >
                  <div className="card-profile">
                    <div className="profile-image">
                      {!isEmpty && user.profileImg ? <img src={user.profileImg} alt={user.name} /> : <div className="profile-placeholder"></div>}
                    </div>
                    <div className="profile-info">
                      <div className="profile-name-row">
                        <div className="profile-name"><span className="text">{isEmpty ? '-' : user.name}</span>{!isEmpty && <> | <span className="text">{user.gender}</span> | <span className="text">{user.age}</span></>}</div>
                        <div className="date-view">
                          <span className="date">{isEmpty ? '0000 - 00 - 00 (일)' : user.date}</span>
                          <img src="/images/0/cluster 4/icon/icon - 7 - eye.png" alt="view" className="view-icon" />
                        </div>
                      </div>
                      <div className="profile-details">
                        {isEmpty ? (
                          <span className="text">-</span>
                        ) : (
                          <><span className="text">{user.university}</span><span className="label">학교</span> | <span className="text">{user.major}</span><span className="label">학과</span> | <span className="text">{user.team}</span><span className="label">팀</span> | <span className="text">{user.part}</span><span className="label">파트</span> | <span className="nickname">{user.nickname}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========== 섹션 2: 주차 성장률 + 실무 정보 + 실무 역량 ========== */}
      <div className="section2-layout">
        {/* 주차 성장률 */}
        <div className="growth-rate-header">
          <div className="growth-left">
            <div className="progress-header">
              <span className="growth-title">주차 성장률</span>
              <span className="growth-count"><img src="/images/0/cluster 4/icon/icon - 0 - 3star.png" alt="star" className="star-icon" /> 총 13 개 중 <span className="highlight">7</span>개</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="growth-center">
            <span className="progress-percent"><span className="number">65</span><span className="percent">%</span></span>
          </div>
          <div className="growth-right">
            <span className="growth-label">라인별 강화 결과</span>
            <div className="legend-items">
              <span className="legend-item"><img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" className="legend-icon" />강화 성공</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화 대기" className="legend-icon" />강화 대기</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화 실패" className="legend-icon" />강화 실패</span>
              <span className="legend-item"><img src="/images/0/cluster 4/icon/8 해당 없음.png" alt="해당 없음" className="legend-icon glow" />해당 없음</span>
            </div>
          </div>
        </div>

        {/* 실무 정보 */}
        <div className="work-info-section">
          {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => setWorkInfoModalOpen(true)} style={{ cursor: 'pointer' }}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          )}
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/1 실무 정보.png" alt="실무 정보" className="section-icon" />
              <span className="section-name">실무 정보</span>
              <span className="section-count">총 7개 중 <span className="highlight">4</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value"><span className="highlight">65</span>%</span>
            </div>
          </div>
          <div className="work-info-cards">
            {workInfoCards.map((card) => {
              const isEmpty = card.isEmpty || isRestMode;
              return (
              <div
                key={card.id}
                className={`work-info-card ${isEmpty ? 'empty' : ''}`}
                onClick={() => {
                  if (!isEmpty) {
                    setSelectedWorkInfoCard(card);
                    setWorkInfoViewModalOpen(true);
                  }
                }}
                style={{ cursor: isEmpty ? 'default' : 'pointer' }}
              >
                <div className="card-content-area">
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">{card.title}</span>
                    <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                    <span className="verified-text">Verified</span>
                    {!isEmpty && card.category && <span className={`tag ${card.tagColor}`}>{card.category}</span>}
                  </div>
                  <div className="card-body-row">
                    <div className={`card-icon-area ${!isEmpty && card.isFruit ? 'fruit' : ''} ${!isEmpty && card.isFailed ? 'failed' : ''}`}>
                      {!isEmpty && card.icon ? <img src={card.icon} alt={card.category} /> : <div className="icon-placeholder"></div>}
                      {!isEmpty && card.isFailed && (
                        <div className="failed-overlay">
                          <span className="failed-text">강화 실패</span>
                          <span className="failed-emoji">😿</span>
                        </div>
                      )}
                    </div>
                    <span className="card-desc">{isEmpty ? '-' : <>CU의 무덤이 몽골에 이어 하와이까지 업습하는 가운데, 한국 유통업계가 돌파해나가야 하는 코스피를 어디가 쌍봉 양대 산맥일지가 관건입니다. 80일이삼사오육칠팔구십<img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" /></>}</span>
                  </div>
                </div>
                {!isEmpty && card.status && (
                  <div className="status-badge">
                    {card.status === "success" && <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" />}
                    {card.status === "waiting" && <img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화 대기" />}
                    {card.status === "fail" && <img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화 실패" />}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* 실무 역량 */}
        <div className="work-ability-section">
          {/* 플로팅 아이콘 - 로그인한 본인만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => setWorkAbilityModalOpen(true)} style={{ cursor: 'pointer' }}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          )}
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/2 실무 역량.png" alt="실무 역량" className="section-icon" />
              <span className="section-name">실무 역량</span>
              <span className="section-count">총 1개 중 <span className="highlight">1</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value"><span className="highlight">100</span>%</span>
            </div>
          </div>
          <div
            className={`work-ability-card ${isRestMode ? 'empty' : ''}`}
            onClick={() => {
              if (!isRestMode) {
                setWorkAbilityViewModalOpen(true);
              }
            }}
            style={{ cursor: isRestMode ? 'default' : 'pointer' }}
          >
            <div className="card-icon-area">
              {!isRestMode && <img src="/images/0/cluster%204/icon/실무%20역량/실무%20역량%20-%20[실무%20Info]인하우스%20%26%20에이전시.png" alt="인하우스 & 에이전시" />}
              {isRestMode && <div className="icon-placeholder"></div>}
            </div>
            <div className="card-content-area">
              <div className="card-title-row">
                <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                <span className="card-title">Main Title</span>
                <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                <span className="verified-text">Verified</span>
                {!isRestMode && <span className="code-tag">CP10 - UN010</span>}
                {!isRestMode && <span className="info-tag">[실무 Info]인하우스 & 에이전시</span>}
              </div>
              <p className="main-desc">{isRestMode ? '-' : '[마케팅 실무] 현업에서 마케팅 업계를 구성하고 있는 인하우스 와 에이전시의 개념, 그리고 내부 속성을 알아보자구~'}</p>
              <div className="sub-title-row">
                <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                <span className="sub-label">Sub Title</span>
              </div>
              <span className="sub-desc">{isRestMode ? '-' : <>실무 역량의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재가 매력 지 관건이고 이 사용자가 활용한 소재가 매력 매79..<img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" /></>}</span>
            </div>
            {!isRestMode && (
            <div className="status-badge">
              <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" />
            </div>
            )}
          </div>
          <div className="character-image">
            <img src="/images/0/cluster 4/bg img 2.png" alt="character" />
          </div>
        </div>
      </div>

      {/* ========== 섹션 3: 실무 경험 + 실무 경력 ========== */}
      <div className="section3-layout">
        {/* 실무 경험 */}
        <div className="work-exp-section">
          {/* 플로팅 아이콘 - 본인 프로필일 때만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => setWorkExpModalOpen(true)} style={{ cursor: 'pointer' }}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          )}
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/3 실무 경험.png" alt="실무 경험" className="section-icon" />
              <span className="section-name">실무 경험</span>
              <span className="section-count">총 4개 중 <span className="highlight">3</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value"><span className="highlight">75</span>%</span>
            </div>
          </div>
          <div className="work-exp-cards">
            {workExpCards.map((card) => {
              const isEmpty = card.isEmpty || isRestMode;
              return (
              <div
                key={card.id}
                className={`work-exp-card ${isEmpty ? 'empty' : ''}`}
                onClick={() => {
                  if (!isEmpty) {
                    setSelectedWorkExpCard(card);
                    setWorkExpViewModalOpen(true);
                  }
                }}
                style={{ cursor: isEmpty ? 'default' : 'pointer' }}
              >
                <div className="card-top-row">
                  <div className="card-icon-area">
                    {!isEmpty && card.icon ? <img src={card.icon} alt={card.badge} /> : <div className="icon-placeholder"></div>}
                  </div>
                  <div className="card-header-area">
                    <div className="card-header-row">
                      <span className="code-tag">{isEmpty ? '-' : card.code}</span>
                      <span className="badge-tag">{isEmpty ? '-' : card.badge}</span>
                    </div>
                    <div className="card-rating-row">
                      <div className="stars">
                        {[1,2,3,4,5].map((star) => (
                          <img
                            key={star}
                            src={isEmpty || star > card.rating ? "/images/0/cluster 4/icon/icon - empty star.png" : "/images/0/cluster 4/icon/icon - star.png"}
                            alt="star"
                            className="star"
                          />
                        ))}
                      </div>
                      <span className="rating-count">{isEmpty ? '- / 10' : card.ratingCount}</span>
                    </div>
                  </div>
                </div>
                <div className="card-bottom-area">
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">Main Title</span>
                    <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                    <span className="verified-text">Verified</span>
                  </div>
                  <p className="main-desc">{isEmpty ? '-' : '[역량 파악 & 성장점 분석] "빼날 말로만 떠드는 마케팅 커리어가 아니라, 지금 당장 어느 정도로 준비되었는지 그 현실을 빼저리게 느껴보자구!"'}</p>
                  <div className="sub-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                    <span className="sub-label">Sub Title</span>
                  </div>
                  <span className="sub-desc">{isEmpty ? '-' : '실무 역량의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재가 매력적으로 보이나 보이지 않나 보일까 보이지 않을까 보이는가 안 보이는가 보여 93..'}{!isEmpty && <img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" />}</span>
                </div>
                {!isEmpty && (
                  <div className="status-badge">
                    <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화 성공" />
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* 실무 경력 */}
        <div className="work-career-section">
          {/* 플로팅 아이콘 - 본인 프로필일 때만 표시 */}
          {session && isOwner && (
            <div className="floating-icons" style={{ display: 'flex' }}>
              <div className="edit-icon" onClick={() => setWorkCareerModalOpen(true)} style={{ cursor: 'pointer' }}>
                <img src="/images/0/cluster 3/icon/Edit_Pencil_Line_01.png" alt="Edit" />
              </div>
              <div className="edit-icon search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="tooltip">등록된 도움말이 없습니다</div>
              </div>
            </div>
          )}
          <div className="section-header-row">
            <div className="section-title-left">
              <img src="/images/0/cluster 4/icon/4 실무 경력.png" alt="실무 경력" className="section-icon" />
              <span className="section-name">실무 경력</span>
              <span className="section-count">총 5개 중 <span className="highlight">3</span>개</span>
            </div>
            <div className="section-title-right">
              <span className="rate-label">파트 강화율</span>
              <span className="rate-value"><span className="highlight">75</span>%</span>
            </div>
          </div>
          <div className="work-career-cards">
            {workCareerCards.map((card) => {
              const isEmpty = card.isEmpty || isRestMode;
              return (
              <div
                key={card.id}
                className={`work-career-card ${isEmpty ? 'empty' : ''} ${!isEmpty && card.isNotApplicable ? 'not-applicable' : ''}`}
                onClick={() => {
                  if (!isEmpty && !card.isNotApplicable) {
                    setSelectedWorkCareerCard(card);
                    setWorkCareerViewModalOpen(true);
                  }
                }}
                style={{ cursor: (isEmpty || card.isNotApplicable) ? 'default' : 'pointer' }}
              >
                {!isEmpty && card.isNotApplicable && <div className="card-overlay"></div>}
                <div className="card-top-row">
                  <div className="card-icon-area">
                    {!isEmpty && card.icon ? <img src={card.icon} alt={card.badge} /> : <div className="icon-placeholder"></div>}
                  </div>
                  <div className="card-header-area">
                    <div className="card-header-row">
                      <img src="/images/0/cluster 4/icon/icon - 10 - clock.png" alt="verified" className="verified-icon" />
                      <span className="verified-text">Verified</span>
                      <span className="code-tag">{isEmpty ? '-' : card.code}</span>
                    </div>
                    <div className="grade-row">
                      <span className={`grade ${!isEmpty && card.grade === 'S' ? 'active' : ''}`}>S</span>
                      <span className={`grade ${!isEmpty && card.grade === 'A' ? 'active' : ''}`}>A</span>
                      <span className={`grade ${!isEmpty && card.grade === 'B' ? 'active' : ''}`}>B</span>
                      <span className={`grade ${!isEmpty && card.grade === 'C' ? 'active' : ''}`}>C</span>
                      <span className={`grade ${!isEmpty && card.grade === 'D' ? 'active' : ''}`}>D</span>
                    </div>
                  </div>
                </div>
                <div className="card-bottom-area">
                  <p className="category-text">{isEmpty ? '-' : '마케팅(바이럴) 혹시 몰라'}</p>
                  <div className="card-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="title-icon" />
                    <span className="card-title">Main Title</span>
                  </div>
                  <p className="main-desc-white">{isEmpty ? '-' : '실무 역량의 메인타이틀이 브랜딩 입장에서 어디까지 소화되고 보여져야 UI상 문제가 없을지 한번 테스트해보자는거야 이정도면 뭘까 이것도 역시 80일이삼사오육칠팔구십일이삼사오육칠팔구100'}</p>
                  <div className="sub-title-row">
                    <img src="/images/0/cluster 4/icon/icon - 11 - file.png" alt="icon" className="sub-icon" />
                    <span className="sub-label">Sub Title</span>
                  </div>
                  <span className="sub-desc">{isEmpty ? '-' : '실무 역량의 서브타이틀이 50자면 어디까지 보일지 관건이고 이 사용자가 활용한 소재가 매력이 있습니다 아주 멋지군요 아주 69..'}{!isEmpty && <img src="/images/0/cluster 4/icon - 더보기.png" alt="더보기" className="card-arrow" />}</span>
                  <div className="supervisor-section">
                    <span className="supervisor-label">실무 기업 감독자</span>
                    <div className="supervisor-info">
                      <div className="supervisor-profile">
                        <div className={`profile-avatar ${isEmpty ? 'empty' : ''}`}>
                          {!isEmpty && card.supervisorImg && <img src={card.supervisorImg} alt="supervisor" />}
                        </div>
                        <div className="profile-text">
                          <span className="supervised-text">Supervised by:</span>
                          <span className="profile-name">{isEmpty ? '-' : <><strong>{card.supervisorName}</strong>{card.supervisorDept && <> | {card.supervisorDept}</>}{card.supervisorCompany && <> | {card.supervisorCompany}</>}{card.supervisorPosition && <> | {card.supervisorPosition}</>}</>}</span>
                        </div>
                      </div>
                    </div>
                    <div className="profile-divider"></div>
                  </div>
                  <div className="card-footer-row">
                    <span className="current-bid">Current Bid</span>
                    <div className="date-view">
                      <span className="date">{isEmpty ? '0000-00-00 (일)' : card.date}</span>
                      <span className="check-badge">
                        <i className="ti ti-check"></i>
                      </span>
                    </div>
                    <span className="likes"><img src="/images/0/cluster%204/icon/icon%20-%209.png" alt="likes" className="likes-icon" />{isEmpty ? '0,99' : card.likes}</span>
                  </div>
                </div>
                {!isEmpty && card.statusBadge && (
                  <div className="status-badge">
                    <img src={card.statusBadge} alt="status" />
                    {card.isNotApplicable && <span className="not-applicable-text">해당 없음</span>}
                  </div>
                )}
              </div>
              );
            })}
          </div>
          <div className="section-bottom-divider"></div>
        </div>
      </div>

      {/* ========== 실무 정보 모달 ========== */}
      {workInfoModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkInfoModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>실무 정보 편집</h3>
            </div>
            <div className="section-modal-body">
              {workInfoCards.filter(card => !card.isEmpty).map((card, index) => (
                <div key={card.id} className="modal-card-item modal-card-workinfo">
                  {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                  <div className="modal-card-header-row">
                    <div className="modal-card-left">
                      <div className={`modal-fruit-icon ${card.isFruit ? 'fruit' : ''} ${card.isFailed ? 'failed' : ''}`}>
                        {card.icon && <img src={card.icon} alt={card.category} />}
                      </div>
                      <div className="modal-card-info">
                        <span className={`modal-card-tag ${card.tagColor}`}>{card.category}</span>
                      </div>
                    </div>
                    <div className="modal-header-right">
                      <div className="modal-status-badge">
                        {card.status === "success" && (
                          <>
                            <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화성공" />
                            <span className="status-text success">강화성공</span>
                          </>
                        )}
                        {card.status === "waiting" && (
                          <>
                            <img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화대기" />
                            <span className="status-text waiting">강화대기</span>
                          </>
                        )}
                        {card.status === "fail" && (
                          <>
                            <img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화실패" />
                            <span className="status-text fail">강화실패</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="modal-card-content">
                    {/* 타이틀 + 내용 (읽기 전용) */}
                    <div className="modal-title-section">
                      <div className="main-title">{card.title}</div>
                      <div className="content-title">CU의 무덤이 몽골에 이어 하와이까지 업습하는 가운데, 한국 유통업계가 돌파해나가야 하는 코스피를 어디가 쌍봉 양대 산맥일지가 관건입니다. 80일이삼사오육칠팔구십</div>
                      <div className="modal-date-badge">
                        <span>2025 - 12 - 22 (월) ~ 2025 - 12 - 28 (일)</span>
                      </div>
                    </div>

                    {/* Sub Title - 수정 가능 */}
                    <div className="modal-input-group">
                      <div className="section-label-row">
                        <div className="section-label">Sub Title</div>
                        <div className="char-counter"><span className={subTitleText.length > 0 ? 'active' : ''}>{subTitleText.length}</span> / 150</div>
                      </div>
                      <textarea
                        value={subTitleText}
                        onChange={(e) => setSubTitleText(e.target.value)}
                        placeholder="메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)"
                        rows={3}
                        maxLength={150}
                      ></textarea>
                    </div>

                    {/* Output Link - 수정 가능 */}
                    <div className="modal-input-group">
                      <div className="section-label">Output Link</div>
                      <div className="output-links-buttons">
                        {(() => {
                          const linkCounts = [1, 4, 2, 5, 3];
                          const linkCount = linkCounts[index % linkCounts.length];
                          const linkDescs = ["마케팅 포트폴리오", "프로젝트 결과물", "실무 사례", "참고 자료", "추가 링크"];
                          return [1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className={`output-link-item ${num <= linkCount ? 'active' : ''}`}>
                              <div className="link-button">
                                <span className="link-num">{num}</span>
                              </div>
                              <input
                                type="text"
                                className="link-desc"
                                placeholder="링크 설명을 입력하세요"
                                maxLength={20}
                                defaultValue={num <= linkCount ? linkDescs[num - 1] : ""}
                              />
                              <input
                                type="url"
                                className="link-url"
                                placeholder="URL"
                                defaultValue={num <= linkCount ? "https://example.com" : ""}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkInfoModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={() => setWorkInfoModalOpen(false)}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 역량 모달 ========== */}
      {workAbilityModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkAbilityModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>실무 역량 편집</h3>
            </div>
            <div className="section-modal-body">
              <div className="modal-card-item modal-card-workinfo">
                {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                <div className="modal-card-header-row">
                  <div className="modal-card-left">
                    <div className="modal-fruit-icon fruit">
                      <img src="/images/0/cluster%204/icon/실무%20역량/실무%20역량%20-%20[실무%20Info]인하우스%20%26%20에이전시.png" alt="실무 역량" />
                    </div>
                    <div className="modal-card-info">
                      <span className="modal-card-tag tag--cyan">[실무 Info]인하우스 & 에이전시</span>
                    </div>
                    <div className="modal-code-badge">
                      <span>CP10 - UN010</span>
                    </div>
                  </div>
                  <div className="modal-header-right">
                    <div className="modal-status-badge">
                      <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화성공" />
                      <span className="status-text success">강화성공</span>
                    </div>
                  </div>
                </div>

                <div className="modal-card-content">
                  {/* 타이틀 + 내용 (읽기 전용) */}
                  <div className="modal-title-section">
                    <div className="main-title">Main Title</div>
                    <div className="content-title">[마케팅 실무] 현업에서 마케팅 업계를 구성하고 있는 인하우스 와 에이전시의 개념, 그리고 내부 속성을 알아보자구~</div>
                    <div className="modal-date-badge">
                      <span>2025 - 12 - 22 (월) ~ 2025 - 12 - 28 (일)</span>
                    </div>
                  </div>

                  {/* Sub Title - 수정 가능 */}
                  <div className="modal-input-group">
                    <div className="section-label-row">
                      <div className="section-label">Sub Title</div>
                      <div className="char-counter"><span>0</span> / 150</div>
                    </div>
                    <textarea
                      placeholder="메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)"
                      rows={3}
                      maxLength={150}
                    ></textarea>
                  </div>

                  {/* Output Link - 수정 가능 */}
                  <div className="modal-input-group">
                    <div className="section-label">Output Link</div>
                    <div className="output-links-buttons">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const linkCount = 4;
                        const linkDescs = ["역량 분석 리포트", "실무 테스트 결과", "성장 계획서", "스킬 인증서", ""];
                        return (
                          <div key={num} className={`output-link-item ${num <= linkCount ? 'active' : ''}`}>
                            <div className="link-button">
                              <span className="link-num">{num}</span>
                            </div>
                            <input
                              type="text"
                              className="link-desc"
                              placeholder="링크 설명을 입력하세요"
                              maxLength={20}
                              defaultValue={num <= linkCount ? linkDescs[num - 1] : ""}
                            />
                            <input
                              type="url"
                              className="link-url"
                              placeholder="URL"
                              defaultValue={num <= linkCount ? "https://example.com" : ""}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkAbilityModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={() => setWorkAbilityModalOpen(false)}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경험 모달 ========== */}
      {workExpModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkExpModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>실무 경험 편집</h3>
            </div>
            <div className="section-modal-body">
              {workExpCards.filter(card => !card.isEmpty).map((card, index) => (
                <div key={card.id} className="modal-card-item modal-card-workinfo">
                  {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                  <div className="modal-card-header-row">
                    <div className="modal-card-left">
                      <div className="modal-fruit-icon fruit">
                        {card.icon && <img src={card.icon} alt={card.badge} />}
                      </div>
                      <div className="modal-card-info">
                        <span className="modal-card-tag tag--purple">{card.badge}</span>
                      </div>
                      <div className="modal-code-badge">
                        <span>{card.code}</span>
                      </div>
                    </div>
                    <div className="modal-header-right">
                      <div className="modal-status-badge">
                        <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화성공" />
                        <span className="status-text success">강화성공</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-card-content">
                    {/* 타이틀 + 내용 (읽기 전용) */}
                    <div className="modal-title-section">
                      <div className="main-title-row">
                        <div className="main-title">{card.title}</div>
                        <div className="modal-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <img
                              key={star}
                              src={star <= card.rating ? "/images/0/cluster 4/icon/icon - star.png" : "/images/0/cluster 4/icon/icon - empty star.png"}
                              alt="star"
                              className="modal-star"
                            />
                          ))}
                          <span className="rating-count">{card.ratingCount}</span>
                        </div>
                      </div>
                      <div className="content-title">[역량 파악 & 성장점 분석] 빼날 말로만 떠드는 마케팅 커리어가 아니라, 지금 당장 어느 정도로 준비되었는지 그 현실을 빼저리게 느껴보자구!</div>
                      <div className="modal-date-badge">
                        <span>2025 - 12 - 22 (월) ~ 2025 - 12 - 28 (일)</span>
                      </div>
                    </div>

                    {/* Sub Title - 수정 가능 */}
                    <div className="modal-input-group">
                      <div className="section-label-row">
                        <div className="section-label">Sub Title</div>
                        <div className="char-counter"><span>0</span> / 150</div>
                      </div>
                      <textarea
                        placeholder="메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)"
                        rows={3}
                        maxLength={150}
                      ></textarea>
                    </div>

                    {/* Output Link - 수정 가능 */}
                    <div className="modal-input-group">
                      <div className="section-label">Output Link</div>
                      <div className="output-links-buttons">
                        {(() => {
                          const linkCounts = [3, 1, 5, 2, 4];
                          const linkCount = linkCounts[index % linkCounts.length];
                          const linkDescs = ["경험 증빙 자료", "프로젝트 문서", "성과 리포트", "팀 협업 자료", "기타 자료"];
                          return [1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className={`output-link-item ${num <= linkCount ? 'active' : ''}`}>
                              <div className="link-button">
                                <span className="link-num">{num}</span>
                              </div>
                              <input
                                type="text"
                                className="link-desc"
                                placeholder="링크 설명을 입력하세요"
                                maxLength={20}
                                defaultValue={num <= linkCount ? linkDescs[num - 1] : ""}
                              />
                              <input
                                type="url"
                                className="link-url"
                                placeholder="URL"
                                defaultValue={num <= linkCount ? "https://example.com" : ""}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkExpModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={() => setWorkExpModalOpen(false)}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경력 모달 ========== */}
      {workCareerModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkCareerModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>실무 경력 편집</h3>
            </div>
            <div className="section-modal-body">
              {workCareerCards.filter(card => !card.isEmpty).map((card, index) => (
                <div key={card.id} className="modal-card-item modal-card-workinfo">
                  {/* 상단 헤더: 과일 아이콘 + 태그 + 강화 상태 뱃지 */}
                  <div className="modal-card-header-row">
                    <div className="modal-card-left">
                      <div className="modal-fruit-icon fruit">
                        {card.icon && <img src={card.icon} alt={card.badge} />}
                      </div>
                      <div className="modal-card-info">
                        <span className={`modal-card-tag ${card.grade === 'S' ? 'tag--yellow' : card.grade === 'A' ? 'tag--green' : card.grade === 'B' ? 'tag--cyan' : 'tag--purple'}`}>마케팅(바이럴) 혹시 몰라</span>
                      </div>
                      <div className="modal-code-badge">
                        <span>{card.code}</span>
                      </div>
                    </div>
                    <div className="modal-header-right">
                      <div className="modal-status-badge">
                        {card.statusBadge && <img src={card.statusBadge} alt="상태" />}
                        <span className="status-text success">강화성공</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-card-content">
                    {/* 타이틀 + 내용 (읽기 전용) */}
                    <div className="modal-title-section">
                      <div className="main-title-row">
                        <div className="main-title">{card.title}</div>
                        <div className="modal-grade">
                          <span className={`grade ${card.grade === 'S' ? 'active' : ''}`}>S</span>
                          <span className={`grade ${card.grade === 'A' ? 'active' : ''}`}>A</span>
                          <span className={`grade ${card.grade === 'B' ? 'active' : ''}`}>B</span>
                          <span className={`grade ${card.grade === 'C' ? 'active' : ''}`}>C</span>
                          <span className={`grade ${card.grade === 'D' ? 'active' : ''}`}>D</span>
                        </div>
                      </div>
                      <div className="content-title">실무 역량의 메인타이틀이 브랜딩 입장에서 어디까지 소화되고 보여져야 UI상 문제가 없을지 한번 테스트해보자는거야 이정도면 뭘까 80일이삼사오육칠팔구십</div>
                      <div className="modal-date-badge">
                        <span>2025 - 12 - 22 (월) ~ 2025 - 12 - 28 (일)</span>
                      </div>
                    </div>

                    {/* Sub Title - 수정 가능 */}
                    <div className="modal-input-group">
                      <div className="section-label-row">
                        <div className="section-label">Sub Title</div>
                        <div className="char-counter"><span>0</span> / 150</div>
                      </div>
                      <textarea
                        placeholder="메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀 내용으로 입력해주세요 :)"
                        rows={3}
                        maxLength={150}
                      ></textarea>
                    </div>

                    {/* Output Link - 수정 가능 */}
                    <div className="modal-input-group">
                      <div className="section-label">Output Link</div>
                      <div className="output-links-buttons">
                        {(() => {
                          const linkCounts = [2, 5, 1, 3, 4];
                          const linkCount = linkCounts[index % linkCounts.length];
                          const linkDescs = ["이력서", "포트폴리오", "프로젝트 사례", "자격증 증빙", "추천서"];
                          return [1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className={`output-link-item ${num <= linkCount ? 'active' : ''}`}>
                              <div className="link-button">
                                <span className="link-num">{num}</span>
                              </div>
                              <input
                                type="text"
                                className="link-desc"
                                placeholder="링크 설명을 입력하세요"
                                maxLength={20}
                                defaultValue={num <= linkCount ? linkDescs[num - 1] : ""}
                              />
                              <input
                                type="url"
                                className="link-url"
                                placeholder="URL"
                                defaultValue={num <= linkCount ? "https://example.com" : ""}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setWorkCareerModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={() => setWorkCareerModalOpen(false)}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 상단 섹션 선택 모달 ========== */}
      {selectionModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectionModalOpen(false); }}>
          <div className="section-modal section-modal-selection">
            <div className="section-modal-header">
              <h3>편집 대상 선택</h3>
            </div>
            <div className="section-modal-body selection-body">
              <p className="selection-desc">편집할 대상을 선택해주세요</p>
              <div className="selection-buttons">
                <button
                  className="selection-btn self"
                  onClick={() => {
                    setSelectionModalOpen(false);
                    setHeaderModalType('본인');
                    setHeaderModalOpen(true);
                  }}
                >
                  <div className="selection-icon">
                    <img src="/images/0/cluster 4/icon/icon - 주차 평판.png" alt="연계 동료 작성하기" />
                  </div>
                  <span className="selection-label">연계 동료<br />작성하기</span>
                  <span className="selection-sublabel">내 정보 편집하기</span>
                </button>
                <button
                  className="selection-btn other"
                  onClick={() => {
                    setSelectionModalOpen(false);
                    setHeaderModalType('타크루');
                    setHeaderModalOpen(true);
                  }}
                >
                  <div className="selection-icon">
                    <img src="/images/0/cluster 4/icon/icon - 연계 동료.png" alt="주차평판 남기기" />
                  </div>
                  <span className="selection-label">주차평판<br />남기기</span>
                  <span className="selection-sublabel">다른 크루 정보 보기</span>
                </button>
              </div>
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setSelectionModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 상단 섹션 본인 편집 모달 (연계 동료 편집) ========== */}
      {headerModalOpen && headerModalType === '본인' && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setHeaderModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>연계 동료 편집</h3>
            </div>
            <div className="section-modal-body">
              <div className="modal-card-item modal-card-header-edit">
                {/* 안내 문구 */}
                <div className="header-edit-section colleague-guide">
                  <div className="guide-text">
                    <p>이번 주차 동안 클럽에서 성장하며,<br/><span className="highlight">자신이 도움을 받았거나 기억에 남는 결과를 보여준 다른 크루를 선택해주세요.</span> <span className="guide-requirement">(최소 1명 필수)</span></p>
                  </div>
                </div>

                {/* 연계 동료 선택 */}
                <div className="header-edit-section">
                  <div className="header-edit-title">연계 동료 선택 <span className="count-badge">{selectedColleagues.length} / 3</span></div>

                  {/* 선택된 동료 목록 */}
                  <div className="selected-colleagues">
                    {selectedColleagues.map((colleague, index) => (
                      <div key={colleague.id} className="selected-colleague-card">
                        <div className="colleague-header">
                          <div className="to-badge">
                            <span className="to-text">To.</span>
                            <span className="rank-number">{colleague.rank}{colleague.rank === 1 ? 'st' : colleague.rank === 2 ? 'nd' : 'rd'}</span>
                          </div>
                          <button className="remove-btn" title="삭제" onClick={() => removeColleague(colleague.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="colleague-profile-row">
                          <div className="colleague-avatar">
                            <img src={colleague.profileImg} alt={colleague.name} />
                          </div>
                          <div className="colleague-info">
                            <div className="colleague-name">{colleague.name} | {colleague.gender} | {colleague.age}</div>
                            <div className="colleague-details">{colleague.team} 팀 | {colleague.part} 파트 | {colleague.nickname}</div>
                          </div>
                        </div>
                        <div className="colleague-message-section">
                          <label>Thank you message <span className="char-limit">(최대 50자)</span></label>
                          <div className="message-input-wrapper">
                            <textarea
                              placeholder="이 크루에게 어떤 도움을 받았는지, 감사의 표현을 작성해주세요 :)"
                              maxLength={50}
                              rows={1}
                              value={colleague.message}
                              onChange={(e) => updateColleagueMessage(colleague.id, e.target.value)}
                            ></textarea>
                            <span className="char-counter">{colleague.message.length} / 50</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 추가 버튼 (3명 미만일 때만 표시) */}
                    {selectedColleagues.length < 3 && (
                      <div className="add-colleague-card">
                        <div className="add-colleague-placeholder">
                          <div className="add-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </div>
                          <span>아래에서 크루를 검색하고 추가하세요</span>
                          <span className="add-sublabel">{3 - selectedColleagues.length}명 추가 가능</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 크루 검색 섹션 */}
                <div className="header-edit-section">
                  <div className="header-edit-title with-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="title-icon">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    크루 검색
                  </div>
                  <div className="header-edit-row">
                    <div className="edit-field full-width">
                      <div className="search-input-wrapper">
                        <input
                          type="text"
                          placeholder="크루 이름 또는 닉네임으로 검색..."
                          value={crewSearchQuery}
                          onChange={(e) => setCrewSearchQuery(e.target.value)}
                        />
                        <button className="search-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 검색 결과 목록 */}
                  <div className="crew-search-results">
                    {filteredCrewData.length === 0 ? (
                      <div className="no-results">
                        {selectedColleagues.length >= 3 ? '최대 3명까지만 선택 가능합니다.' : '검색 결과가 없습니다.'}
                      </div>
                    ) : (
                      filteredCrewData.map((user) => (
                        <div key={user.id} className="crew-search-item">
                          <div className="crew-profile">
                            <div className="crew-avatar">
                              <img src={user.profileImg} alt={user.name} />
                            </div>
                            <div className="crew-info">
                              <div className="crew-name">{user.name} | {user.gender} | {user.age}</div>
                              <div className="crew-details">{user.team} 팀 | {user.part} 파트 | {user.nickname}</div>
                            </div>
                          </div>
                          <div className="rank-select-buttons">
                            <button
                              className={`rank-btn ${selectedColleagues.find(c => c.rank === 1) ? 'disabled' : ''}`}
                              title="1순위로 선택"
                              onClick={() => addColleague(user, 1)}
                              disabled={!!selectedColleagues.find(c => c.rank === 1) || selectedColleagues.length >= 3}
                            >1st</button>
                            <button
                              className={`rank-btn ${selectedColleagues.find(c => c.rank === 2) ? 'disabled' : ''}`}
                              title="2순위로 선택"
                              onClick={() => addColleague(user, 2)}
                              disabled={!!selectedColleagues.find(c => c.rank === 2) || selectedColleagues.length >= 3}
                            >2nd</button>
                            <button
                              className={`rank-btn ${selectedColleagues.find(c => c.rank === 3) ? 'disabled' : ''}`}
                              title="3순위로 선택"
                              onClick={() => addColleague(user, 3)}
                              disabled={!!selectedColleagues.find(c => c.rank === 3) || selectedColleagues.length >= 3}
                            >3rd</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setHeaderModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={() => setHeaderModalOpen(false)}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 상단 섹션 타크루 모달 (타크루가 나에 대해 평판을 남김) ========== */}
      {headerModalOpen && headerModalType === '타크루' && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setHeaderModalOpen(false); }}>
          <div className="section-modal section-modal-wide">
            <div className="section-modal-header">
              <h3>주차 평판</h3>
              <span className="modal-subtitle">해당 크루에게 평판을 남겨주세요</span>
            </div>
            <div className="section-modal-body">
              <div className="modal-card-item modal-card-header-edit reputation-form-modal">
                {/* 평판 작성 폼 */}
                <div className="reputation-form">
                  {/* 평점 */}
                  <div className="form-field">
                    <label>평점</label>
                    <div className="rating-row">
                      <div className="star-rating-sm">
                        {[1, 2, 3, 4, 5].map((starIndex) => {
                          const fullValue = starIndex * 2;
                          const halfValue = starIndex * 2 - 1;
                          const currentRating = reputationEditData.rating;
                          const isHalf = currentRating >= halfValue && currentRating < fullValue;
                          const isFull = currentRating >= fullValue;

                          return (
                            <div key={starIndex} className="star-wrapper">
                              {/* 배경 별 (빈 별) */}
                              <svg className="star-bg" viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              {/* 반개 채움 */}
                              {isHalf && (
                                <svg className="star-half-fill" viewBox="0 0 24 24">
                                  <defs>
                                    <clipPath id={`halfClip${starIndex}`}>
                                      <rect x="0" y="0" width="12" height="24" />
                                    </clipPath>
                                  </defs>
                                  <polygon
                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                                    fill="#FFA500"
                                    clipPath={`url(#halfClip${starIndex})`}
                                  />
                                </svg>
                              )}
                              {/* 전체 채움 */}
                              {isFull && (
                                <svg className="star-full-fill" viewBox="0 0 24 24" fill="#FFA500">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              )}
                              {/* 클릭 영역 */}
                              <button
                                className="star-click-area star-click-left"
                                type="button"
                                onClick={() => setReputationEditData(prev => ({ ...prev, rating: halfValue }))}
                              />
                              <button
                                className="star-click-area star-click-right"
                                type="button"
                                onClick={() => setReputationEditData(prev => ({ ...prev, rating: fullValue }))}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <span className="rating-value">{reputationEditData.rating} / 10</span>
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="form-field">
                    <label>내용 <span className="char-limit">(최대 100자)</span></label>
                    <div className="textarea-wrapper">
                      <textarea
                        placeholder="해당 크루에 대한 평가 내용을 작성해주세요..."
                        maxLength={100}
                        rows={3}
                        value={reputationEditData.content}
                        onChange={(e) => setReputationEditData(prev => ({ ...prev, content: e.target.value }))}
                      ></textarea>
                      <span className="char-counter">{reputationEditData.content.length} / 100</span>
                    </div>
                  </div>

                  {/* 키워드 */}
                  <div className="form-field">
                    <label>키워드 <span className="char-limit">(최대 7자)</span></label>
                    <div className="keyword-row">
                      <span className="hashtag">#</span>
                      <input
                        type="text"
                        placeholder="키워드를 입력하세요"
                        value={reputationEditData.keyword}
                        onChange={(e) => setReputationEditData(prev => ({ ...prev, keyword: e.target.value }))}
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="section-modal-footer">
              <button className="cancel-btn" onClick={() => setHeaderModalOpen(false)}>취소</button>
              <button
                className="save-btn"
                onClick={() => setHeaderModalOpen(false)}
                disabled={reputationEditData.rating === 0 || reputationEditData.content.trim() === '' || reputationEditData.keyword.trim() === ''}
              >저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 주차 평판 카드 상세보기 모달 ========== */}
      {reputationViewModalOpen && selectedReputationCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setReputationViewModalOpen(false); }}>
          <div className="section-modal reputation-view-modal">
            <div className="section-modal-header">
              <h3>주차 평판</h3>
              <button className="modal-close-btn" onClick={() => setReputationViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 프로필 */}
              <div className="reputation-view-profile">
                <div className="profile-image">
                  <img src={selectedReputationCard.profileImg} alt={selectedReputationCard.name} />
                </div>
                <div className="profile-info">
                  <div className="profile-name">
                    <span className="text">{selectedReputationCard.name}</span> | <span className="text">{selectedReputationCard.gender}</span> | <span className="text">{selectedReputationCard.age}</span>
                  </div>
                  <div className="profile-details">
                    <div className="detail-line">
                      <span className="text">{selectedReputationCard.university}</span><span className="label">학교</span> | <span className="text">{selectedReputationCard.major}</span><span className="label">학과</span>
                    </div>
                    <div className="detail-line">
                      <span className="text">{selectedReputationCard.team}</span><span className="label">팀</span> | <span className="text">{selectedReputationCard.part}</span><span className="label">파트</span>
                    </div>
                    <div className="detail-line">
                      <span className="nickname">{selectedReputationCard.nickname}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 평점 */}
              <div className="reputation-view-rating">
                <div className="rating-label">평점</div>
                <div className="rating-content">
                  <div className="stars">{renderStars(selectedReputationCard.rating)}</div>
                  <span className="rating-count">{selectedReputationCard.ratingCount}</span>
                </div>
              </div>

              {/* 내용 */}
              <div className="reputation-view-content">
                <div className="content-label">내용</div>
                <div className="content-text">{selectedReputationCard.description}</div>
              </div>

              {/* FM & 키워드 */}
              <div className="reputation-view-footer">
                <div className="footer-item">
                  <span className="footer-label">FM</span>
                  <span className="footer-value">{selectedReputationCard.fm}</span>
                </div>
                <span className="footer-divider">|</span>
                <div className="footer-item">
                  <span className="footer-label">키워드</span>
                  <span className={`tag ${selectedReputationCard.tagColor}`}>{selectedReputationCard.tagText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 연계 동료 카드 상세보기 모달 ========== */}
      {colleagueViewModalOpen && selectedColleagueCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setColleagueViewModalOpen(false); }}>
          <div className="section-modal colleague-view-modal">
            <div className="section-modal-header">
              <h3>연계 동료</h3>
              <button className="modal-close-btn" onClick={() => setColleagueViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* To. 뱃지 + 날짜 */}
              <div className="colleague-header-row">
                <div className="colleague-to-badge">
                  <span className="to-text">To.</span>
                  <span className="rank-number">{selectedColleagueIndex + 1}{selectedColleagueIndex === 0 ? 'st' : selectedColleagueIndex === 1 ? 'nd' : 'rd'}</span>
                </div>
                <div className="colleague-view-date">
                  <span className="date-value">{selectedColleagueCard.date}</span>
                </div>
              </div>

              {/* 프로필 */}
              <div className="colleague-view-profile">
                <div className="profile-image">
                  <img src={selectedColleagueCard.profileImg} alt={selectedColleagueCard.name} />
                </div>
                <div className="profile-info">
                  <div className="profile-name">
                    <span className="text">{selectedColleagueCard.name}</span> | <span className="text">{selectedColleagueCard.gender}</span> | <span className="text">{selectedColleagueCard.age}</span>
                  </div>
                  <div className="profile-details">
                    <div className="detail-line">
                      <span className="text">{selectedColleagueCard.university}</span><span className="label">학교</span> | <span className="text">{selectedColleagueCard.major}</span><span className="label">학과</span> | <span className="text">{selectedColleagueCard.team}</span><span className="label">팀</span> | <span className="text">{selectedColleagueCard.part}</span><span className="label">파트</span> | <span className="nickname">{selectedColleagueCard.nickname}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thank you message */}
              <div className="colleague-view-message">
                <div className="message-label">Thank you message</div>
                <div className="message-content">{selectedColleagueCard.message}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 정보 카드 상세보기 모달 ========== */}
      {workInfoViewModalOpen && selectedWorkInfoCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkInfoViewModalOpen(false); }}>
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 정보</h3>
              <button className="modal-close-btn" onClick={() => setWorkInfoViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 헤더: 아이콘 + 카테고리 제목 + 강화 상태 */}
              <div className="work-view-header-row">
                <div className="work-view-left">
                  <div className={`work-icon-box ${selectedWorkInfoCard.isFruit ? 'fruit' : ''}`}>
                    {selectedWorkInfoCard.icon && <img src={selectedWorkInfoCard.icon} alt={selectedWorkInfoCard.category} />}
                  </div>
                  <span className="category-title">{selectedWorkInfoCard.category}</span>
                </div>
                <div className="work-view-right">
                  {selectedWorkInfoCard.status === "success" && (
                    <div className="status-badge success">
                      <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화성공" />
                      <span>강화성공</span>
                    </div>
                  )}
                  {selectedWorkInfoCard.status === "waiting" && (
                    <div className="status-badge waiting">
                      <img src="/images/0/cluster 4/icon/6 강화 대기.png" alt="강화대기" />
                      <span>강화대기</span>
                    </div>
                  )}
                  {selectedWorkInfoCard.status === "fail" && (
                    <div className="status-badge fail">
                      <img src="/images/0/cluster 4/icon/7 강화 실패.png" alt="강화실패" />
                      <span>강화실패</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Title + Content */}
              <div className="work-view-title-section">
                <div className="main-title">{selectedWorkInfoCard.title}</div>
                <div className="content-text">CU의 무덤이 몽골에 이어 하와이까지 업습하는 가운데, 한국 유통업계가 돌파해나가야 하는 코스피를 어디가 쌍봉 양대 산맥일지가 관건입니다. 80일이삼사오육칠팔구십</div>
                <div className="date-badge">2025 - 12 - 22 (월) ~ 2025 - 12 - 28 (일)</div>
              </div>

              {/* Sub Title */}
              <div className="work-view-section">
                <div className="section-label">Sub Title</div>
                <div className="section-content">메인 타이틀 내용에 대한 본인의 의견을 서브 타이틀로 표현합니다. 실무에서 경험한 내용과 인사이트를 바탕으로 작성된 서브타이틀입니다. 사용자가 직접 입력한 내용이 여기에 표시되며 최대 150자까지 작성할 수 있습니다.</div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {(() => {
                    const linkCounts = [1, 4, 2, 5, 3];
                    const linkCount = linkCounts[selectedWorkInfoCard.id % linkCounts.length];
                    const linkDescs = ["마케팅 포트폴리오 실무 프로젝트 사례", "프로젝트 결과물", "실무 사례", "참고 자료", "추가 링크"];
                    return [1, 2, 3, 4, 5].map((num) => {
                      const isActive = num <= linkCount;
                      return (
                        <a
                          key={num}
                          href={isActive ? "https://example.com" : undefined}
                          target={isActive ? "_blank" : undefined}
                          rel={isActive ? "noopener noreferrer" : undefined}
                          className={`output-link-item ${!isActive ? 'disabled' : ''}`}
                          onClick={(e) => !isActive && e.preventDefault()}
                        >
                          <span className="link-num">{num}</span>
                          <span className="link-desc">{isActive ? linkDescs[num - 1] : '-'}</span>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 역량 카드 상세보기 모달 ========== */}
      {workAbilityViewModalOpen && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkAbilityViewModalOpen(false); }}>
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 역량</h3>
              <button className="modal-close-btn" onClick={() => setWorkAbilityViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
              <div className="work-view-header-row">
                <div className="work-view-left">
                  <div className="work-icon-box fruit">
                    <img src="/images/0/cluster%204/icon/실무%20역량/실무%20역량%20-%20[실무%20Info]인하우스%20%26%20에이전시.png" alt="실무 역량" />
                  </div>
                  <span className="category-title">[실무 Info]인하우스 & 에이전시</span>
                  <span className="code-badge">CP10 - UN010</span>
                </div>
                <div className="work-view-right">
                  <div className="status-badge success">
                    <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화성공" />
                    <span>강화성공</span>
                  </div>
                </div>
              </div>

              {/* Main Title + Content */}
              <div className="work-view-title-section">
                <div className="main-title">Main Title</div>
                <div className="content-text">[마케팅 실무] 현업에서 마케팅 업계를 구성하고 있는 인하우스 와 에이전시의 개념, 그리고 내부 속성을 알아보자구~</div>
                <div className="date-badge">2025 - 12 - 22 (월) ~ 2025 - 12 - 28 (일)</div>
              </div>

              {/* Sub Title */}
              <div className="work-view-section">
                <div className="section-label">Sub Title</div>
                <div className="section-content">인하우스와 에이전시의 차이점을 실무 관점에서 분석한 내용입니다. 각각의 장단점과 커리어 성장 가능성을 비교하여 본인에게 맞는 방향을 찾는 것이 중요합니다. 마케터로서 어떤 환경이 더 적합한지 고민해보세요.</div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const linkCount = 4;
                    const linkDescs = ["역량 분석 리포트 상세 내용 테스트", "실무 테스트 결과", "성장 계획서", "스킬 인증서", ""];
                    const isActive = num <= linkCount;
                    return (
                      <a
                        key={num}
                        href={isActive ? "https://example.com" : undefined}
                        target={isActive ? "_blank" : undefined}
                        rel={isActive ? "noopener noreferrer" : undefined}
                        className={`output-link-item ${!isActive ? 'disabled' : ''}`}
                        onClick={(e) => !isActive && e.preventDefault()}
                      >
                        <span className="link-num">{num}</span>
                        <span className="link-desc">{isActive ? linkDescs[num - 1] : '-'}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경험 카드 상세보기 모달 ========== */}
      {workExpViewModalOpen && selectedWorkExpCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkExpViewModalOpen(false); }}>
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 경험</h3>
              <button className="modal-close-btn" onClick={() => setWorkExpViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
              <div className="work-view-header-row">
                <div className="work-view-left">
                  <div className="work-icon-box fruit">
                    {selectedWorkExpCard.icon && <img src={selectedWorkExpCard.icon} alt={selectedWorkExpCard.badge} />}
                  </div>
                  <span className="category-title">{selectedWorkExpCard.badge}</span>
                  <span className="code-badge">{selectedWorkExpCard.code}</span>
                </div>
                <div className="work-view-right">
                  <div className="status-badge success">
                    <img src="/images/0/cluster 4/icon/5 강화 성공.png" alt="강화성공" />
                    <span>강화성공</span>
                  </div>
                </div>
              </div>

              {/* Main Title + 별점 + Content */}
              <div className="work-view-title-section">
                <div className="main-title-row">
                  <div className="main-title">{selectedWorkExpCard.title}</div>
                  <div className="rating-row">
                    <div className="stars">{renderStars(selectedWorkExpCard.rating)}</div>
                    <span className="rating-count">{selectedWorkExpCard.ratingCount}</span>
                  </div>
                </div>
                <div className="content-text">[역량 파악 & 성장점 분석] 빼날 말로만 떠드는 마케팅 커리어가 아니라, 지금 당장 어느 정도로 준비되었는지 그 현실을 빼저리게 느껴보자구!</div>
                <div className="date-badge">2025 - 12 - 22 (월) ~ 2025 - 12 - 28 (일)</div>
              </div>

              {/* Sub Title */}
              <div className="work-view-section">
                <div className="section-label">Sub Title</div>
                <div className="section-content">마케터로서의 커리어를 시작하고 성장하는 과정에서 겪은 경험들을 정리한 내용입니다. 실무에서 배운 것들과 앞으로의 성장 방향에 대한 생각을 담았습니다. 지속적인 학습과 도전이 중요합니다.</div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {(() => {
                    const linkCounts = [3, 1, 5, 2, 4];
                    const linkCount = linkCounts[selectedWorkExpCard.id % linkCounts.length];
                    const linkDescs = ["경험 증빙 자료 및 프로젝트 상세 문서", "프로젝트 문서", "성과 리포트", "팀 협업 자료", "기타 자료"];
                    return [1, 2, 3, 4, 5].map((num) => {
                      const isActive = num <= linkCount;
                      return (
                        <a
                          key={num}
                          href={isActive ? "https://example.com" : undefined}
                          target={isActive ? "_blank" : undefined}
                          rel={isActive ? "noopener noreferrer" : undefined}
                          className={`output-link-item ${!isActive ? 'disabled' : ''}`}
                          onClick={(e) => !isActive && e.preventDefault()}
                        >
                          <span className="link-num">{num}</span>
                          <span className="link-desc">{isActive ? linkDescs[num - 1] : '-'}</span>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 실무 경력 카드 상세보기 모달 ========== */}
      {workCareerViewModalOpen && selectedWorkCareerCard && (
        <div className="section-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setWorkCareerViewModalOpen(false); }}>
          <div className="section-modal work-view-modal">
            <div className="section-modal-header">
              <h3>실무 경력</h3>
              <button className="modal-close-btn" onClick={() => setWorkCareerViewModalOpen(false)}>×</button>
            </div>
            <div className="section-modal-body">
              {/* 헤더: 아이콘 + 카테고리 제목 + 코드 + 강화 상태 */}
              <div className="work-view-header-row">
                <div className="work-view-left">
                  <div className="work-icon-box fruit">
                    {selectedWorkCareerCard.icon && <img src={selectedWorkCareerCard.icon} alt={selectedWorkCareerCard.badge} />}
                  </div>
                  <span className="category-title">마케팅(바이럴) 혹시 몰라</span>
                  <span className="code-badge">{selectedWorkCareerCard.code}</span>
                </div>
                <div className="work-view-right">
                  {selectedWorkCareerCard.statusBadge && (
                    <div className="status-badge success">
                      <img src={selectedWorkCareerCard.statusBadge} alt="상태" />
                      <span>강화성공</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Title + 등급 + Content */}
              <div className="work-view-title-section">
                <div className="main-title-row">
                  <div className="main-title">{selectedWorkCareerCard.title}</div>
                  <div className="grade-row">
                    <span className={`grade ${selectedWorkCareerCard.grade === 'S' ? 'active' : ''}`}>S</span>
                    <span className={`grade ${selectedWorkCareerCard.grade === 'A' ? 'active' : ''}`}>A</span>
                    <span className={`grade ${selectedWorkCareerCard.grade === 'B' ? 'active' : ''}`}>B</span>
                    <span className={`grade ${selectedWorkCareerCard.grade === 'C' ? 'active' : ''}`}>C</span>
                    <span className={`grade ${selectedWorkCareerCard.grade === 'D' ? 'active' : ''}`}>D</span>
                  </div>
                </div>
                <div className="content-text">바이럴 마케팅 분야에서 3년간의 실무 경력을 쌓으며 다양한 캠페인을 성공적으로 운영했습니다. SNS 채널 운영과 콘텐츠 기획, 인플루언서 협업 등 폭넓은 경험을 보유하고 있습니다.</div>
                <div className="date-badge">2025 - 12 - 22 (월) ~ 2025 - 12 - 28 (일)</div>
              </div>

              {/* Sub Title */}
              <div className="work-view-section">
                <div className="section-label">Sub Title</div>
                <div className="section-content">바이럴 마케팅 실무 경력에 대한 상세 내용입니다. 다양한 프로젝트를 진행하며 쌓은 노하우와 성과를 정리했습니다. 클라이언트와의 협업 경험과 캠페인 운영 역량을 바탕으로 지속 성장 중입니다.</div>
              </div>

              {/* Output Link */}
              <div className="work-view-section">
                <div className="section-label">Output Link</div>
                <div className="output-links-view">
                  {(() => {
                    const linkCounts = [2, 5, 1, 3, 4];
                    const linkCount = linkCounts[selectedWorkCareerCard.id % linkCounts.length];
                    const linkDescs = ["이력서 및 경력 증명서 포트폴리오", "포트폴리오", "프로젝트 사례", "자격증 증빙", "추천서"];
                    return [1, 2, 3, 4, 5].map((num) => {
                      const isActive = num <= linkCount;
                      return (
                        <a
                          key={num}
                          href={isActive ? "https://example.com" : undefined}
                          target={isActive ? "_blank" : undefined}
                          rel={isActive ? "noopener noreferrer" : undefined}
                          className={`output-link-item ${!isActive ? 'disabled' : ''}`}
                          onClick={(e) => !isActive && e.preventDefault()}
                        >
                          <span className="link-num">{num}</span>
                          <span className="link-desc">{isActive ? linkDescs[num - 1] : '-'}</span>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cluster4CardContent;
