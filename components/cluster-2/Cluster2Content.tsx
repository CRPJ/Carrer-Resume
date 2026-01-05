"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// 학력 데이터 타입
interface EduData {
  eduLevel: string; // 학력 (대학원/대학교/고등학교/중학교)
  school: string;
  status: string;
  category: string;
  major1: string;
  major2: string;
  major3: string;
  period: string;
  startYear?: string;
  startMonth?: string;
  endYear?: string;
  endMonth?: string;
  gradeMax: string; // 최대치 (4.5/4.3/100%/9등급/기타)
  gradeValue: string; // 달성치
  description: string;
  isFinal?: boolean;
}

// 학교 데이터 (샘플)
const schoolData: { [key: string]: string[] } = {
  '대학원': ['서울대학교 대학원', '연세대학교 대학원', '고려대학교 대학원', 'KAIST 대학원', '포항공대 대학원', '성균관대학교 대학원', '한양대학교 대학원', '중앙대학교 대학원', '경희대학교 대학원', '이화여자대학교 대학원'],
  '대학교': ['서울대학교', '연세대학교', '고려대학교', 'KAIST', '포항공대', '성균관대학교', '한양대학교', '중앙대학교', '경희대학교', '이화여자대학교', '서강대학교', '건국대학교', '동국대학교', '홍익대학교', '국민대학교', '숭실대학교', '세종대학교', '단국대학교', '아주대학교', '인하대학교'],
  '고등학교': ['서울과학고등학교', '한성과학고등학교', '세종과학고등학교', '경기과학고등학교', '대전과학고등학교', '광주과학고등학교', '대구과학고등학교', '부산과학고등학교', '민사고', '상산고', '외대부고', '하나고', '용인외고', '대원외고', '대일외고'],
  '중학교': ['서울중학교', '경기중학교', '강남중학교', '서초중학교', '용산중학교', '마포중학교', '성북중학교', '종로중학교'],
  '초등학교': ['서울초등학교', '경기초등학교', '강남초등학교', '서초초등학교', '용산초등학교', '마포초등학교', '성북초등학교', '종로초등학교']
};

// 학력 데이터
const initialEducationData: EduData[] = [
  {
    eduLevel: "대학원",
    school: "고려대학교 대학원",
    status: "재학",
    category: "사회",
    major1: "콘텐츠전략학",
    major2: "디지털마케팅학",
    major3: "-",
    period: "2025.03 - ~ing",
    startYear: "2025",
    startMonth: "03",
    endYear: "",
    endMonth: "",
    gradeMax: "4.5",
    gradeValue: "3.8",
    description: "석사 과정에서 더 깊이 있는 연구와 전문성을 쌓고 있습니다. 학부에서 배운 이론을 실무에 적용하는 연구를 진행하고 있습니다.",
    isFinal: true
  },
  {
    eduLevel: "대학교",
    school: "연세대학교",
    status: "졸업",
    category: "예체능",
    major1: "미디어커뮤니케이션학과",
    major2: "-",
    major3: "-",
    period: "2021. 03 - 2025. 02",
    startYear: "2021",
    startMonth: "03",
    endYear: "2025",
    endMonth: "02",
    gradeMax: "4.3",
    gradeValue: "4.12",
    description: "대학 4년간 전공과 프로젝트를 통해 미디어와 커뮤니케이션에 대한 이해를 쌓았습니다. 학회, 공모전, 인턴십을 통해 이론과 실무를 연결했습니다."
  },
  {
    eduLevel: "고등학교",
    school: "서울과학고등학교",
    status: "졸업",
    category: "기타",
    major1: "-",
    major2: "-",
    major3: "-",
    period: "2018. 03 - 2021. 02",
    startYear: "2018",
    startMonth: "03",
    endYear: "2021",
    endMonth: "02",
    gradeMax: "9등급",
    gradeValue: "2",
    description: "진로를 탐색하고 꿈을 구체화했던 시기입니다. 다양한 동아리 활동과 봉사활동을 통해 협동심과 리더십을 기르고, 열정적인 선생님들 덕분에 학업에 대한 흥미를 잃지 않을 수 있었습니다."
  },
  {
    eduLevel: "중학교",
    school: "용산중학교",
    status: "졸업",
    category: "기타",
    major1: "-",
    major2: "-",
    major3: "-",
    period: "2015. 03 - 2018. 02",
    startYear: "2015",
    startMonth: "03",
    endYear: "2018",
    endMonth: "02",
    gradeMax: "100%",
    gradeValue: "15",
    description: "호기심 가득했던 시절, 다양한 과목을 접하며 세상을 배웠습니다. 친구들과 우정을 쌓고, 학교 행사에서 즐거운 추억을 만들며 꿈을 키웠습니다."
  }
];

// 물결 파동 타입
interface Ripple {
  id: number;
  x: number;
  y: number;
}

// Slogan 옵션 8개
const sloganOptions = [
  "Dreamer",
  "Commander",
  "Nomad",
  "Scholar",
  "Warrior",
  "Agent",
  "Pioneer",
  "Architect"
];

const Cluster2Content = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<EduData | null>(null);

  // 섹션 1 모달 (프로필 사진 수정)
  const [section1ModalOpen, setSection1ModalOpen] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<string | null>("/images/0/cluster 2/이안0.png");
  const [subPhotos, setSubPhotos] = useState<(string | null)[]>([
    "/images/0/cluster 2/이안1.webp",
    "/images/0/cluster 2/이안2.webp",
    "/images/0/cluster 2/이안3.jpg",
    "/images/0/cluster 2/이안4.jpg"
  ]);
  const [starredPhoto, setStarredPhoto] = useState<number | null>(null);

  // 파일 input refs
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const subPhotoInputRef = useRef<HTMLInputElement>(null);
  const [currentSubIndex, setCurrentSubIndex] = useState<number>(0);

  // 메인 사진 변경 핸들러
  const handleMainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMainPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // input 초기화 (같은 파일 다시 선택 가능하게)
    e.target.value = '';
  };

  // 서브 사진 업로드 핸들러 - 순서대로 채움
  const handleSubPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = event.target?.result as string;
        setSubPhotos(prev => {
          // 비어있는 첫 번째 슬롯 찾기
          const emptyIndex = prev.findIndex(photo => !photo);
          if (emptyIndex !== -1) {
            const newPhotos = [...prev];
            newPhotos[emptyIndex] = newPhoto;
            return newPhotos;
          }
          // 모든 슬롯이 차있으면 현재 선택한 인덱스에 업로드
          const newPhotos = [...prev];
          newPhotos[currentSubIndex] = newPhoto;
          return newPhotos;
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // 서브 사진 삭제 핸들러 - 삭제 후 순서 재정렬
  const handleSubPhotoDelete = (index: number) => {
    setSubPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index || !prev[index]);
      // 삭제된 사진이 있으면 앞으로 당기고 뒤에 null 추가
      const filledPhotos = prev.filter((photo, i) => i !== index && photo);
      while (filledPhotos.length < 4) {
        filledPhotos.push(null);
      }
      return filledPhotos;
    });
    // 삭제된 사진이 대표 사진이었으면 해제
    if (starredPhoto === index) {
      setStarredPhoto(null);
    } else if (starredPhoto !== null && starredPhoto > index) {
      // 대표 사진 인덱스 조정
      setStarredPhoto(starredPhoto - 1);
    }
  };

  // 메인 사진 삭제 핸들러 - 첫번째 서브 사진이 메인으로
  const handleMainPhotoDelete = () => {
    const firstSubPhoto = subPhotos.find(photo => photo);
    if (firstSubPhoto) {
      setMainPhoto(firstSubPhoto);
      // 서브 사진 재정렬
      const remainingPhotos = subPhotos.filter(photo => photo !== firstSubPhoto);
      while (remainingPhotos.length < 4) {
        remainingPhotos.push(null);
      }
      setSubPhotos(remainingPhotos);
      // 대표 사진 인덱스 조정
      if (starredPhoto !== null && starredPhoto > 0) {
        setStarredPhoto(starredPhoto - 1);
      } else if (starredPhoto === 0) {
        setStarredPhoto(null);
      }
    } else {
      setMainPhoto(null);
    }
  };

  // 대표 사진 설정 핸들러 - 사진이 있어야만 설정 가능, 메인 사진으로 변경
  const handleSetStarred = (index: number) => {
    if (!subPhotos[index]) return; // 사진이 없으면 무시

    // 선택한 서브 사진을 메인 사진으로 변경
    const selectedPhoto = subPhotos[index];
    const currentMainPhoto = mainPhoto;

    // 메인 사진 변경
    setMainPhoto(selectedPhoto);

    // 서브 사진 재구성: 선택한 사진 위치에 기존 메인 사진 넣기
    setSubPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[index] = currentMainPhoto;
      return newPhotos;
    });

    // 대표 사진 표시 해제
    setStarredPhoto(null);
  };

  // 섹션 2 모달 (슬로건 편집)
  const [section2ModalOpen, setSection2ModalOpen] = useState(false);
  const [sloganData, setSloganData] = useState({
    slogan1: { option: "Dreamer", content: "지금의 한 걸음이 작아 보여도 결국 미래를 바꾸는 결정적 힘이 된다 흔들려도 멈추지 않으면 결국 도착한다 그게 성장의 즐거다" },
    slogan2: { option: "Dreamer", content: "작은 용기가 쌓여 결국 더 큰 변화를 만들고 흔들리는 순간에도 멈추지 않으면 마침내 스스로의 길을 찾아간다 라는 믿음이다." }
  });
  const [editingSloganData, setEditingSloganData] = useState(sloganData);
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);

  // 섹션 2-1 모달 (비디오 편집)
  const [section21ModalOpen, setSection21ModalOpen] = useState(false);
  // YouTube 비디오 ID 추출 함수
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;

    // youtu.be/VIDEO_ID 형식
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // youtube.com/watch?v=VIDEO_ID 형식
    const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (longMatch) return longMatch[1];

    // youtube.com/embed/VIDEO_ID 형식
    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    return null;
  };

  // YouTube 썸네일 URL 생성
  const getYouTubeThumbnail = (videoUrl: string): string => {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return '';
    // 최고 화질 썸네일 사용 (maxresdefault)
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const [videoData, setVideoData] = useState([
    {
      id: 1,
      title: "Eclipse Journey",
      author: "Hwang Yeongyeong",
      viewers: "9.9k Viewers",
      thumbnail: "/images/0/cluster 2/영상 01.jpeg",
      isBookmarked: true,
      videoUrl: "https://youtu.be/_NAJCvSYWnA?si=XBJMKwjLFoEL_joQ"
    },
    {
      id: 2,
      title: "Eclipse Journey",
      author: "Hwang Yeongyeong",
      viewers: "9.9k Viewers",
      thumbnail: "999",
      isBookmarked: true,
      videoUrl: ""
    },
    {
      id: 3,
      title: "Eclipse Journey",
      author: "Hwang Yeongyeong",
      viewers: "9.9k Viewers",
      thumbnail: "999",
      isBookmarked: true,
      videoUrl: ""
    }
  ]);
  const [editingVideoData, setEditingVideoData] = useState(videoData);

  // 섹션 3 모달 (학력 편집)
  const [section3ModalOpen, setSection3ModalOpen] = useState(false);
  const [educationData, setEducationData] = useState<EduData[]>(initialEducationData);
  const [editingEduData, setEditingEduData] = useState<EduData[]>(initialEducationData);
  const [hasEduChanges, setHasEduChanges] = useState(false); // 학력 변경사항 추적

  // 삭제 확인 모달
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    index: number | null;
    schoolName: string;
    type: 'edu' | 'minimum';
  }>({ isOpen: false, index: null, schoolName: '', type: 'edu' });

  // 섹션 4 모달 (바로가기 링크 편집)
  const [section4ModalOpen, setSection4ModalOpen] = useState(false);

  // 섹션 5 - 자기소개서 카드 데이터
  const [introCards, setIntroCards] = useState([
    {
      id: 1,
      icon: '/images/0/cluster 2/icon/01성장 과정.png',
      title: '성장 과정',
      subtitle: '저는 이렇게 성장하였습니다 😊',
      content: '어린 시절부터 저는 "왜?"라는 질문을 멈추지 않는 아이였습니다. 부모님께서는 항상 제 질문에 진지하게 답해주셨고, 스스로 답을 찾아보도록 격려해주셨습니다. 이러한 환경 속에서 저는 자연스럽게 탐구하는 습관과 문제 해결 능력을 키워나갈 수 있었습니다. 특히 아버지께서는 "답을 아는 것보다 질문을 던지는 것이 더 중요하다"고 말씀하셨는데, 이 가르침은 지금까지도 저의 삶의 방향을 이끌어주고 있습니다.\n\n중학교 시절, 학교 신문부 활동을 하면서 글쓰기와 소통의 즐거움을 알게 되었습니다. 단순히 정보를 전달하는 것이 아니라, 어떻게 하면 독자의 마음을 움직일 수 있을지 고민하며 콘텐츠를 만들었습니다. 첫 기사가 교내 신문에 실렸을 때의 뿌듯함은 아직도 생생합니다. 이 경험은 훗날 마케팅과 브랜딩에 관심을 갖게 된 계기가 되었습니다.\n\n고등학교에서는 학생회 활동을 통해 리더십을 배웠습니다. 다양한 의견을 조율하고, 팀원들의 강점을 살려 프로젝트를 완성해가는 과정에서 협업의 가치를 깨달았습니다. 학교 축제를 기획할 때 예산 부족과 일정 지연 등 여러 어려움이 있었지만, 팀원들과 함께 해결책을 찾아가며 성공적으로 마무리했습니다. 실패도 있었지만, 그 실패들이 오히려 더 단단한 저를 만들어주었습니다.\n\n대학에 진학한 후에는 전공 공부와 함께 다양한 동아리와 대외활동에 참여했습니다. 특히 창업 동아리에서의 경험은 제 시야를 크게 넓혀주었고, 실제 비즈니스 현장에서 필요한 역량이 무엇인지 체감할 수 있었습니다. 직접 사업 계획서를 작성하고 투자자 앞에서 발표하는 경험을 통해 아이디어를 현실로 만드는 과정의 어려움과 보람을 동시에 느꼈습니다. 이 모든 경험들이 쌓여 지금의 저를 만들었고, 앞으로도 끊임없이 성장하는 사람이 되고자 합니다.'
    },
    {
      id: 2,
      icon: '/images/0/cluster 2/icon/03사회 경험.png',
      title: '사회 경험',
      subtitle: '저는 이런 것들을 경험하였습니다 😊',
      content: '대학 시절 시작한 첫 인턴십은 스타트업 마케팅 팀이었습니다. 작은 규모의 회사였기에 기획부터 실행, 분석까지 마케팅의 전 과정을 경험할 수 있었습니다. 한정된 예산으로 최대의 효과를 내기 위해 고민하며 창의적인 문제 해결 능력을 키웠고, 빠른 의사결정과 실행력의 중요성을 배웠습니다.\n\n이후 중견 기업의 브랜드 마케팅 부서에서 근무하며 체계적인 브랜드 관리와 대규모 캠페인 운영을 경험했습니다. 다양한 이해관계자들과 협업하는 과정에서 커뮤니케이션 능력을 한층 발전시킬 수 있었고, 데이터 기반의 의사결정이 얼마나 중요한지 깨달았습니다.\n\n또한 대학생 마케팅 연합 동아리에서 2년간 활동하며 다양한 기업들의 마케팅 프로젝트를 수행했습니다. 서로 다른 전공과 배경을 가진 팀원들과 협업하며 다양한 관점에서 문제를 바라보는 법을 배웠습니다.\n\n봉사활동으로는 지역 소상공인들의 온라인 마케팅을 무료로 지원하는 프로젝트에 참여했습니다. 디지털 전환에 어려움을 겪는 분들께 실질적인 도움을 드리며, 마케팅이 단순한 판매 촉진을 넘어 사회적 가치를 창출할 수 있다는 것을 경험했습니다.'
    },
    {
      id: 3,
      icon: '/images/0/cluster 2/icon/02커리어 방향.png',
      title: '커리어 방향',
      subtitle: '저는 이 방향으로 나아가고자 합니다 😊',
      content: '저의 커리어 목표는 "사람과 기술을 연결하는 다리"가 되는 것입니다. 빠르게 변화하는 디지털 환경 속에서 기술만으로는 진정한 가치를 만들어낼 수 없다고 생각합니다. 기술을 이해하면서도 사람의 니즈를 파악하고, 이 둘을 효과적으로 연결할 수 있는 전문가가 되고자 합니다.\n\n단기적으로는 디지털 마케팅과 콘텐츠 기획 분야에서 실무 역량을 쌓고 싶습니다. 데이터 분석을 기반으로 한 마케팅 전략 수립, 타겟 고객에게 공감을 주는 콘텐츠 제작, 그리고 브랜드 아이덴티티 구축까지 전반적인 마케팅 사이클을 경험하며 전문성을 키워나가겠습니다.\n\n중장기적으로는 브랜드 매니저 또는 마케팅 디렉터로 성장하여 브랜드의 방향성을 제시하고, 팀을 이끌어 나가는 역할을 맡고 싶습니다. 단순히 매출을 올리는 마케팅이 아닌, 고객과 진정성 있는 관계를 형성하고 사회적 가치를 창출하는 마케팅을 실현하고자 합니다.\n\n궁극적으로는 제가 쌓은 경험과 지식을 후배들과 나누며, 업계 전체의 발전에 기여하는 사람이 되고 싶습니다. 멘토링과 강연, 그리고 실무 교육을 통해 다음 세대의 마케터들이 성장할 수 있도록 돕겠습니다.'
    },
    {
      id: 4,
      icon: '/images/0/cluster 2/icon/04실무 스타일.png',
      title: '실무 스타일',
      subtitle: '저는 이렇게 일합니다 😊',
      content: '저의 업무 스타일은 "철저한 준비, 유연한 실행"으로 요약할 수 있습니다. 프로젝트를 시작하기 전에는 충분한 리서치와 기획을 통해 방향성을 명확히 합니다. 하지만 실행 단계에서는 상황에 따라 유연하게 대응하며, 더 나은 결과를 위해 계획을 수정하는 것을 두려워하지 않습니다.\n\n협업에 있어서는 투명한 소통을 가장 중요하게 생각합니다. 진행 상황을 주기적으로 공유하고, 문제가 발생했을 때는 즉시 팀원들과 논의하여 해결책을 찾습니다. "혼자 고민하지 않고, 함께 해결한다"는 원칙을 지키려 노력합니다.\n\n시간 관리에 있어서는 우선순위를 명확히 하고, 데드라인을 철저히 지킵니다. 급한 일과 중요한 일을 구분하여 리소스를 효율적으로 배분하며, 예상치 못한 상황에 대비해 항상 버퍼 시간을 확보해둡니다.\n\n피드백에 대해서는 열린 자세를 유지합니다. 건설적인 비판은 성장의 기회로 받아들이며, 같은 실수를 반복하지 않기 위해 회고하는 습관을 들이고 있습니다. 또한 동료들에게도 구체적이고 실행 가능한 피드백을 제공하려 노력합니다.'
    },
    {
      id: 5,
      icon: '/images/0/cluster 2/icon/05퍼스널 스토리.png',
      title: '퍼스널 스토리',
      subtitle: '저는 이런 사람입니다 😊',
      content: '저를 한 단어로 표현하자면 "연결자"입니다. 사람과 사람, 아이디어와 실행, 문제와 해결책을 연결하는 것에서 가장 큰 보람을 느낍니다. 이러한 성향은 어릴 때부터 자연스럽게 형성되었는데, 친구들 사이에서 중재자 역할을 하거나 그룹 프로젝트에서 조율자 역할을 맡는 일이 많았습니다.\n\n취미로는 여행과 사진 촬영을 즐깁니다. 새로운 장소를 방문하고 그곳의 문화를 경험하는 것은 시야를 넓히고 창의성을 자극합니다. 카메라 렌즈를 통해 세상을 바라보며 디테일에 주목하는 습관은 업무에서도 큰 도움이 됩니다.\n\n독서도 빼놓을 수 없는 취미입니다. 마케팅, 심리학, 경영 서적뿐 아니라 소설과 에세이도 즐겨 읽습니다. 다양한 분야의 책을 통해 폭넓은 인사이트를 얻고, 이를 업무에 적용하려 노력합니다.\n\n저의 강점은 긍정적인 에너지와 회복탄력성입니다. 어려운 상황에서도 해결책을 찾으려 노력하고, 실패를 경험해도 빠르게 털어내고 다시 일어섭니다. 이러한 태도가 주변 사람들에게도 좋은 영향을 미친다는 피드백을 종종 받습니다. 앞으로도 이런 에너지로 조직에 활력을 불어넣는 사람이 되고 싶습니다.'
    }
  ]);
  const [introModalOpen, setIntroModalOpen] = useState(false);
  const [selectedIntroCard, setSelectedIntroCard] = useState<number | null>(null);
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [editingIntroData, setEditingIntroData] = useState({ content: '' });
  const [reviewLinks, setReviewLinks] = useState<string[]>([
    'https://www.youtube.com/watch?v=TeQTJb9LkwI', // Total
    'https://www.youtube.com/watch?v=8Ddgy5tCKtg', // 3 weeks
    'https://www.youtube.com/watch?v=8r3iXanFcNk', // 6 weeks
    'https://www.youtube.com/watch?v=Kk9e-zkOk88', // 9 weeks
    'https://www.youtube.com/watch?v=Pqzeqt7j2uQ', // 12 weeks
    'https://www.youtube.com/watch?v=5rWYzT4VlLU', // 15 weeks
    'https://www.youtube.com/watch?v=hD6eSvkWXfE', // 18 weeks
    'https://www.youtube.com/watch?v=XD__iZhK4MM', // 21 weeks
    'https://www.youtube.com/watch?v=27PzfMoopvg', // 24 weeks
    ''  // 27 weeks - 링크 없음
  ]);
  const [editingReviewLinks, setEditingReviewLinks] = useState<string[]>([
    'https://www.youtube.com/watch?v=TeQTJb9LkwI',
    'https://www.youtube.com/watch?v=8Ddgy5tCKtg',
    'https://www.youtube.com/watch?v=8r3iXanFcNk',
    'https://www.youtube.com/watch?v=Kk9e-zkOk88',
    'https://www.youtube.com/watch?v=Pqzeqt7j2uQ',
    'https://www.youtube.com/watch?v=5rWYzT4VlLU',
    'https://www.youtube.com/watch?v=hD6eSvkWXfE',
    'https://www.youtube.com/watch?v=XD__iZhK4MM',
    'https://www.youtube.com/watch?v=27PzfMoopvg',
    ''  // 27 weeks - 링크 없음
  ]);
  // 각 학력 카드별 드롭다운 상태 (eduIndex_fieldName 형태로 관리)
  const [eduDropdowns, setEduDropdowns] = useState<{ [key: string]: boolean }>({});
  // 학교 검색어 상태
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<{ [key: string]: string }>({});
  // 모달 바디 ref (자동 스크롤용)
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const cardsRef = useRef<HTMLDivElement>(null);

  // 섹션 5 물결 파동 상태
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);
  const lastRippleTime = useRef(0);

  // 스크롤 애니메이션 상태
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 링크 없음 툴팁 상태
  const [noLinkTooltip, setNoLinkTooltip] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // 클릭한 요소가 드롭다운 내부가 아니면 모든 드롭다운 닫기
      if (!target.closest('.edu-custom-dropdown')) {
        setEduDropdowns({});
        setSchoolSearchQuery({});
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('mousedown', handleClickOutside);

    // cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 스크롤 애니메이션 - Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.getAttribute('data-card-id');
            if (cardId) {
              setVisibleCards((prev) => new Set([...Array.from(prev), cardId]));
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    Object.values(cardRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // 모달 열기
  const openModal = (edu: EduData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEdu(edu);
    setModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalOpen(false);
    setSelectedEdu(null);
  };

  const handleWithUsClick = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 1000);
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX;
    setDragOffset(diff);
  };

  // 드래그 종료
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // 드래그 거리에 따라 페이지 변경
    if (dragOffset < -100 && currentPage < 1) {
      setCurrentPage(currentPage + 1);
    } else if (dragOffset > 100 && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // 명언 카드 틸트 효과
  const handleCardTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  }, []);

  const handleCardTiltReset = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  // 섹션 5 물결 파동 핸들러
  const handleIntroMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!introRef.current) return;

    // 카드 영역 위에서는 물결 생성 안함
    const target = e.target as HTMLElement;
    if (target.closest('.intro-card')) return;

    // 쓰로틀링: 150ms 간격으로만 물결 생성
    const now = Date.now();
    if (now - lastRippleTime.current < 150) return;
    lastRippleTime.current = now;

    const rect = introRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y
    };

    setRipples(prev => [...prev.slice(-5), newRipple]); // 최대 6개만 유지

    // 2초 후 물결 제거
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 2000);
  }, []);

  return (
    <div className="cluster2-content">
      {/* PROFILE 헤더 */}
      <div className="cluster2-title-wrapper">
        <div className="title-inner">
          <h1 className="cluster2-title-shadow">PROFILE</h1>
          <h1 className="cluster2-title">PROFILE</h1>
        </div>
        {/* 설명 텍스트 */}
        <div className="section1-description">
          <p>이 페이지는 사회로 나아가는 우리의 모습이 등장합니다.</p>
          <p>우리가 어떻게 바라봤던, 나의 모습, 나의 능력, 나의 경험.. 우리는 그때 그 목표에 얼마나 가까이 살고 있나요?</p>
          <p className="small-text">우수하고, 뛰어나고, 멋진 건 아무 짝에도 소용 없습니다. 남들의 시선도 무시하세요! 😊</p>
          <p className="small-text">중요한건, 내가 나답게 세상에 보여질 수 있는지, 그리고 그 모습을 얼마나 후회없이 그려나가고 있는지 입니다.</p>
          <p className="quote-text">"Know thyself"</p>
          <p className="quote-highlight">"너 자신을 알라"</p>
          <p className="quote-author">- 소크라테스 (Socrates) -</p>
        </div>
      </div>

      {/* 상단 섹션: 연결된 프레임 */}
      <div className="cluster2-top-frame" style={{ position: 'relative' }}>
        {/* Floating Icons */}
        <div className="floating-icons">
          <div className="edit-icon" onClick={() => setSection1ModalOpen(true)}>
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
        {/* 왼쪽 카드 */}
        <div className="frame-left">
          <h2 className="adventure-title">Adventure With Us</h2>

          {/* 큰 육각형 이미지 4개 */}
          <div className="hexagon-large-row">
            <div
              className={`hexagon-large-item ${!subPhotos[0] ? 'empty' : ''}`}
              onClick={() => handleSetStarred(0)}
              style={{ cursor: subPhotos[0] ? 'pointer' : 'default' }}
            >
              <div className="hex-large">
                {subPhotos[0] ? <img src={subPhotos[0]} alt="Joy" /> : <i className="ti ti-photo-plus"></i>}
              </div>
              <span className="hex-label">Joy</span>
            </div>
            <div
              className={`hexagon-large-item ${!subPhotos[1] ? 'empty' : ''}`}
              onClick={() => handleSetStarred(1)}
              style={{ cursor: subPhotos[1] ? 'pointer' : 'default' }}
            >
              <div className="hex-large">
                {subPhotos[1] ? <img src={subPhotos[1]} alt="Blue" /> : <i className="ti ti-photo-plus"></i>}
              </div>
              <span className="hex-label">Blue</span>
            </div>
            <div
              className={`hexagon-large-item ${!subPhotos[2] ? 'empty' : ''}`}
              onClick={() => handleSetStarred(2)}
              style={{ cursor: subPhotos[2] ? 'pointer' : 'default' }}
            >
              <div className="hex-large">
                {subPhotos[2] ? <img src={subPhotos[2]} alt="Passion" /> : <i className="ti ti-photo-plus"></i>}
              </div>
              <span className="hex-label">Passion</span>
            </div>
            <div
              className={`hexagon-large-item ${!subPhotos[3] ? 'empty' : ''}`}
              onClick={() => handleSetStarred(3)}
              style={{ cursor: subPhotos[3] ? 'pointer' : 'default' }}
            >
              <div className="hex-large">
                {subPhotos[3] ? <img src={subPhotos[3]} alt="Moments" /> : <i className="ti ti-photo-plus"></i>}
              </div>
              <span className="hex-label">Moments</span>
            </div>
          </div>

          <div className="avatar-row">
            <div className="hexagon-stack">
              <div className="hex-avatar"><img src="/images/0/cluster 2/image 1.png" alt="" /></div>
              <div className="hex-avatar"><img src="/images/0/cluster 2/image 2.png" alt="" /></div>
              <div className="hex-avatar"><img src="/images/0/cluster 2/image 3.png" alt="" /></div>
              <div className="hex-avatar"><img src="/images/0/cluster 2/image 4.png" alt="" /></div>
              <div className="hex-more">25+</div>
            </div>
            <span className="avatar-count">999 <span className="joined-text">Cluving Joined</span></span>
          </div>
        </div>

        {/* 중앙 프로필 사진 */}
        <div className={`frame-center ${!mainPhoto ? 'empty' : ''}`}>
          {mainPhoto ? (
            <img src={mainPhoto} alt="Profile" />
          ) : (
            <div className="empty-photo-placeholder">
              <i className="ti ti-photo-plus"></i>
              <span>사진을 등록해주세요</span>
            </div>
          )}
        </div>

        {/* 오른쪽 카드 */}
        <div className="frame-right">
          <div className="mascot-icon">
            <img src="/images/0/cluster 2/ok 01.png" alt="" />
            <div className="speech-bubble">안녕 !</div>
          </div>
          <span className="progress-label">OH, MY DREAM</span>
          <span className="progress-value">99.9%</span>
          <button className={`with-us-btn ${isWiggling ? 'wiggle' : ''}`} onClick={handleWithUsClick}>
            <img src="/images/0/cluster 2/button box.png" alt="" />
            <span>Wiht us</span>
          </button>
        </div>
      </div>

      {/* 섹션 2-1: 비디오 섹션 */}
      <div className="cluster2-videos" style={{ position: 'relative' }}>
        {/* Floating Icons */}
        <div className="floating-icons">
          <div className="edit-icon" onClick={() => { setEditingVideoData([...videoData]); setSection21ModalOpen(true); }}>
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

        <div className="videos-header">
          <h2 className="videos-title">Let Me Speak My Own Vision</h2>
          <button className="view-all-btn">View All</button>
        </div>

        <div className="videos-grid">
          {videoData.map((video, index) => (
            <div key={video.id} className={`video-card ${!video.videoUrl ? 'empty-placeholder' : 'has-video'}`}>
              {video.isBookmarked && (
                <div className="bookmark-flag">
                  <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
                    <path d="M0 0H40V50L20 40L0 50V0Z" fill="#F5A623"/>
                  </svg>
                </div>
              )}
              {video.thumbnail === "999" ? (
                <div className="video-thumbnail-999"></div>
              ) : !video.videoUrl ? (
                <div className="video-placeholder">
                  <div className="placeholder-icon">
                    <i className="ti ti-video-plus"></i>
                  </div>
                  <p className="placeholder-text">영상을 추가해주세요</p>
                </div>
              ) : video.thumbnail === "placeholder" ? (
                <div className="video-thumbnail-gradient"></div>
              ) : (
                <img src={video.thumbnail || getYouTubeThumbnail(video.videoUrl)} alt={video.title} className="video-thumbnail-image" />
              )}
              <div className="video-overlay">
                {(video.videoUrl || video.thumbnail === "999") && (
                  <>
                    <div className="video-info-top">
                      <div className="video-info-left">
                        <h3 className="video-title">
                          {video.title.split(' ').map((word, idx) =>
                            idx === 0 ? <span key={idx} className="highlight-orange">{word}</span> : ' ' + word
                          )}
                        </h3>
                        <span className="video-author">{video.author}</span>
                      </div>
                      <div className="video-info-right">
                        <span className="dot-separator">●</span>
                        <span className="viewers-count">{video.viewers}</span>
                      </div>
                    </div>
                    <div
                      className="play-button"
                      onClick={video.videoUrl ? () => window.open(video.videoUrl, '_blank') : undefined}
                      style={{ cursor: video.videoUrl ? 'pointer' : 'default' }}
                    >
                      <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                        <circle cx="45" cy="45" r="40" fill="#FFC300"/>
                        <circle cx="45" cy="45" r="30" fill="#FFF"/>
                        {video.videoUrl && (
                          <path d="M38 30L60 45L38 60V30Z" fill="#FFC300" rx="1"/>
                        )}
                      </svg>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="videos-navigation">
          <button className="nav-btn nav-prev">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="nav-btn nav-next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>

      {/* 인용문 섹션 */}
      <div className="cluster2-quotes" style={{ position: 'relative' }}>
        {/* Floating Icons */}
        <div className="floating-icons">
          <div className="edit-icon" onClick={() => { setEditingSloganData(sloganData); setSection2ModalOpen(true); }}>
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
        <div className="quotes-bg-image">
          <img src="/images/0/cluster 2/bg00.png" alt="" />
        </div>
        <div className="quotes-cards">
          <div
            className={`quote-card scroll-animate ${visibleCards.has('quote-1') ? 'visible' : ''}`}
            ref={(el) => { cardRefs.current['quote-1'] = el; }}
            data-card-id="quote-1"
            style={{ transitionDelay: '0ms' }}
          >
            <img className="diamond-icon" src="/images/0/cluster 2/icon/diamond.png" alt="" />
            <span className="quote-mark">&quot;</span>
            <div className="quote-body">
              <span className="quote-badge">Per Aspera Ad Astra</span>
              <p className="quote-text">
                {sloganData.slogan1.content}
              </p>
              <div className="quote-footer">
                <div className="quote-author">
                  <img src={subPhotos[0] || "/images/0/cluster 2/이안1.webp"} alt="" />
                  <div className="author-info">
                    <span className="author-name">Hwang Yeongueong</span>
                    <span className="author-role">{sloganData.slogan1.option}</span>
                  </div>
                </div>
                <div className="quote-score">
                  <span className="score-label">CLOUD SCORE</span>
                  <div className="score-row">
                    <span className="score-stars animated-stars">
                      <span className="star">✦</span>
                      <span className="star">✦</span>
                      <span className="star">✦</span>
                      <span className="star">✦</span>
                      <span className="star">✦</span>
                    </span>
                    <span className="score-count">6/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`quote-card scroll-animate ${visibleCards.has('quote-2') ? 'visible' : ''}`}
            ref={(el) => { cardRefs.current['quote-2'] = el; }}
            data-card-id="quote-2"
            style={{ transitionDelay: '150ms' }}
          >
            <img className="diamond-icon" src="/images/0/cluster 2/icon/diamond.png" alt="" />
            <span className="quote-mark">&quot;</span>
            <div className="quote-body">
              <span className="quote-badge">Per Aspera Ad Astra</span>
              <p className="quote-text">
                {sloganData.slogan2.content}
              </p>
              <div className="quote-footer">
                <div className="quote-author">
                  <img src={subPhotos[2] || "/images/0/cluster 2/이안3.jpg"} alt="" />
                  <div className="author-info">
                    <span className="author-name">Hwang Yeongueong</span>
                    <span className="author-role">{sloganData.slogan2.option}</span>
                  </div>
                </div>
                <div className="quote-score">
                  <span className="score-label">CLOUD SCORE</span>
                  <div className="score-row">
                    <span className="score-stars animated-stars">
                      <span className="star">✦</span>
                      <span className="star">✦</span>
                      <span className="star">✦</span>
                      <span className="star">✦</span>
                      <span className="star">✦</span>
                    </span>
                    <span className="score-count">6/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 학력 섹션 */}
      <div
        className="cluster2-education"
        style={{ position: 'relative' }}
      >
        {/* Floating Icons */}
        <div className="floating-icons">
          <div className="edit-icon" onClick={() => { setEditingEduData([...educationData]); setSection3ModalOpen(true); }}>
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
        <div className="edu-bg-image">
          <img src="/images/0/cluster 2/bg04.png" alt="" />
        </div>
        <div className="edu-center-line">
          <img src="/images/0/cluster 2/section 03.png" alt="" />
        </div>
        <div
          className="edu-cards-wrapper"
          ref={cardsRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `translateX(calc(-${currentPage * 350}px + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 0.4s ease',
            userSelect: 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* 최종학력을 맨 앞에 배치하고, 나머지는 그 뒤에 배치 */}
          {[...educationData].sort((a, b) => (b.isFinal ? 1 : 0) - (a.isFinal ? 1 : 0)).map((edu, index) => (
            <div className={`edu-card ${edu.isFinal ? 'first' : ''}`} key={index}>
              <img className="edu-border-tl" src="/images/0/cluster 2/border.png" alt="" />
              <img className="edu-border-br" src="/images/0/cluster 2/border.png" alt="" />
              <img className="edu-bg-icon" src="/images/0/cluster 2/icon/Success Plan.png" alt="" />
              <div className="edu-header">
                <h3 className="edu-school"><span className="school-circle"></span><span className="school-name">{edu.school}</span></h3>
              </div>
              <ul className="edu-details">
                <li><span className="dot">·</span><span className="label">상태</span><span className="value">{edu.status}</span></li>
                <li><span className="dot">·</span><span className="label">계열</span><span className="value">{edu.category}</span></li>
                <li><span className="dot">·</span><span className="label">전공 1</span><span className="value">{edu.major1}</span></li>
                <li><span className="dot">·</span><span className="label">전공 2</span><span className="value">{edu.major2}</span></li>
                <li><span className="dot">·</span><span className="label">전공 3</span><span className="value">{edu.major3}</span></li>
                <li><span className="dot">·</span><span className="label">기간</span><span className="value highlight">{edu.period.includes('~ing') ? (<>{edu.period.replace('~ing', '')}<span className="ing-highlight">~ing</span></>) : edu.period}</span></li>
                <li><span className="dot">·</span><span className="label">성적</span><span className="value highlight">{edu.gradeMax === '9등급' ? `${edu.gradeValue}등급` : edu.gradeMax === '100%' ? `${edu.gradeValue}%` : edu.gradeValue}{edu.gradeMax !== '기타' && ` / ${edu.gradeMax}`}</span></li>
              </ul>
              <div
                className="edu-footer"
                onClick={(e) => openModal(edu, e)}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer' }}
              >
                <div className="edu-description">
                  <img className="edu-scroll-icon" src="/images/0/cluster 2/icon/Scroll.png" alt="" />
                  <p className="desc-text">{edu.description.substring(0, 80)}...</p>
                  <span className="arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
              {edu.isFinal && (
                <div className="final-badge">
                  <img className="final-star" src="/images/0/cluster 2/icon/trophy.png" alt="" />
                  <div className="final-label">
                    <span>FINAL</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="edu-pagination">
          <div className="pagination-dots">
            {/* 카드 수에 따라 페이지네이션 동적 생성 (1~4개: 2페이지, 5개 이상: 3페이지) */}
            {educationData.length > 2 && Array.from({ length: educationData.length <= 4 ? 2 : 3 }, (_, index) => (
              <button
                key={index}
                className={`pagination-dot ${currentPage === index ? 'active' : ''}`}
                onClick={() => setCurrentPage(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CLUB REVIEW 배너 */}
      <div className="cluster2-review-banner" style={{ position: 'relative' }}>
        {/* Floating Icons */}
        <div className="floating-icons">
          <div className="edit-icon" onClick={() => { setEditingReviewLinks([...reviewLinks]); setSection4ModalOpen(true); }}>
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
        <div className="review-banner-inner">
          <h2 className="review-banner-title-shadow">CLUB REVIEW</h2>
          <h2 className="review-banner-title">CLUB REVIEW</h2>
        </div>
      </div>

      {/* 섹션 4 - Cluving Review */}
      <div className="cluster2-section4" style={{ position: 'relative' }}>
        {/* 왼쪽 - 명언 카드 3개 */}
        <div className="section4-left">
          <div
            className="quote-card-item card-1"
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltReset}
          >
            <img className="quote-bg" src="/images/0/cluster 2/명언 1-1.png" alt="" />
            <div className="quote-overlay">
              <div className="quote-author-badge">
                <div className="hex-wrapper">
                  <div className="hex-border">
                    <svg viewBox="0 0 89 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="2,39.5 23.25,2 65.75,2 87,39.5 65.75,77 23.25,77" stroke="#FFF" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <img src="/images/0/cluster 2/명언 1.png" alt="" />
                </div>
                <span>- 인디언 속담 -</span>
              </div>
              <p className="quote-text">"누구나 덮어놓고 '시작' 할 수 있지만, 목표한 바 대로 '마무리' 하는 것은 누구나 할 수 있는 것이 아니다."</p>
            </div>
          </div>
          <div
            className="quote-card-item card-2"
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltReset}
          >
            <img className="quote-bg" src="/images/0/cluster 2/명언 2-1.png" alt="" />
            <div className="quote-overlay">
              <div className="quote-author-badge">
                <div className="hex-wrapper">
                  <div className="hex-border">
                    <svg viewBox="0 0 89 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="2,39.5 23.25,2 65.75,2 87,39.5 65.75,77 23.25,77" stroke="#FFF" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <img src="/images/0/cluster 2/명언 2.png" alt="" />
                </div>
                <span>- 노자 -</span>
              </div>
              <p className="quote-text">"끝을 맺기를 처음과 같이 하면 실패가 없다"</p>
            </div>
          </div>
          <div
            className="quote-card-item card-3"
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltReset}
          >
            <img className="quote-bg" src="/images/0/cluster 2/명언 3-1.png" alt="" />
            <div className="quote-overlay">
              <div className="quote-author-badge">
                <div className="hex-wrapper">
                  <div className="hex-border">
                    <svg viewBox="0 0 89 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="2,39.5 23.25,2 65.75,2 87,39.5 65.75,77 23.25,77" stroke="#FFF" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <img src="/images/0/cluster 2/명언 3.png" alt="" />
                </div>
                <span>- 로빈 샤르마 -</span>
              </div>
              <p className="quote-text">"강하게 시작하는 건 좋지만, 강하게 마무리하는 건 정말 대단해요"</p>
            </div>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="section4-right">
          {/* Total Complete 큰 박스 */}
          <div className="total-complete-box">
            <img className="border-tl" src="/images/0/cluster 2/border.png" alt="" />
            <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
            <img className="victory-badge" src="/images/0/cluster 2/icon/medal 30.png" alt="" />
            <div className="complete-text">
              <span className="complete-label">Cluving Review -</span>
              <h2><span className="highlight">T</span>otal <span className="highlight">C</span>omplete</h2>
              <button
                className="goto-btn"
                onClick={(e) => {
                  if (reviewLinks[0]) {
                    window.open(reviewLinks[0], '_blank');
                  } else {
                    setNoLinkTooltip({ visible: true, x: e.clientX, y: e.clientY });
                    setTimeout(() => setNoLinkTooltip({ visible: false, x: 0, y: 0 }), 2000);
                  }
                }}
                style={{ opacity: reviewLinks[0] ? 1 : 0.5 }}
              >바로가기 &gt;</button>
            </div>
          </div>

          {/* 9개의 작은 박스 그리드 */}
          <div className="review-grid-9">
            {[3, 6, 9, 12, 15, 18, 21, 24, 27].map((weeks, index) => (
              <div key={weeks} className="review-week-item">
                <img className="border-br" src="/images/0/cluster 2/border.png" alt="" />
                <img
                  src={`/images/0/cluster 2/icon/medal ${weeks}.png`}
                  alt=""
                  className={`medal-icon${[3, 6, 9, 21].includes(weeks) ? ' flip-x' : ''}`}
                />
                <span className="review-label">Cluving Review -</span>
                <span className="review-weeks">{weeks} weeks</span>
                <button
                  className="review-btn"
                  onClick={(e) => {
                    if (reviewLinks[index + 1]) {
                      window.open(reviewLinks[index + 1], '_blank');
                    } else {
                      setNoLinkTooltip({ visible: true, x: e.clientX, y: e.clientY });
                      setTimeout(() => setNoLinkTooltip({ visible: false, x: 0, y: 0 }), 2000);
                    }
                  }}
                  style={{ opacity: reviewLinks[index + 1] ? 1 : 0.5 }}
                >바로가기 &gt;</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 자기소개서 섹션 */}
      <div
        className="cluster2-intro"
        style={{ position: 'relative' }}
        ref={introRef}
        onMouseMove={handleIntroMouseMove}
      >
        {/* Floating Icons */}
        <div className="floating-icons">
          <div className="edit-icon search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <div className="tooltip">등록된 도움말이 없습니다</div>
          </div>
        </div>
        {/* 물결 파동 효과 */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="ripple-effect"
            style={{
              left: ripple.x,
              top: ripple.y
            }}
          />
        ))}
        <div className="intro-bg">
          <img src="/images/0/cluster 2/bg05.png" alt="" />
        </div>
        <div className="intro-title-wrapper">
          <h2 className="intro-title-shadow">자기소개서</h2>
          <h2 className="intro-title">자기소개서</h2>
        </div>
        <p className="intro-sub">THIS IS MY LIFE</p>
        <div className="intro-cards">
          <div className="intro-row top-row">
            {introCards.slice(0, 3).map((card, index) => (
              <div
                key={card.id}
                className="intro-card"
                onClick={() => {
                  setSelectedIntroCard(index);
                  setIsEditingIntro(false);
                  setIntroModalOpen(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
                <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
                <div className="card-header">
                  <img src={card.icon} alt="" className="card-icon" />
                  <div className="title-row">
                    <h4>{card.title}</h4>
                    <button className="card-arrow" data-tooltip={`${card.title} 자세히 보기`}>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                  <span className="card-subtitle">{card.subtitle}</span>
                </div>
                <p>{card.content.length > 40 ? card.content.slice(0, 40) + '...' : card.content}</p>
              </div>
            ))}
          </div>
          <div className="intro-row bottom-row">
            {introCards.slice(3, 5).map((card, index) => (
              <div
                key={card.id}
                className="intro-card"
                onClick={() => {
                  setSelectedIntroCard(index + 3);
                  setIsEditingIntro(false);
                  setIntroModalOpen(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
                <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
                <div className="card-header">
                  <img src={card.icon} alt="" className="card-icon" />
                  <div className="title-row">
                    <h4>{card.title}</h4>
                    <button className="card-arrow" data-tooltip={`${card.title} 자세히 보기`}>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                  <span className="card-subtitle">{card.subtitle}</span>
                </div>
                <p>{card.content.length > 40 ? card.content.slice(0, 40) + '...' : card.content}</p>
              </div>
            ))}
            <div className="intro-card empty waiting">
              <img className="border-tl" src="/images/0/cluster 2/border02.png" alt="" />
              <img className="border-br" src="/images/0/cluster 2/border02.png" alt="" />
              <div className="waiting-content">
                <img src="/images/0/cluster 2/icon/waiting icon.png" alt="" className="waiting-icon" />
                <span className="waiting-text">WAITING FOR YOU</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 학력 상세 모달 - 비고 내용만 표시 */}
      {modalOpen && selectedEdu && (
        <div className="edu-modal-overlay" onClick={closeModal}>
          <div className="edu-modal description-only" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="modal-header">
              <div className="modal-school-info">
                <h2>{selectedEdu.school}</h2>
                {selectedEdu.isFinal && <span className="final-tag">FINAL</span>}
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-description">
                <img className="scroll-icon" src="/images/0/cluster 2/icon/Scroll.png" alt="" />
                <p>{selectedEdu.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 1 모달 - 프로필 사진 수정 */}
      {section1ModalOpen && (
        <div className="section1-modal-overlay" onClick={() => setSection1ModalOpen(false)}>
          <div className="section1-modal" onClick={(e) => e.stopPropagation()}>
            <div className="section1-modal-header">
              <h3>프로필 사진 수정</h3>
              <p className="modal-subtitle">본인을 대표하는 사진을 등록해주세요😊</p>
              <button className="modal-close-btn" onClick={() => setSection1ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section1-modal-body">
              {/* 숨겨진 파일 input들 */}
              <input
                type="file"
                ref={mainPhotoInputRef}
                onChange={handleMainPhotoChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={subPhotoInputRef}
                onChange={handleSubPhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {/* 메인 사진 */}
              <div className="main-photo-section">
                <span className="section-label">메인 사진</span>
                <div className="main-photo-box">
                  <div className="main-photo-preview">
                    {mainPhoto ? (
                      <img src={mainPhoto} alt="메인 사진" />
                    ) : (
                      <div className="empty-photo">
                        <i className="ti ti-photo-plus"></i>
                      </div>
                    )}
                  </div>
                  <div className="main-photo-buttons">
                    <button
                      className="change-photo-btn"
                      onClick={() => mainPhotoInputRef.current?.click()}
                    >
                      <i className="ti ti-upload"></i>
                      <span>사진 변경</span>
                    </button>
                    {mainPhoto && (
                      <button
                        className="delete-photo-btn"
                        onClick={handleMainPhotoDelete}
                      >
                        <i className="ti ti-trash"></i>
                        <span>삭제</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 서브 사진 */}
              <div className="sub-photo-section">
                <span className="section-label">서브 사진</span>
                <div className="sub-photo-grid">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="sub-photo-item">
                      <div className="sub-photo-preview">
                        {subPhotos[index] ? (
                          <img src={subPhotos[index]!} alt={`서브 사진 ${index + 1}`} />
                        ) : (
                          <div className="empty-photo">
                            <i className="ti ti-photo-plus"></i>
                          </div>
                        )}
                      </div>
                      <div className="sub-photo-actions">
                        <button
                          className="action-btn upload"
                          data-tooltip="사진 업로드"
                          onClick={() => {
                            setCurrentSubIndex(index);
                            subPhotoInputRef.current?.click();
                          }}
                        >
                          <i className="ti ti-upload"></i>
                        </button>
                        <button
                          className={`action-btn delete ${!subPhotos[index] ? 'disabled' : ''}`}
                          data-tooltip="사진 삭제"
                          onClick={() => subPhotos[index] && handleSubPhotoDelete(index)}
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                        <button
                          className={`action-btn star ${!subPhotos[index] ? 'disabled' : ''}`}
                          onClick={() => handleSetStarred(index)}
                          data-tooltip={subPhotos[index] ? "메인 사진으로 설정" : "사진을 먼저 등록하세요"}
                        >
                          <i className="ti ti-star"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="section1-modal-footer">
              <button className="cancel-btn" onClick={() => setSection1ModalOpen(false)}>취소</button>
              <button className="save-btn" onClick={() => setSection1ModalOpen(false)}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 2 모달 - 슬로건 편집 */}
      {section2ModalOpen && (
        <div className="section2-modal-overlay" onClick={() => setSection2ModalOpen(false)}>
          <div className="section2-modal" onClick={(e) => e.stopPropagation()}>
            <div className="section2-modal-header">
              <h3>슬로건 편집</h3>
              <p className="modal-subtitle">본인을 나타내는 나만의 슬로건을 입력해주세요 😊</p>
              <button className="modal-close-btn" onClick={() => setSection2ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section2-modal-body">
              {/* 슬로건 1 */}
              <div className="slogan-edit-item">
                <span className="slogan-label">슬로건 1</span>
                <div className="slogan-dropdown-wrapper">
                  <button
                    className="slogan-dropdown-btn"
                    onClick={() => { setDropdown1Open(!dropdown1Open); setDropdown2Open(false); }}
                  >
                    <span>{editingSloganData.slogan1.option}</span>
                    <i className={`ti ti-chevron-down ${dropdown1Open ? 'rotate' : ''}`}></i>
                  </button>
                  {dropdown1Open && (
                    <div className="slogan-dropdown-menu">
                      {sloganOptions.map((option) => (
                        <div
                          key={option}
                          className={`dropdown-item ${editingSloganData.slogan1.option === option ? 'selected' : ''}`}
                          onClick={() => {
                            setEditingSloganData({
                              ...editingSloganData,
                              slogan1: { ...editingSloganData.slogan1, option }
                            });
                            setDropdown1Open(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="slogan-textarea-wrapper">
                  <textarea
                    value={editingSloganData.slogan1.content}
                    onChange={(e) => {
                      if (e.target.value.length <= 86) {
                        setEditingSloganData({
                          ...editingSloganData,
                          slogan1: { ...editingSloganData.slogan1, content: e.target.value }
                        });
                      }
                    }}
                    maxLength={86}
                    placeholder="슬로건 내용을 입력하세요 (최대 86자)"
                  />
                  <span className="char-count">{editingSloganData.slogan1.content.length}/86</span>
                </div>
              </div>

              {/* 슬로건 2 */}
              <div className="slogan-edit-item">
                <span className="slogan-label">슬로건 2</span>
                <div className="slogan-dropdown-wrapper">
                  <button
                    className="slogan-dropdown-btn"
                    onClick={() => { setDropdown2Open(!dropdown2Open); setDropdown1Open(false); }}
                  >
                    <span>{editingSloganData.slogan2.option}</span>
                    <i className={`ti ti-chevron-down ${dropdown2Open ? 'rotate' : ''}`}></i>
                  </button>
                  {dropdown2Open && (
                    <div className="slogan-dropdown-menu">
                      {sloganOptions.map((option) => (
                        <div
                          key={option}
                          className={`dropdown-item ${editingSloganData.slogan2.option === option ? 'selected' : ''}`}
                          onClick={() => {
                            setEditingSloganData({
                              ...editingSloganData,
                              slogan2: { ...editingSloganData.slogan2, option }
                            });
                            setDropdown2Open(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="slogan-textarea-wrapper">
                  <textarea
                    value={editingSloganData.slogan2.content}
                    onChange={(e) => {
                      if (e.target.value.length <= 86) {
                        setEditingSloganData({
                          ...editingSloganData,
                          slogan2: { ...editingSloganData.slogan2, content: e.target.value }
                        });
                      }
                    }}
                    maxLength={86}
                    placeholder="슬로건 내용을 입력하세요 (최대 86자)"
                  />
                  <span className="char-count">{editingSloganData.slogan2.content.length}/86</span>
                </div>
              </div>
            </div>
            <div className="section2-modal-footer">
              <button className="cancel-btn" onClick={() => setSection2ModalOpen(false)}>취소</button>
              <button
                className="save-btn"
                onClick={() => {
                  setSloganData(editingSloganData);
                  setSection2ModalOpen(false);
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 2-1 모달 - 영상 편집 */}
      {section21ModalOpen && (
        <div className="section21-modal-overlay" onClick={() => setSection21ModalOpen(false)}>
          <div className="section21-modal" onClick={(e) => e.stopPropagation()}>
            <div className="section21-modal-header">
              <h3>영상 편집</h3>
              <p className="modal-subtitle">본인이 활동 했거나, 본인을 나타내는 영상 링크를 추가해주세요 😊</p>
              <button className="modal-close-btn" onClick={() => setSection21ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section21-modal-body">
              {editingVideoData.map((video, index) => (
                <div key={video.id} className="video-edit-item">
                  <div className="video-edit-header">
                    <h4>영상 {index + 1}</h4>
                    <div className="bookmark-icon">
                      <i className="ti ti-bookmark-filled"></i>
                    </div>
                  </div>

                  {/* 영상 링크 입력 */}
                  <div className="form-group">
                    <label>영상 링크 (YouTube URL)</label>
                    <input
                      type="url"
                      value={video.videoUrl}
                      onChange={(e) => {
                        const newData = [...editingVideoData];
                        newData[index].videoUrl = e.target.value;
                        // 썸네일 자동 업데이트
                        newData[index].thumbnail = getYouTubeThumbnail(e.target.value);
                        setEditingVideoData(newData);
                      }}
                      placeholder="https://youtu.be/... 또는 https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  {/* 썸네일 미리보기 */}
                  {video.videoUrl && (
                    <div className="thumbnail-preview">
                      <label>썸네일 미리보기</label>
                      <div className="thumbnail-image-wrapper">
                        {getYouTubeThumbnail(video.videoUrl) ? (
                          <img
                            src={getYouTubeThumbnail(video.videoUrl)}
                            alt={`영상 ${index + 1} 썸네일`}
                            onError={(e) => {
                              // 최고 화질이 없으면 기본 화질로 fallback
                              const target = e.target as HTMLImageElement;
                              const videoId = extractYouTubeId(video.videoUrl);
                              if (videoId && !target.src.includes('hqdefault')) {
                                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }
                            }}
                          />
                        ) : (
                          <div className="no-thumbnail">유효한 YouTube URL을 입력하세요</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="section21-modal-footer">
              <button className="cancel-btn" onClick={() => setSection21ModalOpen(false)}>취소</button>
              <button
                className="save-btn"
                onClick={() => {
                  setVideoData([...editingVideoData]);
                  setSection21ModalOpen(false);
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 5 모달 - 자기소개서 카드 상세/편집 */}
      {introModalOpen && selectedIntroCard !== null && (
        <div className="intro-modal-overlay" onClick={() => {
          if (isEditingIntro && editingIntroData.content !== introCards[selectedIntroCard].content) {
            if (!confirm('변경사항이 저장되지 않았습니다. 정말 닫으시겠습니까?')) {
              return;
            }
            setIsEditingIntro(false);
          }
          setIntroModalOpen(false);
        }}>
          <div className="intro-modal" onClick={(e) => e.stopPropagation()}>
            <div className="intro-modal-header">
              <div className="header-left">
                <img src={introCards[selectedIntroCard].icon} alt="" className="modal-icon" />
                <h3>{introCards[selectedIntroCard].title}</h3>
              </div>
              <div className="header-right">
                {isEditingIntro ? (
                  <>
                    <button
                      className="cancel-edit-btn"
                      onClick={() => {
                        if (editingIntroData.content !== introCards[selectedIntroCard].content) {
                          if (!confirm('변경사항이 저장되지 않았습니다. 정말 취소하시겠습니까?')) {
                            return;
                          }
                        }
                        setIsEditingIntro(false);
                      }}
                    >
                      취소
                    </button>
                    <button
                      className="save-edit-btn"
                      onClick={() => {
                        const newCards = [...introCards];
                        newCards[selectedIntroCard] = {
                          ...newCards[selectedIntroCard],
                          content: editingIntroData.content
                        };
                        setIntroCards(newCards);
                        setIsEditingIntro(false);
                      }}
                    >
                      저장
                    </button>
                  </>
                ) : (
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingIntroData({
                        content: introCards[selectedIntroCard].content
                      });
                      setIsEditingIntro(true);
                    }}
                  >
                    <i className="ti ti-pencil"></i>
                    수정
                  </button>
                )}
                <button className="modal-close-btn" onClick={() => {
                  if (isEditingIntro && editingIntroData.content !== introCards[selectedIntroCard].content) {
                    if (!confirm('변경사항이 저장되지 않았습니다. 정말 닫으시겠습니까?')) {
                      return;
                    }
                    setIsEditingIntro(false);
                  }
                  setIntroModalOpen(false);
                }}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
            </div>
            <div className="intro-modal-body">
              <div className="subtitle-section">
                <p className="subtitle-text">{introCards[selectedIntroCard].subtitle}</p>
              </div>
              <div className="content-section">
                {isEditingIntro ? (
                  <div className="textarea-wrapper">
                    <textarea
                      className="content-textarea"
                      value={editingIntroData.content}
                      onChange={(e) => {
                        if (e.target.value.length <= 1000) {
                          setEditingIntroData({ ...editingIntroData, content: e.target.value });
                        }
                      }}
                      placeholder="내용을 입력하세요 (최대 1,000자)"
                      maxLength={1000}
                    />
                    <span className="char-count">{editingIntroData.content.length} / 1,000</span>
                  </div>
                ) : (
                  <p className="content-text">{introCards[selectedIntroCard].content}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 4 모달 - 바로가기 링크 편집 */}
      {section4ModalOpen && (
        <div className="section4-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSection4ModalOpen(false); }}>
          <div className="section4-modal">
            <div className="section4-modal-header">
              <h3>클럽 리뷰 링크 편집</h3>
              <p className="modal-subtitle">본인이 작성한 클럽 주차 리뷰 링크를 등록해주세요 😊</p>
              <button className="modal-close-btn" onClick={() => setSection4ModalOpen(false)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="section4-modal-body">
              {/* Total Complete */}
              <div className="link-edit-item total">
                <div className="link-item-header">
                  <img src="/images/0/cluster 2/icon/medal 30.png" alt="" className="link-medal" />
                  <span className="link-label">Total Complete</span>
                </div>
                <input
                  type="url"
                  placeholder="링크를 입력하세요 (https://...)"
                  value={editingReviewLinks[0]}
                  onChange={(e) => {
                    const newLinks = [...editingReviewLinks];
                    newLinks[0] = e.target.value;
                    setEditingReviewLinks(newLinks);
                  }}
                />
              </div>
              {/* 3~27 weeks */}
              {[3, 6, 9, 12, 15, 18, 21, 24, 27].map((weeks, index) => (
                <div key={weeks} className="link-edit-item">
                  <div className="link-item-header">
                    <img src={`/images/0/cluster 2/icon/medal ${weeks}.png`} alt="" className="link-medal" />
                    <span className="link-label">{weeks} weeks</span>
                  </div>
                  <input
                    type="url"
                    placeholder="링크를 입력하세요 (https://...)"
                    value={editingReviewLinks[index + 1]}
                    onChange={(e) => {
                      const newLinks = [...editingReviewLinks];
                      newLinks[index + 1] = e.target.value;
                      setEditingReviewLinks(newLinks);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="section4-modal-footer">
              <button className="cancel-btn" onClick={() => setSection4ModalOpen(false)}>취소</button>
              <button
                className="save-btn"
                onClick={() => {
                  setReviewLinks([...editingReviewLinks]);
                  setSection4ModalOpen(false);
                }}
              >저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 섹션 3 모달 - 학력 편집 */}
      {section3ModalOpen && (
        <div className="section3-modal-overlay" onClick={() => {
          if (hasEduChanges) {
            alert('변경사항이 있습니다. 저장 버튼을 눌러 저장해주세요.');
            return;
          }
          setSection3ModalOpen(false);
        }}>
          <div className="section3-modal" onClick={(e) => e.stopPropagation()}>
            <div className="section3-modal-header">
              <h3>학력 편집</h3>
              <p className="modal-subtitle">본인의 학력 사항을 입력해주세요 😊</p>
              <div className="header-actions">
                <button
                  className="add-edu-btn"
                  onClick={() => {
                    const newEdu: EduData = {
                      eduLevel: "",
                      school: "",
                      status: "",
                      category: "",
                      major1: "",
                      major2: "",
                      major3: "",
                      period: "",
                      startYear: "",
                      startMonth: "",
                      endYear: "",
                      endMonth: "",
                      gradeMax: "",
                      gradeValue: "",
                      description: "",
                      isFinal: false
                    };
                    setEditingEduData([...editingEduData, newEdu]);
                    // 새로 추가된 카드로 스크롤
                    setTimeout(() => {
                      if (modalBodyRef.current) {
                        modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
                      }
                    }, 100);
                  }}
                >
                  <i className="ti ti-plus"></i>
                  학력 추가하기
                </button>
                <button className="modal-close-btn" onClick={() => {
                    if (hasEduChanges) {
                      alert('변경사항이 있습니다. 저장 버튼을 눌러 저장해주세요.');
                      return;
                    }
                    setSection3ModalOpen(false);
                  }}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
            </div>
            <div className="section3-modal-body" ref={modalBodyRef}>
              {editingEduData.map((edu, index) => (
                <div key={index} className={`edu-edit-card ${edu.isFinal ? 'is-final' : ''}`}>
                  {/* 헤더: 번호 + 학력 선택 + 최종학력 버튼 */}
                  <div className="edu-edit-header">
                    <span className="edu-edit-number">{index + 1}</span>
                    <div className={`edu-custom-dropdown edu-level-dropdown ${eduDropdowns[`${index}_eduLevel`] ? 'open' : ''}`}>
                      <div
                        className="dropdown-selected"
                        onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_eduLevel`]: !prev[`${index}_eduLevel`] }))}
                      >
                        <span>{edu.eduLevel || '학력 선택'}</span>
                        <i className="ti ti-chevron-down"></i>
                      </div>
                      {eduDropdowns[`${index}_eduLevel`] && (
                        <div className="dropdown-options">
                          {['-', '대학원', '대학교', '고등학교', '중학교', '초등학교'].map((opt) => (
                            <div
                              key={opt}
                              className={`dropdown-option ${edu.eduLevel === opt ? 'selected' : ''}`}
                              onClick={() => {
                                const newData = [...editingEduData];
                                newData[index].eduLevel = opt;
                                newData[index].school = '';
                                setEditingEduData(newData);
                                setEduDropdowns(prev => ({ ...prev, [`${index}_eduLevel`]: false }));
                              }}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="header-buttons">
                      {/* 최종학력 선택 버튼 */}
                      <button
                        className={`final-edu-btn ${edu.isFinal ? 'active' : ''}`}
                        onClick={() => {
                          const newData = editingEduData.map((item, i) => ({
                            ...item,
                            isFinal: i === index
                          }));
                          // 최종학력을 첫 번째로 이동
                          const finalItem = newData[index];
                          newData.splice(index, 1);
                          newData.unshift(finalItem);
                          setEditingEduData(newData);
                          // 자동 스크롤 (상태 업데이트 후 DOM이 갱신된 다음 실행)
                          setTimeout(() => {
                            modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 100);
                        }}
                        title="최종학력으로 설정"
                      >
                        <i className="ti ti-star-filled"></i>
                        <span>{edu.isFinal ? '최종학력' : '최종학력 지정'}</span>
                      </button>
                      {/* 삭제 버튼 */}
                      <button
                        className="delete-edu-btn"
                        onClick={() => {
                          if (editingEduData.length <= 1) {
                            setDeleteConfirmModal({
                              isOpen: true,
                              index: null,
                              schoolName: '',
                              type: 'minimum'
                            });
                            return;
                          }
                          setDeleteConfirmModal({
                            isOpen: true,
                            index: index,
                            schoolName: edu.school || `${index + 1}번 학력`,
                            type: 'edu'
                          });
                        }}
                        title="학력 삭제"
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* 본문 그리드 - 행별로 그룹화 */}
                  <div className="edu-edit-grid">
                    {/* 행 1: 학교 선택 (전체 너비) */}
                    <div className="edu-edit-row">
                      <div className="edu-edit-field full-width">
                        <label>학교<span className="required">*</span></label>
                        <div className={`edu-custom-dropdown edu-school-dropdown ${eduDropdowns[`${index}_school`] ? 'open' : ''}`}>
                          <div
                            className="dropdown-selected"
                            onClick={() => edu.eduLevel && setEduDropdowns(prev => ({ ...prev, [`${index}_school`]: !prev[`${index}_school`] }))}
                            style={{ opacity: edu.eduLevel ? 1 : 0.5, cursor: edu.eduLevel ? 'pointer' : 'not-allowed' }}
                          >
                            <span>{edu.school || (edu.eduLevel ? '학교 선택' : '학력을 먼저 선택하세요')}</span>
                            <i className="ti ti-chevron-down"></i>
                          </div>
                          {eduDropdowns[`${index}_school`] && edu.eduLevel && (
                            <div className="dropdown-options scrollable">
                              {/* 검색 필드 */}
                              <div className="dropdown-search-wrapper" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  className="dropdown-search-input"
                                  placeholder="학교 검색..."
                                  value={schoolSearchQuery[`${index}_school`] || ''}
                                  onChange={(e) => setSchoolSearchQuery(prev => ({ ...prev, [`${index}_school`]: e.target.value }))}
                                  autoFocus
                                />
                              </div>
                              {/* 필터링된 학교 목록 */}
                              {(schoolData[edu.eduLevel] || [])
                                .filter(school =>
                                  !schoolSearchQuery[`${index}_school`] ||
                                  school.toLowerCase().includes(schoolSearchQuery[`${index}_school`].toLowerCase())
                                )
                                .map((school) => (
                                  <div
                                    key={school}
                                    className={`dropdown-option ${edu.school === school ? 'selected' : ''}`}
                                    onClick={() => {
                                      const newData = [...editingEduData];
                                      newData[index].school = school;
                                      setEditingEduData(newData);
                                      setEduDropdowns(prev => ({ ...prev, [`${index}_school`]: false }));
                                      setSchoolSearchQuery(prev => ({ ...prev, [`${index}_school`]: '' }));
                                    }}
                                  >
                                    {school}
                                  </div>
                                ))}
                              <div
                                className="dropdown-option custom-input-option"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  placeholder="직접 입력..."
                                  value={edu.school && !schoolData[edu.eduLevel]?.includes(edu.school) ? edu.school : ''}
                                  onChange={(e) => {
                                    const newData = [...editingEduData];
                                    newData[index].school = e.target.value;
                                    setEditingEduData(newData);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setEduDropdowns(prev => ({ ...prev, [`${index}_school`]: false }));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 행 2: 상태 */}
                    <div className="edu-edit-row">
                      <div className="edu-edit-field full-width">
                        <label>상태<span className="required">*</span></label>
                        <div className={`edu-custom-dropdown ${eduDropdowns[`${index}_status`] ? 'open' : ''}`}>
                          <div
                            className="dropdown-selected"
                            onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_status`]: !prev[`${index}_status`] }))}
                          >
                            <span>{edu.status || '선택'}</span>
                            <i className="ti ti-chevron-down"></i>
                          </div>
                          {eduDropdowns[`${index}_status`] && (
                            <div className="dropdown-options">
                              {['-', '재학', '졸업', '졸예', '휴학', '중퇴'].map((opt) => (
                                <div
                                  key={opt}
                                  className={`dropdown-option ${edu.status === opt ? 'selected' : ''}`}
                                  onClick={() => {
                                    const newData = [...editingEduData];
                                    newData[index].status = opt;
                                    setEditingEduData(newData);
                                    setEduDropdowns(prev => ({ ...prev, [`${index}_status`]: false }));
                                  }}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 행 3: 계열 */}
                    <div className="edu-edit-row">
                      <div className="edu-edit-field full-width">
                        <label>계열</label>
                        <div className={`edu-custom-dropdown ${eduDropdowns[`${index}_category`] ? 'open' : ''}`}>
                          <div
                            className="dropdown-selected"
                            onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_category`]: !prev[`${index}_category`] }))}
                          >
                            <span>{edu.category || '선택'}</span>
                            <i className="ti ti-chevron-down"></i>
                          </div>
                          {eduDropdowns[`${index}_category`] && (
                            <div className="dropdown-options">
                              {['-', '상경', '인문', '자연', '공학', '예체능', '사회', '기타'].map((opt) => (
                                <div
                                  key={opt}
                                  className={`dropdown-option ${edu.category === opt ? 'selected' : ''}`}
                                  onClick={() => {
                                    const newData = [...editingEduData];
                                    newData[index].category = opt;
                                    setEditingEduData(newData);
                                    setEduDropdowns(prev => ({ ...prev, [`${index}_category`]: false }));
                                  }}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 행 4: 전공 1 / 전공 2 / 전공 3 */}
                    <div className="edu-edit-row three-cols">
                      <div className="edu-edit-field">
                        <label>전공 1<span className="required">*</span></label>
                        <input
                          type="text"
                          value={edu.major1}
                          onChange={(e) => {
                            const newData = [...editingEduData];
                            newData[index].major1 = e.target.value;
                            setEditingEduData(newData);
                          }}
                          placeholder="주전공"
                        />
                      </div>
                      <div className="edu-edit-field">
                        <label>전공 2</label>
                        <input
                          type="text"
                          value={edu.major2}
                          onChange={(e) => {
                            const newData = [...editingEduData];
                            newData[index].major2 = e.target.value;
                            setEditingEduData(newData);
                          }}
                          placeholder="복수전공/부전공"
                        />
                      </div>
                      <div className="edu-edit-field">
                        <label>전공 3</label>
                        <input
                          type="text"
                          value={edu.major3}
                          onChange={(e) => {
                            const newData = [...editingEduData];
                            newData[index].major3 = e.target.value;
                            setEditingEduData(newData);
                          }}
                          placeholder="기타 전공"
                        />
                      </div>
                      <p className="major-hint">* 전공이 없을 시 "-"로 입력해주세요.</p>
                    </div>

                    {/* 행 5: 입학 / 졸업 */}
                    <div className="edu-edit-row">
                      <div className="edu-edit-field">
                        <label>입학년도<span className="required">*</span></label>
                        <div className="date-picker-row">
                          <div className={`edu-custom-dropdown small ${eduDropdowns[`${index}_startYear`] ? 'open' : ''}`}>
                            <div
                              className="dropdown-selected"
                              onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_startYear`]: !prev[`${index}_startYear`] }))}
                            >
                              <span>{edu.startYear || '년도'}</span>
                              <i className="ti ti-chevron-down"></i>
                            </div>
                            {eduDropdowns[`${index}_startYear`] && (
                              <div className="dropdown-options scrollable">
                                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                  <div
                                    key={year}
                                    className={`dropdown-option ${edu.startYear === String(year) ? 'selected' : ''}`}
                                    onClick={() => {
                                      const newData = [...editingEduData];
                                      newData[index].startYear = String(year);
                                      setEditingEduData(newData);
                                      setEduDropdowns(prev => ({ ...prev, [`${index}_startYear`]: false }));
                                    }}
                                  >
                                    {year}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`edu-custom-dropdown small ${eduDropdowns[`${index}_startMonth`] ? 'open' : ''}`}>
                            <div
                              className="dropdown-selected"
                              onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_startMonth`]: !prev[`${index}_startMonth`] }))}
                            >
                              <span>{edu.startMonth || '월'}</span>
                              <i className="ti ti-chevron-down"></i>
                            </div>
                            {eduDropdowns[`${index}_startMonth`] && (
                              <div className="dropdown-options scrollable">
                                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => (
                                  <div
                                    key={month}
                                    className={`dropdown-option ${edu.startMonth === month ? 'selected' : ''}`}
                                    onClick={() => {
                                      const newData = [...editingEduData];
                                      newData[index].startMonth = month;
                                      setEditingEduData(newData);
                                      setEduDropdowns(prev => ({ ...prev, [`${index}_startMonth`]: false }));
                                    }}
                                  >
                                    {month}월
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="edu-edit-field">
                        <label>졸업년도</label>
                        {/* 재학/졸예/휴학일 때는 ~ing 표시, 졸업/중퇴일 때만 선택 가능 */}
                        {['재학', '졸예', '휴학'].includes(edu.status) ? (
                          <div className="date-picker-row">
                            <div className="edu-custom-dropdown small disabled">
                              <div className="dropdown-selected disabled">
                                <span className="ing-text">~ing</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="date-picker-row">
                            <div className={`edu-custom-dropdown small ${eduDropdowns[`${index}_endYear`] ? 'open' : ''}`}>
                              <div
                                className="dropdown-selected"
                                onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_endYear`]: !prev[`${index}_endYear`] }))}
                              >
                                <span>{edu.endYear || '년도'}</span>
                                <i className="ti ti-chevron-down"></i>
                              </div>
                              {eduDropdowns[`${index}_endYear`] && (
                                <div className="dropdown-options scrollable">
                                  {Array.from({ length: 30 }, (_, i) => 2030 - i).map((year) => (
                                    <div
                                      key={year}
                                      className={`dropdown-option ${edu.endYear === String(year) ? 'selected' : ''}`}
                                      onClick={() => {
                                        const newData = [...editingEduData];
                                        newData[index].endYear = String(year);
                                        setEditingEduData(newData);
                                        setEduDropdowns(prev => ({ ...prev, [`${index}_endYear`]: false }));
                                      }}
                                    >
                                      {year}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className={`edu-custom-dropdown small ${eduDropdowns[`${index}_endMonth`] ? 'open' : ''}`}>
                              <div
                                className="dropdown-selected"
                                onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_endMonth`]: !prev[`${index}_endMonth`] }))}
                              >
                                <span>{edu.endMonth || '월'}</span>
                                <i className="ti ti-chevron-down"></i>
                              </div>
                              {eduDropdowns[`${index}_endMonth`] && (
                                <div className="dropdown-options scrollable">
                                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => (
                                    <div
                                      key={month}
                                      className={`dropdown-option ${edu.endMonth === month ? 'selected' : ''}`}
                                      onClick={() => {
                                        const newData = [...editingEduData];
                                        newData[index].endMonth = month;
                                        setEditingEduData(newData);
                                        setEduDropdowns(prev => ({ ...prev, [`${index}_endMonth`]: false }));
                                      }}
                                    >
                                      {month}월
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 행 6: 성적 (달성치 / 최대치) */}
                    <div className="edu-edit-row grade-row">
                      <div className="edu-edit-field">
                        <label>성적<span className="required">*</span></label>
                        {/* 최대치에 따라 달성치 입력 방식 변경 */}
                        {edu.gradeMax === '-' ? (
                          // '-' 선택 시: 비활성화된 입력창에 '-' 표시
                          <input
                            type="text"
                            value="-"
                            disabled
                            className="disabled-input"
                          />
                        ) : edu.gradeMax === '4.5' || edu.gradeMax === '4.3' ? (
                          // 4.5 또는 4.3: 정수+소수 드롭다운
                          <div className="grade-dropdown-row">
                            {/* 정수 부분 (0-4) */}
                            <div className={`edu-custom-dropdown grade-int ${eduDropdowns[`${index}_gradeInt`] ? 'open' : ''}`}>
                              <div
                                className="dropdown-selected"
                                onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_gradeInt`]: !prev[`${index}_gradeInt`] }))}
                              >
                                <span>{edu.gradeValue ? edu.gradeValue.split('.')[0] : '0'}</span>
                                <i className="ti ti-chevron-down"></i>
                              </div>
                              {eduDropdowns[`${index}_gradeInt`] && (
                                <div className="dropdown-options">
                                  {[4, 3, 2, 1, 0].map((num) => (
                                    <div
                                      key={num}
                                      className={`dropdown-option ${edu.gradeValue?.split('.')[0] === String(num) ? 'selected' : ''}`}
                                      onClick={() => {
                                        const newData = [...editingEduData];
                                        const currentDecimal = edu.gradeValue?.split('.')[1] || '00';
                                        const newValue = `${num}.${currentDecimal}`;
                                        const maxValue = parseFloat(edu.gradeMax);
                                        // 최대값 체크
                                        if (parseFloat(newValue) <= maxValue) {
                                          newData[index].gradeValue = newValue;
                                        } else {
                                          // 최대값 초과 시 최대값으로 설정
                                          newData[index].gradeValue = edu.gradeMax === '4.5' ? '4.50' : '4.30';
                                        }
                                        setEditingEduData(newData);
                                        setEduDropdowns(prev => ({ ...prev, [`${index}_gradeInt`]: false }));
                                      }}
                                    >
                                      {num}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="grade-dot">.</span>
                            {/* 소수 부분 (00-99) */}
                            <div className={`edu-custom-dropdown grade-decimal ${eduDropdowns[`${index}_gradeDecimal`] ? 'open' : ''}`}>
                              <div
                                className="dropdown-selected"
                                onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_gradeDecimal`]: !prev[`${index}_gradeDecimal`] }))}
                              >
                                <span>{edu.gradeValue?.split('.')[1] || '00'}</span>
                                <i className="ti ti-chevron-down"></i>
                              </div>
                              {eduDropdowns[`${index}_gradeDecimal`] && (
                                <div className="dropdown-options">
                                  {Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0')).map((num) => {
                                    const intPart = edu.gradeValue?.split('.')[0] || '0';
                                    const testValue = parseFloat(`${intPart}.${num}`);
                                    const maxValue = parseFloat(edu.gradeMax);
                                    const isDisabled = testValue > maxValue;
                                    return (
                                      <div
                                        key={num}
                                        className={`dropdown-option ${edu.gradeValue?.split('.')[1] === num ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                        onClick={() => {
                                          if (isDisabled) return;
                                          const newData = [...editingEduData];
                                          newData[index].gradeValue = `${intPart}.${num}`;
                                          setEditingEduData(newData);
                                          setEduDropdowns(prev => ({ ...prev, [`${index}_gradeDecimal`]: false }));
                                        }}
                                      >
                                        {num}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : edu.gradeMax === '100%' ? (
                          // 100%: 100~0 드롭다운
                          <div className={`edu-custom-dropdown grade-percent ${eduDropdowns[`${index}_gradePercent`] ? 'open' : ''}`}>
                            <div
                              className="dropdown-selected"
                              onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_gradePercent`]: !prev[`${index}_gradePercent`] }))}
                            >
                              <span>{edu.gradeValue || '선택'}</span>
                              <i className="ti ti-chevron-down"></i>
                            </div>
                            {eduDropdowns[`${index}_gradePercent`] && (
                              <div className="dropdown-options">
                                {Array.from({ length: 101 }, (_, i) => 100 - i).map((num) => (
                                  <div
                                    key={num}
                                    className={`dropdown-option ${edu.gradeValue === String(num) ? 'selected' : ''}`}
                                    onClick={() => {
                                      const newData = [...editingEduData];
                                      newData[index].gradeValue = String(num);
                                      setEditingEduData(newData);
                                      setEduDropdowns(prev => ({ ...prev, [`${index}_gradePercent`]: false }));
                                    }}
                                  >
                                    {num}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : edu.gradeMax === '9등급' ? (
                          // 9등급: 1~9 드롭다운
                          <div className={`edu-custom-dropdown ${eduDropdowns[`${index}_gradeValue`] ? 'open' : ''}`}>
                            <div
                              className="dropdown-selected"
                              onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_gradeValue`]: !prev[`${index}_gradeValue`] }))}
                            >
                              <span>{edu.gradeValue === '-' ? '-' : (edu.gradeValue ? `${edu.gradeValue}등급` : '성적 선택')}</span>
                              <i className="ti ti-chevron-down"></i>
                            </div>
                            {eduDropdowns[`${index}_gradeValue`] && (
                              <div className="dropdown-options">
                                {['-', ...Array.from({ length: 9 }, (_, i) => i + 1)].map((num) => (
                                  <div
                                    key={num}
                                    className={`dropdown-option ${edu.gradeValue === String(num) ? 'selected' : ''}`}
                                    onClick={() => {
                                      const newData = [...editingEduData];
                                      newData[index].gradeValue = String(num);
                                      setEditingEduData(newData);
                                      setEduDropdowns(prev => ({ ...prev, [`${index}_gradeValue`]: false }));
                                    }}
                                  >
                                    {num === '-' ? '-' : `${num}등급`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          // 기타 또는 미선택: 직접 입력 (최대 5자)
                          <input
                            type="text"
                            value={edu.gradeValue}
                            onChange={(e) => {
                              if (e.target.value.length <= 5) {
                                const newData = [...editingEduData];
                                newData[index].gradeValue = e.target.value;
                                setEditingEduData(newData);
                              }
                            }}
                            placeholder="성적 입력 (최대 5자)"
                            maxLength={5}
                          />
                        )}
                      </div>
                      <span className="grade-slash">/</span>
                      <div className="edu-edit-field">
                        <label>&nbsp;</label>
                        {/* 기타 선택 시 직접 입력, 아니면 드롭다운 */}
                        {edu.gradeMax && !['4.5', '4.3', '100%', '9등급', '-'].includes(edu.gradeMax) ? (
                          <div className="grade-max-custom">
                            <input
                              type="text"
                              value={edu.gradeMax === '기타' ? '' : edu.gradeMax}
                              onChange={(e) => {
                                if (e.target.value.length <= 5) {
                                  const newData = [...editingEduData];
                                  newData[index].gradeMax = e.target.value || '기타';
                                  setEditingEduData(newData);
                                }
                              }}
                              placeholder="총점 입력 (최대 5자)"
                              maxLength={5}
                            />
                            <button
                              type="button"
                              className="reset-btn"
                              onClick={() => {
                                const newData = [...editingEduData];
                                newData[index].gradeMax = '';
                                newData[index].gradeValue = '';
                                setEditingEduData(newData);
                              }}
                              title="다시 선택"
                            >
                              <i className="ti ti-x"></i>
                            </button>
                          </div>
                        ) : (
                          <div className={`edu-custom-dropdown ${eduDropdowns[`${index}_gradeMax`] ? 'open' : ''}`}>
                            <div
                              className="dropdown-selected"
                              onClick={() => setEduDropdowns(prev => ({ ...prev, [`${index}_gradeMax`]: !prev[`${index}_gradeMax`] }))}
                            >
                              <span>{edu.gradeMax || '총점 선택'}</span>
                              <i className="ti ti-chevron-down"></i>
                            </div>
                            {eduDropdowns[`${index}_gradeMax`] && (
                              <div className="dropdown-options">
                                {['-', '4.5', '4.3', '100%', '9등급', '기타'].map((opt) => (
                                  <div
                                    key={opt}
                                    className={`dropdown-option ${edu.gradeMax === opt ? 'selected' : ''}`}
                                    onClick={() => {
                                      const newData = [...editingEduData];
                                      newData[index].gradeMax = opt;
                                      // 최대치 변경 시 달성치 초기화
                                      newData[index].gradeValue = '';
                                      setEditingEduData(newData);
                                      setEduDropdowns(prev => ({ ...prev, [`${index}_gradeMax`]: false }));
                                    }}
                                  >
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 행 6: 비고 (전체 너비) */}
                    <div className="edu-edit-row">
                      <div className="edu-edit-field full-width">
                        <label>비고</label>
                        <div className="textarea-wrapper">
                          <textarea
                            value={edu.description}
                            onChange={(e) => {
                              if (e.target.value.length <= 100) {
                                const newData = [...editingEduData];
                                newData[index].description = e.target.value;
                                setEditingEduData(newData);
                              }
                            }}
                            placeholder="추가 설명 (최대 100자)"
                            rows={3}
                            maxLength={100}
                          />
                          <span className="char-count">{edu.description.length}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section3-modal-footer">
              <button
                className="save-btn"
                onClick={() => {
                  // 필수 입력 검증: 학교, 전공1, 입학년도, 상태, 성적
                  const invalidCards = editingEduData.map((edu, index) => {
                    const missing: string[] = [];
                    if (!edu.school) missing.push('학교');
                    if (!edu.major1) missing.push('전공 1');
                    if (!edu.startYear) missing.push('입학년도');
                    if (!edu.status) missing.push('상태');
                    if (!edu.gradeValue) missing.push('성적');
                    return { index: index + 1, missing };
                  }).filter(item => item.missing.length > 0);

                  if (invalidCards.length > 0) {
                    const errorMessages = invalidCards.map(item =>
                      `${item.index}번 학력: ${item.missing.join(', ')}`
                    ).join('\n');
                    alert(`다음 필수 항목을 입력해주세요:\n\n${errorMessages}`);
                    return;
                  }

                  // 저장 로직 - 빈 전공 필드를 "-"로 변환 후 저장
                  const processedData = editingEduData.map(edu => ({
                    ...edu,
                    major1: edu.major1.trim() === '' ? '-' : edu.major1,
                    major2: edu.major2.trim() === '' ? '-' : edu.major2,
                    major3: edu.major3.trim() === '' ? '-' : edu.major3,
                  }));
                  setEducationData(processedData);
                  setEditingEduData(processedData);
                  setHasEduChanges(false); // 변경사항 초기화
                  setSection3ModalOpen(false);
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirmModal.isOpen && (
        <div className="delete-confirm-overlay" onClick={() => setDeleteConfirmModal({ isOpen: false, index: null, schoolName: '', type: 'edu' })}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            {deleteConfirmModal.type === 'minimum' ? (
              <>
                <div className="delete-confirm-icon warning">
                  <i className="ti ti-alert-triangle"></i>
                </div>
                <h3>삭제 불가</h3>
                <p>최소 1개의 학력은 유지해야 합니다.</p>
                <div className="delete-confirm-buttons">
                  <button
                    className="confirm-btn"
                    onClick={() => setDeleteConfirmModal({ isOpen: false, index: null, schoolName: '', type: 'edu' })}
                  >
                    확인
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="delete-confirm-icon">
                  <i className="ti ti-trash"></i>
                </div>
                <h3>학력 삭제</h3>
                <p><strong>{deleteConfirmModal.schoolName}</strong> 정보를 삭제하시겠습니까?</p>
                <div className="delete-confirm-buttons">
                  <button
                    className="cancel-btn"
                    onClick={() => setDeleteConfirmModal({ isOpen: false, index: null, schoolName: '', type: 'edu' })}
                  >
                    취소
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      if (deleteConfirmModal.index !== null) {
                        const edu = editingEduData[deleteConfirmModal.index];
                        const newData = editingEduData.filter((_, i) => i !== deleteConfirmModal.index);
                        if (edu.isFinal && newData.length > 0) {
                          newData[0].isFinal = true;
                        }
                        setEditingEduData(newData);
                        setHasEduChanges(true); // 변경사항 표시
                      }
                      setDeleteConfirmModal({ isOpen: false, index: null, schoolName: '', type: 'edu' });
                    }}
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 링크 없음 툴팁 */}
      {noLinkTooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: noLinkTooltip.x + 10,
            top: noLinkTooltip.y - 30,
            background: 'rgba(30, 32, 40, 0.95)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'Pretendard, sans-serif',
            zIndex: 10000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          리뷰 링크 등록이 필요합니다.
        </div>
      )}
    </div>
  );
};

export default Cluster2Content;
