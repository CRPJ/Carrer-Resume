"use client";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";

const Sidebar = () => {
  const { data: session } = useSession();
  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [badge1, setBadge1] = useState(0);
  const [badge2, setBadge2] = useState(0);
  const [badge3, setBadge3] = useState(0);
  const [skill1, setSkill1] = useState(0);
  const [skill2, setSkill2] = useState(0);
  const [skill3, setSkill3] = useState(0);
  const [skill4, setSkill4] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 실제 유저 프로필 데이터
  const [userProfile, setUserProfile] = useState<{
    name: string;
    nameEng: string;
    gender: string;
    birthDate: string;
    city: string;
    district: string;
    phone: string;
    email: string;
    school: string;
    major: string;
    quote: string;
    photo: string;
  } | null>(null);

  // Hydration 에러 방지를 위한 마운트 상태
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 아이콘 링크 state
  const [iconLink1, setIconLink1] = useState('https://www.google.com/');
  const [iconLink2, setIconLink2] = useState('https://youtu.be/xf6q5dgn1hU?si=tNK3I1-QIsJ9JmvF');
  const [iconLink3, setIconLink3] = useState('https://www.naver.com/');
  const [iconLinkErrors, setIconLinkErrors] = useState({ link1: '', link2: '', link3: '' });

  // URL 유효성 검사 함수
  const isValidUrl = (url: string) => {
    if (!url || url.trim() === '') return true; // 빈 값은 허용
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleIconLinkChange = (value: string, linkNum: 1 | 2 | 3) => {
    const setters = { 1: setIconLink1, 2: setIconLink2, 3: setIconLink3 };
    const errorKeys = { 1: 'link1', 2: 'link2', 3: 'link3' } as const;

    setters[linkNum](value);

    if (value && !isValidUrl(value)) {
      setIconLinkErrors(prev => ({ ...prev, [errorKeys[linkNum]]: '정확한 링크를 입력해주세요.' }));
    } else {
      setIconLinkErrors(prev => ({ ...prev, [errorKeys[linkNum]]: '' }));
    }
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCustomAddress, setIsCustomAddress] = useState(false);

  // 화면 높이 기반 카드 스케일 조절 (비율 유지)
  const [cardScale, setCardScale] = useState(1);
  const [availHeight, setAvailHeight] = useState(810);

  useEffect(() => {
    const calculateScale = () => {
      // 줌 레벨 감지 (visualViewport 사용)
      const zoom = window.visualViewport?.scale || 1;
      const viewportHeight = window.visualViewport?.height || window.innerHeight;

      // 헤더 높이 제외한 사용 가능한 높이 (줌 고려) - 130px로 여유 확보
      const availableHeight = viewportHeight - (130 / zoom);

      // 기준 카드 크기: 474 x 810
      const baseCardWidth = 474;
      const baseCardHeight = 810;

      // 높이 기준으로 스케일 계산 (화면 높이에 딱 맞도록)
      const scale = availableHeight / baseCardHeight;

      setCardScale(scale);
      setAvailHeight(availableHeight);

      // 카드 실제 크기를 CSS 변수로 설정
      const scaledWidth = baseCardWidth * scale;
      const scaledHeight = baseCardHeight * scale;
      document.documentElement.style.setProperty('--card-width', `${scaledWidth}px`);
      document.documentElement.style.setProperty('--card-height', `${scaledHeight}px`);
      document.documentElement.style.setProperty('--card-scale', `${scale}`);
      // scaledWidth만 (margin-left: 16px가 CSS에서 적용됨)
      document.documentElement.style.setProperty('--sidebar-width', `${scaledWidth}px`);
      document.documentElement.style.setProperty('--container-height', `${availableHeight}px`);

      // 부모 컨테이너들의 높이를 직접 설정 (CSS 100vh가 줌을 무시하므로)
      const contentHome = document.querySelector('.nftg-content-home') as HTMLElement;
      const containerFluid = contentHome?.querySelector('.container-fluid') as HTMLElement;
      const row = containerFluid?.querySelector('.row') as HTMLElement;

      if (contentHome) contentHome.style.height = `${availableHeight}px`;
      if (containerFluid) containerFluid.style.height = `${availableHeight}px`;
      if (row) row.style.height = `${availableHeight}px`;
    };

    calculateScale();

    // 리사이즈 및 줌 이벤트 감지
    window.addEventListener('resize', calculateScale);
    window.visualViewport?.addEventListener('resize', calculateScale);

    return () => {
      window.removeEventListener('resize', calculateScale);
      window.visualViewport?.removeEventListener('resize', calculateScale);
    };
  }, []);

  // 한국 시/도 및 구/군 데이터
  const koreaRegions: { [key: string]: string[] } = {
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '부산광역시': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '인천광역시': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
    '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
    '울산광역시': ['남구', '동구', '북구', '울주군', '중구'],
    '세종특별자치시': ['세종시'],
    '경기도': ['가평군', '고양시 덕양구', '고양시 일산동구', '고양시 일산서구', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시 분당구', '성남시 수정구', '성남시 중원구', '수원시 권선구', '수원시 영통구', '수원시 장안구', '수원시 팔달구', '시흥시', '안산시 단원구', '안산시 상록구', '안성시', '안양시 동안구', '안양시 만안구', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시 기흥구', '용인시 수지구', '용인시 처인구', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    '강원도': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    '충청북도': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시 상당구', '청주시 서원구', '청주시 청원구', '청주시 흥덕구', '충주시'],
    '충청남도': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시 동남구', '천안시 서북구', '청양군', '태안군', '홍성군'],
    '전라북도': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시 덕진구', '전주시 완산구', '정읍시', '진안군'],
    '전라남도': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '경상북도': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시 남구', '포항시 북구'],
    '경상남도': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시 마산합포구', '창원시 마산회원구', '창원시 성산구', '창원시 의창구', '창원시 진해구', '통영시', '하동군', '함안군', '함양군', '합천군'],
    '제주특별자치도': ['서귀포시', '제주시']
  };

  // Form state
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    lastNameEng: '',
    firstNameEng: '',
    gender: '',
    birthDate: '',
    addressCity: '',
    addressDistrict: '',
    customAddress: '',
    phone: '',
    phoneComment: '',
    emailId: '',
    emailDomain: '',
    customEmailDomain: '',
    // 학력 정보
    educationLevel: '',
    schoolType: '',
    school: '',
    major: '',
    major2: '',
    major3: '',
    graduationStatus: '',
    entranceYear: '',
    entranceMonth: '',
    graduationYear: '',
    graduationMonth: '',
    gpa: '',
    gpaMax: '',
    customGpaMax: '',
    additionalMajor: '',
    additionalMajorType: '',
    slogan: ''
  });
  const [isCustomEmailDomain, setIsCustomEmailDomain] = useState(false);
  const [isPhoneCommentModalOpen, setIsPhoneCommentModalOpen] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const [debugProfileType, setDebugProfileType] = useState<'본인' | '타크루'>('본인');
  const [debugPanelType, setDebugPanelType] = useState<'OK' | 'EC' | 'PX'>('OK');
  const [crewStatus, setCrewStatus] = useState<'Running' | 'Complete' | 'On Rest' | 'Recharging' | 'Next Challenge'>('Running');
  const [hasData, setHasData] = useState(true); // 데이터 있음/없음 상태
  const [isArrowShaking, setIsArrowShaking] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState<'email' | 'school' | 'major' | 'hexagon1' | 'hexagon2' | 'hexagon3' | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 전공 툴팁 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      if (tooltipVisible === 'major') {
        setTooltipVisible(null);
      }
    };

    if (tooltipVisible === 'major') {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [tooltipVisible]);

  // 커스텀 스크롤바
  const activitiesRef = useRef<HTMLDivElement>(null);
  const [scrollThumbTop, setScrollThumbTop] = useState(0);
  const [scrollThumbHeight, setScrollThumbHeight] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  // OK/EC/PX별 프로필 데이터
  const profileData = {
    OK: {
      name: '정이안',
      nameEng: 'Jung Ian',
      gender: '여',
      birthDate: '2002.02.02',
      city: '서울특별시',
      district: '강남구',
      phone: '010-1***-****',
      email: 'wkwkwkwkwkwkk@naver.com',
      school: '성균관대학교',
      major: '미디어커뮤니케이션학과',
      major2: '경영학과',
      major3: '데이터사이언스학과2',
      enrollPeriod: '2025. 03',
      graduationStatus: 'ing',
      gpa: '3.0',
      gpaMax: '4.5',
      photo: '/images/0/cluster 1/iZKpm7I6mM-X1RCe8whJEe_K4L1q7r24whHrO5pK6vLZ1ivZs-sMvk3r35n6xbZ5P3Y8updzx8RXuoYL_5-GCQ.webp',
      quote: '가장 어두운 순간에도 빛을 향해 용기 있게 한 걸음 내딛는 자에게는 언제나 반드시 새로운 길이 열리고 밝은 희망이 찾아온다',
      lightColor: '#FFEC8F',
      accentColor: '#FFC300'
    },
    EC: {
      name: '박민주',
      nameEng: 'Park Minju',
      gender: '남',
      birthDate: '2000.05.15',
      city: '경기도',
      district: '성남시 분당구',
      phone: '010-2***-****',
      email: 'pmj_design@gmail.com',
      school: '한양대학교',
      major: '산업디자인학과',
      major2: 'UX디자인학과',
      major3: '',
      enrollPeriod: '2019.03 ~ 2023.02',
      graduationStatus: '졸업',
      gpa: '3.8',
      gpaMax: '4.5',
      photo: '/images/0/cluster 1/EC00.png',
      quote: '디자인은 단순한 외형이 아니라 사용자의 경험을 설계하는 것이다. 좋은 디자인은 보이지 않는 곳에서 빛난다',
      lightColor: '#FF98A6',
      accentColor: '#FF4B70'
    },
    PX: {
      name: '이동민',
      nameEng: 'Lee Dongmin',
      gender: '남',
      birthDate: '1999.11.22',
      city: '서울특별시',
      district: '마포구',
      phone: '010-3***-****',
      email: 'dongmin.dev@kakao.com',
      school: '연세대학교',
      major: '컴퓨터과학과',
      major2: '인공지능학과',
      major3: '',
      enrollPeriod: '2018.03 ~ 2022.02',
      graduationStatus: '졸업',
      gpa: '4.1',
      gpaMax: '4.5',
      photo: '/images/0/cluster 1/PX00.png',
      quote: '코드 한 줄 한 줄에 사용자를 향한 진심을 담는다. 기술은 사람을 위해 존재해야 한다',
      lightColor: '#B2FF8F',
      accentColor: '#36DA60'
    }
  };

  // 현재 선택된 프로필 가져오기 (기본값)
  const defaultProfile = profileData[debugPanelType];

  // 실제 표시할 프로필 (마운트 후 유저 프로필이 있으면 사용, 없으면 기본값)
  const currentProfile = (isMounted && userProfile) ? {
    ...defaultProfile,
    name: userProfile.name,
    nameEng: userProfile.nameEng,
    gender: userProfile.gender,
    birthDate: userProfile.birthDate,
    city: userProfile.city,
    district: userProfile.district,
    phone: userProfile.phone,
    email: userProfile.email,
    school: userProfile.school,
    major: userProfile.major,
    quote: userProfile.quote,
    photo: userProfile.photo || defaultProfile.photo,
  } : defaultProfile;

  // 페이지 로드 시 프로필 데이터 가져오기
  const fetchUserProfile = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/profile');
      const result = await response.json();

      if (result.success && result.data) {
        const profile = result.data;
        const addressParts = (profile.address || '').split(' ');

        setUserProfile({
          name: profile.display_name || '',
          nameEng: profile.eng_name || '',
          gender: profile.gender || '',
          birthDate: profile.birth_date ? profile.birth_date.replace(/-/g, '.') : '',
          city: addressParts[0] || '',
          district: addressParts.slice(1).join(' ') || '',
          phone: profile.phone ? profile.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3').replace(/010-/, '010-').replace(/(\d{4})-(\d{4})$/, '$1-****') : '',
          email: profile.email || '',
          school: profile.university || '',
          major: profile.major_first || '',
          quote: profile.bio || '',
          photo: profile.profile_photo_url || '',
        });

        // DB status → crewStatus 매핑
        const statusMap: Record<string, 'Running' | 'Complete' | 'On Rest' | 'Recharging' | 'Next Challenge'> = {
          'active': 'Running',
          'graduated': 'Complete',
          'suspended': 'On Rest',
          'pending': 'Recharging',
        };
        if (profile.status && statusMap[profile.status]) {
          setCrewStatus(statusMap[profile.status]);
        }
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error);
    }
  };

  // 세션 변경 시 프로필 로드
  useEffect(() => {
    if (session) {
      fetchUserProfile();
    }
  }, [session]);

  // Error state for validation
  const [errors, setErrors] = useState({
    lastName: '',
    firstName: '',
    lastNameEng: '',
    firstNameEng: '',
    email: ''
  });

  // 한글만 허용하는 검증 함수
  const isKoreanOnly = (text: string) => {
    const koreanRegex = /^[가-힣]*$/;
    return koreanRegex.test(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'lastName' | 'firstName', maxLength: number) => {
    const { value } = e.target;

    if (value.length <= maxLength) {
      setFormData(prev => ({ ...prev, [field]: value }));

      if (value && !isKoreanOnly(value)) {
        setErrors(prev => ({ ...prev, [field]: '한글만 입력해주세요' }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  // 영문 이름 입력 핸들러
  const isEnglishOnly = (text: string) => /^[a-zA-Z\s]*$/.test(text);

  const handleEngNameChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'lastNameEng' | 'firstNameEng', maxLength: number) => {
    const { value } = e.target;

    if (value.length <= maxLength) {
      setFormData(prev => ({ ...prev, [field]: value }));

      if (value && !isEnglishOnly(value)) {
        setErrors(prev => ({ ...prev, [field]: '영문만 입력해주세요' }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  // 필수 필드 유효성 검사 (학력 관련 필드 제외 - 별도 섹션에서 입력)
  const validateForm = () => {
    const requiredFields = [
      { key: 'lastName', label: '성' },
      { key: 'firstName', label: '이름' },
      { key: 'gender', label: '성별' },
      { key: 'birthDate', label: '생년월일' },
      { key: 'addressCity', label: '시/도' },
      { key: 'addressDistrict', label: '구/군' },
      { key: 'phone', label: '핸드폰번호' },
      { key: 'emailId', label: '이메일' },
      { key: 'emailDomain', label: '이메일 도메인' }
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      const value = formData[field.key as keyof typeof formData];
      if (!value || value.trim() === '') {
        missingFields.push(field.label);
      }
    }

    // 직접입력 이메일 도메인 체크
    if (formData.emailDomain === '직접입력' && (!formData.customEmailDomain || formData.customEmailDomain.trim() === '')) {
      missingFields.push('이메일 도메인 (직접입력)');
    }

    return missingFields;
  };

  // 승인 상태 확인 함수
  const checkApprovalStatus = async () => {
    if (!session) return false;

    try {
      setIsCheckingStatus(true);
      const response = await fetch('/api/auth/check-status');
      const result = await response.json();

      if (result.success && result.status === 'approved') {
        setIsApproved(true);
        return true;
      } else {
        setIsApproved(false);
        return false;
      }
    } catch (error) {
      console.error('승인 상태 확인 오류:', error);
      setIsApproved(false);
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 프로필 데이터 로드 함수
  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const result = await response.json();

      if (result.success && result.data) {
        const profile = result.data;

        // user_profiles → formData 변환
        const displayNameParts = (profile.display_name || '').split(' ');
        const lastName = displayNameParts[0] || '';
        const firstName = displayNameParts.slice(1).join(' ') || '';

        const engNameParts = (profile.eng_name || '').split(' ');
        const lastNameEng = engNameParts[0] || '';
        const firstNameEng = engNameParts.slice(1).join(' ') || '';

        const addressParts = (profile.address || '').split(' ');
        const addressCity = addressParts[0] || '';
        const addressDistrict = addressParts.slice(1).join(' ') || '';

        const emailParts = (profile.email || '').split('@');
        const emailId = emailParts[0] || '';
        const emailDomain = emailParts[1] || '';

        const phoneParts = (profile.phone || '').replace(/^010-?/, '').split('-');

        setFormData(prev => ({
          ...prev,
          lastName,
          firstName,
          lastNameEng,
          firstNameEng,
          gender: profile.gender === '남' ? 'male' : profile.gender === '여' ? 'female' : '',
          birthDate: profile.birth_date || '',
          addressCity,
          addressDistrict,
          phone: phoneParts.length >= 2 ? `${phoneParts[0]}-${phoneParts[1]}` : profile.phone?.replace(/^010-?/, '') || '',
          emailId,
          emailDomain,
          slogan: profile.bio || '',
          phoneComment: profile.contact_available || '',
        }));
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error);
    }
  };

  // 프로필 수정 버튼 클릭 핸들러
  const handleEditButtonClick = async () => {
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const approved = await checkApprovalStatus();

    if (!approved) {
      alert('아직 회원 상태가 어드민 승인 대기 중입니다.');
      return;
    }

    // 승인된 경우 프로필 로드 후 모달 열기
    await loadProfile();
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = validateForm();

    if (missingFields.length > 0) {
      alert(`다음 필드를 입력해주세요:\n${missingFields.join(', ')}`);
      return;
    }

    try {
      setIsSaving(true);

      // formData → user_profiles 필드 변환
      const profileData = {
        display_name: `${formData.lastName} ${formData.firstName}`.trim(),
        eng_name: `${formData.lastNameEng} ${formData.firstNameEng}`.trim(),
        gender: formData.gender === 'male' ? '남' : formData.gender === 'female' ? '여' : null,
        birth_date: formData.birthDate || null,
        address: `${formData.addressCity} ${formData.addressDistrict}`.trim(),
        phone: formData.phone ? `010-${formData.phone}` : null,
        email: formData.emailId && formData.emailDomain
          ? `${formData.emailId}@${formData.emailDomain === '직접입력' ? formData.customEmailDomain : formData.emailDomain}`
          : null,
        bio: formData.slogan || null,
        portfolio_files: iconLink3 || null,
        contact_available: formData.phoneComment || null,
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        alert('프로필이 성공적으로 저장되었습니다.');
        setIsEditModalOpen(false);
        // 프로필 데이터 새로고침
        fetchUserProfile();
      } else {
        alert(result.error || '프로필 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // 0에서 올라가는 애니메이션
    const animateNumber = (setter: (val: number) => void, target: number, duration: number = 1000) => {
      const steps = 30;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;

        if (step >= steps) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, duration / steps);

      return timer;
    };

    // 프로필별 데이터 설정
    const profileStats = {
      OK: {
        stat1: 100, stat2: 80,
        badge1: 99999, badge2: 99999, badge3: -9999,
        skill1: 21, skill2: 21, skill3: 21, skill4: 21
      },
      EC: {
        stat1: Math.floor(Math.random() * 100) + 1,
        stat2: Math.floor(Math.random() * 100) + 1,
        badge1: Math.floor(Math.random() * 99999) + 1,
        badge2: Math.floor(Math.random() * 99999) + 1,
        badge3: -(Math.floor(Math.random() * 9999) + 1),
        skill1: Math.floor(Math.random() * 99) + 1,
        skill2: Math.floor(Math.random() * 99) + 1,
        skill3: Math.floor(Math.random() * 99) + 1,
        skill4: Math.floor(Math.random() * 99) + 1
      },
      PX: {
        stat1: Math.floor(Math.random() * 100) + 1,
        stat2: Math.floor(Math.random() * 100) + 1,
        badge1: Math.floor(Math.random() * 90) + 10,
        badge2: Math.floor(Math.random() * 900) + 100,
        badge3: -(Math.floor(Math.random() * 90) + 10),
        skill1: Math.floor(Math.random() * 99) + 1,
        skill2: Math.floor(Math.random() * 99) + 1,
        skill3: Math.floor(Math.random() * 99) + 1,
        skill4: Math.floor(Math.random() * 99) + 1
      }
    };

    const currentStats = profileStats[debugPanelType];

    const timers = [
      animateNumber(setStat1, currentStats.stat1, 1000),
      animateNumber(setStat2, currentStats.stat2, 1000),
      animateNumber(setBadge1, currentStats.badge1, 1000),
      animateNumber(setBadge2, currentStats.badge2, 1000),
      animateNumber(setBadge3, currentStats.badge3, 1000),
      animateNumber(setSkill1, currentStats.skill1, 1000),
      animateNumber(setSkill2, currentStats.skill2, 1000),
      animateNumber(setSkill3, currentStats.skill3, 1000),
      animateNumber(setSkill4, currentStats.skill4, 1000),
    ];

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [debugPanelType]);

  // 커스텀 스크롤바 업데이트
  const updateScrollbar = useCallback(() => {
    const container = activitiesRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const trackHeight = clientHeight;
    const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 20);
    const maxScrollTop = scrollHeight - clientHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * (trackHeight - thumbHeight) : 0;

    setScrollThumbHeight(thumbHeight);
    setScrollThumbTop(thumbTop);
  }, []);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const container = activitiesRef.current;
    if (!container) return;

    // 테마 변경 시 스크롤 위치 리셋
    container.scrollTop = 0;

    // 약간의 지연 후 스크롤바 업데이트 (DOM 업데이트 대기)
    const timer = setTimeout(() => {
      updateScrollbar();
    }, 50);

    container.addEventListener('scroll', updateScrollbar);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('scroll', updateScrollbar);
    };
  }, [updateScrollbar, debugPanelType]);

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = activitiesRef.current?.scrollTop || 0;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !activitiesRef.current) return;

      const container = activitiesRef.current;
      const { scrollHeight, clientHeight } = container;
      const trackHeight = clientHeight;
      const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 20);
      const maxThumbTop = trackHeight - thumbHeight;
      const maxScrollTop = scrollHeight - clientHeight;

      const deltaY = e.clientY - dragStartY.current;
      const scrollRatio = maxScrollTop / maxThumbTop;
      const newScrollTop = dragStartScrollTop.current + deltaY * scrollRatio;

      container.scrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Hydration 에러 방지: 마운트 전에는 빈 placeholder 반환
  if (!isMounted) {
    return (
      <div className="home-two-sidebar-col">
        <div style={{
          width: '474px',
          height: '810px',
          backgroundColor: '#1a1a2e',
          borderRadius: '12px'
        }} />
      </div>
    );
  }

  return (
    <div className="home-two-sidebar-col">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        .arrow-shake {
          animation: shake 0.4s ease-in-out;
        }
        .custom-tooltip {
          position: fixed;
          background: rgba(30, 32, 40, 0.95);
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 14px;
          color: #fff;
          white-space: nowrap;
          z-index: 9999;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          font-family: 'Pretendard', sans-serif;
          pointer-events: none;
        }
        .resume-activities::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
        }
        .resume-activities {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .modal-input::placeholder {
          color: #6b6e7a !important;
        }
        .modal-input::-webkit-input-placeholder {
          color: #6b6e7a !important;
        }
        .modal-input::-moz-placeholder {
          color: #6b6e7a !important;
        }
        .modal-input:-ms-input-placeholder {
          color: #6b6e7a !important;
        }
        .chamfer-box {
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
        }
      `}} />
      {/* 스케일된 카드 - 비율 유지하며 화면에 맞춤 */}
      <div style={{
        width: `${474 * cardScale}px`,
        height: `${810 * cardScale}px`,
        overflow: 'hidden'
      }}>
        <div className={`resume-card ${debugPanelType === 'EC' ? 'ec-theme' : debugPanelType === 'PX' ? 'px-theme' : ''}`} style={{ position: 'relative', transform: `scale(${cardScale})`, transformOrigin: 'top left' }}>
        {/* Header Section */}
        <div className="resume-header" style={{ position: 'relative' }}>
          <div className="resume-photo" style={{ position: 'relative' }}>
            {hasData ? (
              <Image
                src={currentProfile.photo}
                alt="Profile"
                width={240}
                height={273}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#999',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fff', fontSize: '14px', fontFamily: 'Pretendard, sans-serif' }}>사진을 등록하세요.</span>
              </div>
            )}
            {/* Edit Button - 프로필 이미지 우측 하단 */}
            <button
              className="resume-edit-btn"
              onClick={handleEditButtonClick}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: debugPanelType === 'EC' ? '#FF4B70' : debugPanelType === 'PX' ? '#36DA60' : '#FFA500',
                border: 'none',
                display: debugProfileType === '본인' ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 5,
                padding: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}
            >
              <i className="ti ti-pencil" style={{ fontSize: '14px', color: '#fff' }}></i>
            </button>
          </div>

          {/* Hexagon Buttons */}
          <div style={{
            position: 'absolute',
            left: '213px',
            top: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 10
          }}>
            <button
              onClick={() => iconLink1 && window.open(iconLink1, '_blank')}
              style={{
                width: '24px',
                height: '24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                overflow: 'visible',
                position: 'relative'
              }}
              aria-label="hexagon button 1"
              onMouseEnter={() => setTooltipVisible('hexagon1')}
              onMouseLeave={() => setTooltipVisible(null)}
              onMouseMove={(e) => setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 })}
            >
              <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/ec.png" : debugPanelType === 'PX' ? "/images/0/cluster 1/PX06.png" : "/images/0/cluster 1/00.png"} alt="" width={24} height={24} className="hexagon-border" style={{ display: 'block' }} />
              <Image src="/images/0/cluster 1/001.png" alt="" width={12} height={12} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </button>

            <button
              onClick={() => iconLink2 && window.open(iconLink2, '_blank')}
              style={{
                width: '24px',
                height: '24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                overflow: 'visible',
                position: 'relative'
              }}
              aria-label="hexagon button 2"
              onMouseEnter={() => setTooltipVisible('hexagon2')}
              onMouseLeave={() => setTooltipVisible(null)}
              onMouseMove={(e) => setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 })}
            >
              <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/ec.png" : debugPanelType === 'PX' ? "/images/0/cluster 1/PX06.png" : "/images/0/cluster 1/00.png"} alt="" width={24} height={24} className="hexagon-border" style={{ display: 'block' }} />
              <Image src="/images/0/cluster 1/002.png" alt="" width={12} height={12} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </button>

            <button
              onClick={() => iconLink3 && window.open(iconLink3, '_blank')}
              style={{
                width: '24px',
                height: '24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                overflow: 'visible',
                position: 'relative'
              }}
              aria-label="hexagon button 3"
              onMouseEnter={() => setTooltipVisible('hexagon3')}
              onMouseLeave={() => setTooltipVisible(null)}
              onMouseMove={(e) => setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 })}
            >
              <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/ec.png" : debugPanelType === 'PX' ? "/images/0/cluster 1/PX06.png" : "/images/0/cluster 1/00.png"} alt="" width={24} height={24} className="hexagon-border" style={{ display: 'block' }} />
              <Image src="/images/0/cluster 1/003.png" alt="" width={12} height={12} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </button>
          </div>

          <div className="resume-info">
            {hasData ? (
              <>
                <h1 className="resume-name">
                  <span
                    className={`back-arrow ${isArrowShaking ? 'arrow-shake' : ''}`}
                    style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => {
                      setIsArrowShaking(true);
                      setTimeout(() => setIsArrowShaking(false), 400);
                    }}
                  >
                    <Image src="/images/0/cluster 1/small icon/Chevron_Right_MD.png" alt="" width={18} height={18} />
                  </span>{currentProfile.name} <span className="name-eng">{currentProfile.nameEng}</span>
                </h1>

                <div className="resume-details">
                  <div className="detail-row">
                    <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/User_01-ec.png" : debugPanelType === 'PX' ? "/images/0/cluster 1/small icon/User_01-px.png" : "/images/0/cluster 1/small icon/User_01.png"} alt="" width={16} height={16} className="detail-icon" />
                    <span><span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.gender} <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/Gift-ec.png" : debugPanelType === 'PX' ? "/images/0/cluster 1/small icon/Gift-px.png" : "/images/0/cluster 1/small icon/Gift.png"} alt="" width={13} height={13} className="detail-icon" style={{ display: 'inline-block', verticalAlign: 'text-bottom', margin: '0 2px' }} /> <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.birthDate}</span>
                  </div>
                  <div className="detail-row">
                    <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/Building_03-ec (2).png" : debugPanelType === 'PX' ? "/images/0/cluster 1/small icon/House_01-px.png" : "/images/0/cluster 1/small icon/House_01.png"} alt="" width={16} height={16} className="detail-icon" />
                    <span><span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.city} {currentProfile.district}</span>
                  </div>
                  <div className="detail-row">
                    <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/Mobile_Button-ec.png" : debugPanelType === 'PX' ? "/images/0/cluster 1/small icon/Mobile_Button-px.png" : "/images/0/cluster 1/small icon/Mobile_Button.png"} alt="" width={16} height={16} className="detail-icon" />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.phone}
                      <span
                        onClick={async () => {
                          // 모달 열기 전에 기존 값 로드
                          try {
                            const response = await fetch('/api/profile');
                            const result = await response.json();
                            if (result.success && result.data) {
                              setFormData(prev => ({
                                ...prev,
                                phoneComment: result.data.contact_available || ''
                              }));
                            }
                          } catch (error) {
                            console.error('연락처 코멘트 로드 오류:', error);
                          }
                          setIsPhoneCommentModalOpen(true);
                        }}
                        style={{
                          color: currentProfile.accentColor,
                          fontSize: '14px',
                          fontWeight: '400',
                          lineHeight: '1',
                          cursor: 'pointer'
                        }}>+</span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/Mail -ec.png" : debugPanelType === 'PX' ? "/images/0/cluster 1/small icon/Mail-px.png" : "/images/0/cluster 1/small icon/Mail.png"} alt="" width={16} height={16} className="detail-icon" />
                    <span
                      onMouseEnter={() => setTooltipVisible('email')}
                      onMouseMove={(e) => setTooltipPosition({ x: e.clientX + 12, y: e.clientY - 8 })}
                      onMouseLeave={() => setTooltipVisible(null)}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px',
                        cursor: 'default'
                      }}
                    >
                      <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.email}
                    </span>
                  </div>
                  <div className="detail-row">
                    <Image src={debugPanelType === 'EC' ? "/images/0/cluster 1/small icon/Building_03-ec (1).png" : debugPanelType === 'PX' ? "/images/0/cluster 1/small icon/Building_03-px.png" : "/images/0/cluster 1/small icon/Building_03.png"} alt="" width={16} height={16} className="detail-icon" />
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px',
                        cursor: 'default'
                      }}
                    >
                      <span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.school}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span style={{ width: '16px' }}></span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ color: currentProfile.lightColor }}>·</span>
                      <span style={{ color: currentProfile.lightColor }}>{currentProfile.major}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setTooltipPosition({ x: e.clientX + 12, y: e.clientY - 8 });
                          setTooltipVisible(tooltipVisible === 'major' ? null : 'major');
                        }}
                        style={{
                          color: currentProfile.accentColor,
                          fontSize: '14px',
                          cursor: 'pointer',
                          marginLeft: '-2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      ><i className="ti ti-chevron-right"></i></span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span style={{ width: '16px' }}></span>
                    <span className="sub-text" style={{ color: currentProfile.lightColor }}><span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.enrollPeriod.endsWith(' ~') ? currentProfile.enrollPeriod.slice(0, -2) : currentProfile.enrollPeriod} - ~{currentProfile.graduationStatus}</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                padding: '20px 0',
                paddingLeft: '40px',
                marginTop: '-5px'
              }}>
                <span style={{
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'Pretendard, sans-serif',
                  textAlign: 'left'
                }}>정보를 입력하세요.</span>
              </div>
            )}
            {hasData && (
              <div className="resume-details">
                <div className="detail-row">
                  <span style={{ width: '16px' }}></span>
                  <span className="sub-text"><span style={{ color: currentProfile.lightColor }}>·</span> {currentProfile.gpa} <span style={{ color: '#999999' }}>/{currentProfile.gpaMax}</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Introduction Box */}
        <div className="resume-intro">
          <Image
            src="/images/0/cluster 1/Image.png"
            alt=""
            width={24}
            height={24}
            className="intro-icon"
          />
          {hasData ? currentProfile.quote : <span style={{ color: '#888', fontSize: '20px' }}>내용을 작성해주세요.</span>}
        </div>

        {/* Three Column Section - 영역 4, 5, 6 side by side */}
        <div className="resume-three-column">
          {/* Stats Section - 영역 4 */}
          <div className="resume-stats">
            <div className="stat-item">
              <div className="stat-row">
                <span className="stat-label"><span className="stat-dot">·</span> 일정 신뢰도</span>
                <span className="stat-value">{hasData ? stat1 : '-'}<span className="stat-unit">%</span></span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: hasData ? `${stat1}%` : '0%' }}></div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-row">
                <span className="stat-label"><span className="stat-dot">·</span> 활동 완료율</span>
                <span className="stat-value">{hasData ? stat2 : '-'}<span className="stat-unit">%</span></span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: hasData ? `${stat2}%` : '0%' }}></div>
              </div>
            </div>
          </div>

          {/* Badges Section - 영역 5 */}
          <div className="resume-badges">
            <div className="badge-group">
              <span className="badge-icon icon-graphic10"></span>
              <span className="badge-num">{hasData ? badge1.toLocaleString() : '-'}</span>
            </div>
            <div className="badge-group">
              <span className="badge-icon icon-shield"></span>
              <span className="badge-num">{hasData ? badge2.toLocaleString() : '-'}</span>
            </div>
            <div className="badge-group">
              <span className="badge-icon icon-graphic13"></span>
              <span className="badge-num red">{hasData ? badge3.toLocaleString() : '-'}</span>
            </div>
          </div>

          {/* Medal Badge - 영역 6 */}
          <div className={`resume-medal ${crewStatus === 'Complete' ? 'no-overlay' : ''}`}>
            <div className="medal-image-wrapper">
              <Image
                src={debugPanelType === 'EC' ? "/images/0/cluster 1/금장_EC.png" : debugPanelType === 'PX' ? "/images/0/cluster 1/금장_PX.png" : "/images/0/cluster 1/금장_OK.png"}
                alt="Medal"
                width={98}
                height={98}
              />
            </div>
            <div className={`medal-text ${crewStatus === 'Next Challenge' ? 'long' : crewStatus === 'Recharging' ? 'medium' : crewStatus === 'Complete' ? 'short-medium' : ''}`}>{crewStatus}</div>
          </div>
        </div>

        {/* Activities */}
        <div style={{ position: 'relative', width: '474px', height: '95px' }}>
          {hasData ? (
          <>
          <div
            ref={activitiesRef}
            className="resume-activities"
            style={{
              width: '100%',
              height: '100%',
              overflowY: 'scroll',
              overflowX: 'hidden',
              padding: 0,
              margin: 0,
              display: 'block',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            } as React.CSSProperties}
          >
            {/* OK: 3개 */}
            {debugPanelType === 'OK' && (
              <>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/01.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">25, 겨울<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">3주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">운영진(앰베서더)</span>
                      <span className="activity-badge active">진행중</span>
                      <span className="activity-check pending">검수중</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/02.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">25, 가을<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">8주 <span style={{ color: '#999' }}>/ 8주</span></span>
                      <span className="activity-role">심화(파트장)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/03.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">25, 여름<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">12주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">일반(정규)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EC: 1개 */}
            {debugPanelType === 'EC' && (
              <div className="activity-row">
                <div className="activity-avatar">
                  <Image src="/images/0/cluster 1/bg image/EC02 (2).png" alt="" width={36} height={36} />
                </div>
                <div className="activity-content">
                  <div className="activity-line">
                    <span className="activity-season">25, 겨울<span style={{ color: '#999' }}>시즌</span></span>
                    <span className="activity-period">5주 <span style={{ color: '#999' }}>/ 16주</span></span>
                    <span className="activity-role">일반(정규)</span>
                    <span className="activity-badge active">진행중</span>
                    <span className="activity-check pending">검수중</span>
                  </div>
                </div>
              </div>
            )}

            {/* PX: 9개 */}
            {debugPanelType === 'PX' && (
              <>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/01.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">25, 겨울<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">3주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">운영진(앰베서더)</span>
                      <span className="activity-badge active">진행중</span>
                      <span className="activity-check pending">검수중</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/02.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">25, 가을<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">8주 <span style={{ color: '#999' }}>/ 8주</span></span>
                      <span className="activity-role">심화(파트장)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/03.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">25, 여름<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">16주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">일반(정규)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/01.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">25, 봄<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">16주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">심화(파트장)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/02.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">24, 겨울<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">16주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">일반(정규)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/03.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">24, 가을<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">16주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">일반(정규)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/01.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">24, 여름<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">16주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">일반(정규)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/02.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">24, 봄<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">16주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">일반(정규)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
                <div className="activity-row">
                  <div className="activity-avatar">
                    <Image src="/images/0/cluster 1/bg image/03.png" alt="" width={36} height={36} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-line">
                      <span className="activity-season">23, 겨울<span style={{ color: '#999' }}>시즌</span></span>
                      <span className="activity-period">16주 <span style={{ color: '#999' }}>/ 16주</span></span>
                      <span className="activity-role">일반(정규)</span>
                      <span className="activity-badge complete">정상 완료</span>
                      <span className="activity-check approved">승인 완료</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 커스텀 스크롤바 */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '2px',
              height: '100%',
              background: '#2a2a2a',
              borderRadius: '2px'
            }}
          >
            <div
              onMouseDown={handleMouseDown}
              style={{
                position: 'absolute',
                top: scrollThumbTop,
                width: '100%',
                height: scrollThumbHeight,
                background: debugPanelType === 'PX' ? '#36DA60' : debugPanelType === 'EC' ? '#FF4B70' : '#FFA500',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: isDragging ? 'none' : 'top 0.1s ease'
              }}
            />
          </div>
          </>
          ) : (
            <>
            <div
              className="resume-activities"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1C242F',
                borderTop: '1px solid #666'
              }}
            >
              <span style={{
                color: '#888',
                fontSize: '14px',
                fontFamily: 'Pretendard, sans-serif'
              }}>
                활동 시작 전입니다.
              </span>
            </div>
            {/* 스크롤바 트랙 영역 */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '2px',
                height: '100%',
                background: '#2a2a2a',
                borderRadius: '2px'
              }}
            />
            </>
          )}
        </div>

        {/* Skill Cards and Footer Notices - with background */}
        <div className="resume-bottom-section">
          {/* Skill Cards */}
          <div className="resume-skills">
            <div className="skill-card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                <div className="skill-num-wrapper">
                  <Image src="/images/0/cluster 1/Sheriff Badge1 2.png" alt="" width={27} height={27} className="skill-icon" style={{ opacity: 0.8 }} />
                  <span className="skill-num" style={{ color: '#FFEB99' }}>{hasData ? skill1 : '-'}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'Pretendard, sans-serif', color: '#FFF', alignSelf: 'flex-end', marginBottom: '4px', marginLeft: '2px' }}>unit</span>
                </div>
                <div className="skill-label">실무 역량 성장</div>
              </div>
            </div>
            <div className="skill-card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                <div className="skill-num-wrapper">
                  <Image src="/images/0/cluster 1/Sheriff Badge1.png" alt="" width={27} height={27} className="skill-icon" style={{ opacity: 0.8 }} />
                  <span className="skill-num" style={{ color: '#FFEB99' }}>{hasData ? skill2 : '-'}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'Pretendard, sans-serif', color: '#FFF', alignSelf: 'flex-end', marginBottom: '4px', marginLeft: '2px' }}>건</span>
                </div>
                <div className="skill-label">실무 경험 축적</div>
              </div>
            </div>
            <div className="skill-card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                <div className="skill-num-wrapper">
                  <Image src="/images/0/cluster 1/Sheriff Badge1 3.png" alt="" width={27} height={27} className="skill-icon" style={{ opacity: 0.8 }} />
                  <span className="skill-num" style={{ color: '#FFEB99' }}>{hasData ? skill3 : '-'}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'Pretendard, sans-serif', color: '#FFF', alignSelf: 'flex-end', marginBottom: '4px', marginLeft: '2px' }}>회</span>
                </div>
                <div className="skill-label">실무 정보 습득</div>
              </div>
            </div>
            <div className="skill-card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                <div className="skill-num-wrapper">
                  <Image src="/images/0/cluster 1/Sheriff Badge1 4.png" alt="" width={27} height={27} className="skill-icon" style={{ opacity: 0.8 }} />
                  <span className="skill-num" style={{ color: '#FFEB99' }}>{hasData ? skill4 : '-'}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'Pretendard, sans-serif', color: '#FFF', alignSelf: 'flex-end', marginBottom: '4px', marginLeft: '2px' }}>proj</span>
                </div>
                <div className="skill-label">실무 경력 누적</div>
              </div>
            </div>
          </div>

          {/* Footer Notices */}
          <div className="resume-notices">
            <div className="notice-box yellow">
              <Image src="/images/0/cluster 1/Star Badge.png" alt="" width={25} height={25} className="notice-icon-img" />
              <span className="notice-text notice-text-top">
                {debugPanelType === 'EC' ? '전국청춘연합 엔터테인먼트/미디어 클럽, 엥크레' : debugPanelType === 'PX' ? '전국청춘연합 기획/컨설팅 클럽, 팔랑크스' : '전국청춘연합 마케팅/퍼포먼스 클럽, 오랑캐'}
              </span>
              <div className="notice-stamp-wrapper" style={{ position: 'relative', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', order: 3, flexShrink: 0, marginLeft: '8px' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', background: 'rgba(0, 0, 0, 0.3)', zIndex: 1 }}></div>
                {crewStatus === 'Complete' && <Image src="/images/0/cluster 1/오랑캐 도장.png" alt="" width={46} height={46} style={{ position: 'relative', zIndex: 2 }} />}
              </div>
            </div>
            <div className="notice-box green">
              <Image src="/images/0/cluster 1/Star Badge2.png" alt="" width={25} height={25} className="notice-icon-img" />
              <span className="notice-text">전국청춘성장 클럽- 기업/실무자 후원 관리 위원회</span>
              <div className="notice-stamp-wrapper" style={{ position: 'relative', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', order: 3, flexShrink: 0, marginLeft: '8px' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', background: 'rgba(0, 0, 0, 0.3)', zIndex: 1 }}></div>
                {crewStatus === 'Complete' && <Image src="/images/0/cluster 1/실무기업 도장.png" alt="" width={46} height={46} style={{ position: 'relative', zIndex: 2 }} />}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div> {/* 스케일 wrapper 닫기 */}

      {/* Contact Info Modal - For 타크루 프로필 */}
      {isEditModalOpen && debugProfileType === '타크루' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 99999,
            paddingTop: '20px'
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative' }}
          >
            <Image
              src="/images/0/cluster 1/card01.png"
              alt="Contact Info"
              width={540}
              height={150}
              style={{ display: 'block' }}
            />
            {/* X 닫기 버튼 */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal - For 본인 프로필 */}
      {isEditModalOpen && debugProfileType === '본인' && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="edit-modal-content"
            style={{
              backgroundColor: '#1a1d29',
              borderRadius: '8px',
              padding: '40px',
              width: '580px',
              maxHeight: '85vh',
              overflowY: 'auto',
              fontFamily: "'Pretendard', sans-serif",
              marginTop: '60px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h6 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: '0 0 30px 0' }}>프로필 수정</h6>

            <form onSubmit={handleSubmit}>
              {/* 성 & 이름 - 일렬 배치 */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {/* 성 */}
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                    성
                  </label>
                  <input
                    className="modal-input chamfer-box"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleNameChange(e, 'lastName', 2)}
                    maxLength={2}
                    placeholder="홍"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#252836',
                      border: errors.lastName ? '1px solid #ff6b6b' : '1px solid transparent',
                      borderRadius: '0',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.lastName && (
                    <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                      {errors.lastName}
                    </span>
                  )}
                </div>

                {/* 이름 */}
                <div style={{ flex: 2 }}>
                  <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                    이름
                  </label>
                  <input
                    className="modal-input chamfer-box"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleNameChange(e, 'firstName', 5)}
                    maxLength={5}
                    placeholder="길동"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#252836',
                      border: errors.firstName ? '1px solid #ff6b6b' : '1px solid transparent',
                      borderRadius: '0',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.firstName && (
                    <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                      {errors.firstName}
                    </span>
                  )}
                </div>
              </div>

              {/* 영문 성 & 이름 - 일렬 배치 */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {/* 영문 성 */}
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                    영문 성
                  </label>
                  <input
                    className="modal-input chamfer-box"
                    type="text"
                    name="lastNameEng"
                    value={formData.lastNameEng}
                    onChange={(e) => handleEngNameChange(e, 'lastNameEng', 20)}
                    maxLength={20}
                    placeholder="Hong"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#252836',
                      border: errors.lastNameEng ? '1px solid #ff6b6b' : '1px solid transparent',
                      borderRadius: '0',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.lastNameEng && (
                    <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                      {errors.lastNameEng}
                    </span>
                  )}
                </div>

                {/* 영문 이름 */}
                <div style={{ flex: 2 }}>
                  <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                    영문 이름
                  </label>
                  <input
                    className="modal-input chamfer-box"
                    type="text"
                    name="firstNameEng"
                    value={formData.firstNameEng}
                    onChange={(e) => handleEngNameChange(e, 'firstNameEng', 30)}
                    maxLength={30}
                    placeholder="Gildong"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#252836',
                      border: errors.firstNameEng ? '1px solid #ff6b6b' : '1px solid transparent',
                      borderRadius: '0',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.firstNameEng && (
                    <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                      {errors.firstNameEng}
                    </span>
                  )}
                </div>
              </div>

              {/* 성별 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                  성별
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="chamfer-box"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      backgroundColor: formData.gender === 'male' ? '#FFA500' : '#252836',
                      border: '1px solid transparent',
                      borderRadius: '0',
                      color: formData.gender === 'male' ? '#1a1d29' : '#8a8d98',
                      fontSize: '16px',
                      fontWeight: formData.gender === 'male' ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    남
                  </button>
                  <button
                    type="button"
                    className="chamfer-box"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      backgroundColor: formData.gender === 'female' ? '#FFA500' : '#252836',
                      border: '1px solid transparent',
                      borderRadius: '0',
                      color: formData.gender === 'female' ? '#1a1d29' : '#8a8d98',
                      fontSize: '16px',
                      fontWeight: formData.gender === 'female' ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    여
                  </button>
                </div>
              </div>

              {/* 생년월일 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                  생년월일
                </label>
                <style dangerouslySetInnerHTML={{__html: `
                  .edit-modal-content {
                    font-family: 'Pretendard', sans-serif !important;
                  }
                  .edit-modal-content * {
                    font-family: 'Pretendard', sans-serif !important;
                  }
                  .edit-modal-content::-webkit-scrollbar {
                    width: 8px;
                  }
                  .edit-modal-content::-webkit-scrollbar-track {
                    background: #252836;
                    border-radius: 4px;
                  }
                  .edit-modal-content::-webkit-scrollbar-thumb {
                    background: #FFA500;
                    border-radius: 4px;
                  }
                  .edit-modal-content::-webkit-scrollbar-thumb:hover {
                    background: #22c55e;
                  }
                  .custom-dropdown-list::-webkit-scrollbar {
                    width: 6px;
                  }
                  .custom-dropdown-list::-webkit-scrollbar-track {
                    background: #1a1d29;
                    border-radius: 3px;
                  }
                  .custom-dropdown-list::-webkit-scrollbar-thumb {
                    background: #FFA500;
                    border-radius: 3px;
                  }
                `}} />
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {/* 년도 커스텀 드롭다운 */}
                  <div style={{ flex: 1.2, position: 'relative' }}>
                    <div
                      className="chamfer-box"
                      onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                      style={{
                        padding: '14px 12px',
                        backgroundColor: '#252836',
                        borderRadius: '0',
                        color: formData.birthDate.split('-')[0] ? '#fff' : '#6b6e7a',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: openDropdown === 'year' ? '1px solid #FFA500' : '1px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{formData.birthDate.split('-')[0] ? `${formData.birthDate.split('-')[0]}년` : '년'}</span>
                      <span style={{
                        transform: openDropdown === 'year' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        fontSize: '10px',
                        color: '#8a8d98'
                      }}>▼</span>
                    </div>
                    {openDropdown === 'year' && (
                      <div
                        className="custom-dropdown-list"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          backgroundColor: '#1a1d29',
                          borderRadius: '8px',
                          border: '1px solid #333',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 100,
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        {Array.from({ length: 56 }, (_, i) => 2025 - i).map(year => (
                          <div
                            key={year}
                            onClick={() => {
                              const month = formData.birthDate.split('-')[1] || '';
                              const day = formData.birthDate.split('-')[2] || '';
                              setFormData(prev => ({ ...prev, birthDate: `${year}-${month}-${day}` }));
                              setOpenDropdown(null);
                            }}
                            style={{
                              padding: '12px 14px',
                              color: formData.birthDate.split('-')[0] === String(year) ? '#FFA500' : '#fff',
                              backgroundColor: formData.birthDate.split('-')[0] === String(year) ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              borderBottom: '1px solid #252836'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.15)';
                              e.currentTarget.style.color = '#FFA500';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = formData.birthDate.split('-')[0] === String(year) ? 'rgba(255, 165, 0, 0.1)' : 'transparent';
                              e.currentTarget.style.color = formData.birthDate.split('-')[0] === String(year) ? '#FFA500' : '#fff';
                            }}
                          >
                            {year}년
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 월 커스텀 드롭다운 */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div
                      className="chamfer-box"
                      onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
                      style={{
                        padding: '14px 12px',
                        backgroundColor: '#252836',
                        borderRadius: '0',
                        color: formData.birthDate.split('-')[1] ? '#fff' : '#6b6e7a',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: openDropdown === 'month' ? '1px solid #FFA500' : '1px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{formData.birthDate.split('-')[1] ? `${parseInt(formData.birthDate.split('-')[1])}월` : '월'}</span>
                      <span style={{
                        transform: openDropdown === 'month' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        fontSize: '10px',
                        color: '#8a8d98'
                      }}>▼</span>
                    </div>
                    {openDropdown === 'month' && (
                      <div
                        className="custom-dropdown-list"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          backgroundColor: '#1a1d29',
                          borderRadius: '8px',
                          border: '1px solid #333',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 100,
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <div
                            key={month}
                            onClick={() => {
                              const year = formData.birthDate.split('-')[0] || '';
                              const day = formData.birthDate.split('-')[2] || '';
                              setFormData(prev => ({ ...prev, birthDate: `${year}-${String(month).padStart(2, '0')}-${day}` }));
                              setOpenDropdown(null);
                            }}
                            style={{
                              padding: '12px 14px',
                              color: formData.birthDate.split('-')[1] === String(month).padStart(2, '0') ? '#FFA500' : '#fff',
                              backgroundColor: formData.birthDate.split('-')[1] === String(month).padStart(2, '0') ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              borderBottom: '1px solid #252836'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.15)';
                              e.currentTarget.style.color = '#FFA500';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = formData.birthDate.split('-')[1] === String(month).padStart(2, '0') ? 'rgba(255, 165, 0, 0.1)' : 'transparent';
                              e.currentTarget.style.color = formData.birthDate.split('-')[1] === String(month).padStart(2, '0') ? '#FFA500' : '#fff';
                            }}
                          >
                            {month}월
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 일 커스텀 드롭다운 */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div
                      className="chamfer-box"
                      onClick={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')}
                      style={{
                        padding: '14px 12px',
                        backgroundColor: '#252836',
                        borderRadius: '0',
                        color: formData.birthDate.split('-')[2] ? '#fff' : '#6b6e7a',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: openDropdown === 'day' ? '1px solid #FFA500' : '1px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{formData.birthDate.split('-')[2] ? `${parseInt(formData.birthDate.split('-')[2])}일` : '일'}</span>
                      <span style={{
                        transform: openDropdown === 'day' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        fontSize: '10px',
                        color: '#8a8d98'
                      }}>▼</span>
                    </div>
                    {openDropdown === 'day' && (
                      <div
                        className="custom-dropdown-list"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          backgroundColor: '#1a1d29',
                          borderRadius: '8px',
                          border: '1px solid #333',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 100,
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <div
                            key={day}
                            onClick={() => {
                              const year = formData.birthDate.split('-')[0] || '';
                              const month = formData.birthDate.split('-')[1] || '';
                              setFormData(prev => ({ ...prev, birthDate: `${year}-${month}-${String(day).padStart(2, '0')}` }));
                              setOpenDropdown(null);
                            }}
                            style={{
                              padding: '12px 14px',
                              color: formData.birthDate.split('-')[2] === String(day).padStart(2, '0') ? '#FFA500' : '#fff',
                              backgroundColor: formData.birthDate.split('-')[2] === String(day).padStart(2, '0') ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              borderBottom: '1px solid #252836'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.15)';
                              e.currentTarget.style.color = '#FFA500';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = formData.birthDate.split('-')[2] === String(day).padStart(2, '0') ? 'rgba(255, 165, 0, 0.1)' : 'transparent';
                              e.currentTarget.style.color = formData.birthDate.split('-')[2] === String(day).padStart(2, '0') ? '#FFA500' : '#fff';
                            }}
                          >
                            {day}일
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 주소 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                  주소
                </label>
                {!isCustomAddress ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {/* 시/도 커스텀 드롭다운 */}
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div
                        className="chamfer-box"
                        onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
                        style={{
                          padding: '14px 12px',
                          backgroundColor: '#252836',
                          borderRadius: '0',
                          color: formData.addressCity ? '#fff' : '#6b6e7a',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: openDropdown === 'city' ? '1px solid #FFA500' : '1px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span>{formData.addressCity || '시/도 선택'}</span>
                        <span style={{
                          transform: openDropdown === 'city' ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          fontSize: '10px',
                          color: '#8a8d98'
                        }}>▼</span>
                      </div>
                      {openDropdown === 'city' && (
                        <div
                          className="custom-dropdown-list"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            backgroundColor: '#1a1d29',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 100,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                          }}
                        >
                          {Object.keys(koreaRegions).map(city => (
                            <div
                              key={city}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, addressCity: city, addressDistrict: '' }));
                                setOpenDropdown(null);
                              }}
                              style={{
                                padding: '12px 14px',
                                color: formData.addressCity === city ? '#FFA500' : '#fff',
                                backgroundColor: formData.addressCity === city ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                borderBottom: '1px solid #252836'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.15)';
                                e.currentTarget.style.color = '#FFA500';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = formData.addressCity === city ? 'rgba(255, 165, 0, 0.1)' : 'transparent';
                                e.currentTarget.style.color = formData.addressCity === city ? '#FFA500' : '#fff';
                              }}
                            >
                              {city}
                            </div>
                          ))}
                          {/* 직접 입력 옵션 */}
                          <div
                            onClick={() => {
                              setIsCustomAddress(true);
                              setFormData(prev => ({ ...prev, addressCity: '', addressDistrict: '' }));
                              setOpenDropdown(null);
                            }}
                            style={{
                              padding: '12px 14px',
                              color: '#FFA500',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              borderTop: '2px solid #333',
                              fontWeight: 500
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            직접 입력
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 구/군 커스텀 드롭다운 */}
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div
                        className="chamfer-box"
                        onClick={() => {
                          if (formData.addressCity) {
                            setOpenDropdown(openDropdown === 'district' ? null : 'district');
                          }
                        }}
                        style={{
                          padding: '14px 12px',
                          backgroundColor: '#252836',
                          borderRadius: '0',
                          color: formData.addressDistrict ? '#fff' : '#6b6e7a',
                          fontSize: '14px',
                          cursor: formData.addressCity ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: openDropdown === 'district' ? '1px solid #FFA500' : '1px solid transparent',
                          transition: 'all 0.2s ease',
                          opacity: formData.addressCity ? 1 : 0.6
                        }}
                      >
                        <span>{formData.addressDistrict || '구/군 선택'}</span>
                        <span style={{
                          transform: openDropdown === 'district' ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          fontSize: '10px',
                          color: '#8a8d98'
                        }}>▼</span>
                      </div>
                      {openDropdown === 'district' && formData.addressCity && (
                        <div
                          className="custom-dropdown-list"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            backgroundColor: '#1a1d29',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 100,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                          }}
                        >
                          {koreaRegions[formData.addressCity]?.map(district => (
                            <div
                              key={district}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, addressDistrict: district }));
                                setOpenDropdown(null);
                              }}
                              style={{
                                padding: '12px 14px',
                                color: formData.addressDistrict === district ? '#FFA500' : '#fff',
                                backgroundColor: formData.addressDistrict === district ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                borderBottom: '1px solid #252836'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.15)';
                                e.currentTarget.style.color = '#FFA500';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = formData.addressDistrict === district ? 'rgba(255, 165, 0, 0.1)' : 'transparent';
                                e.currentTarget.style.color = formData.addressDistrict === district ? '#FFA500' : '#fff';
                              }}
                            >
                              {district}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 직접 입력 모드 */
                  <div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        className="modal-input chamfer-box"
                        type="text"
                        name="customAddress"
                        value={formData.customAddress}
                        onChange={handleInputChange}
                        placeholder="해외 또는 기타 주소를 입력해주세요 (예: 미국 캘리포니아, 독도)"
                        style={{
                          flex: 1,
                          padding: '14px 16px',
                          backgroundColor: '#252836',
                          border: '1px solid #FFB84D',
                          borderRadius: '0',
                          color: '#fff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        className="chamfer-box"
                        onClick={() => {
                          setIsCustomAddress(false);
                          setFormData(prev => ({ ...prev, customAddress: '' }));
                        }}
                        style={{
                          padding: '14px 16px',
                          backgroundColor: '#252836',
                          border: '1px solid #555',
                          borderRadius: '0',
                          color: '#8a8d98',
                          fontSize: '14px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#FFA500';
                          e.currentTarget.style.color = '#FFA500';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#555';
                          e.currentTarget.style.color = '#8a8d98';
                        }}
                      >
                        목록에서 선택
                      </button>
                    </div>
                    <span style={{ color: '#8a8d98', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                      해외 거주자 또는 특수 지역 거주자는 주소를 직접 입력해주세요.
                    </span>
                  </div>
                )}
              </div>

              {/* 핸드폰 번호 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                  핸드폰 번호
                </label>
                <style dangerouslySetInnerHTML={{__html: `
                  .phone-input::placeholder {
                    color: #6b6e7a;
                  }
                `}} />
                {(() => {
                  const phoneMid = formData.phone.split('-')[0] || '';
                  const phoneLast = formData.phone.split('-')[1] || '';
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {/* 010 고정 */}
                      <div
                        className="chamfer-box"
                        style={{
                          width: '70px',
                          flexShrink: 0,
                          padding: '14px 16px',
                          backgroundColor: '#1a1d29',
                          border: '1px solid #333',
                          borderRadius: '0',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 500,
                          textAlign: 'center'
                        }}
                      >
                        010
                      </div>
                      <span style={{ color: '#555', fontSize: '16px', padding: '0 8px' }}>-</span>
                      {/* 중간 4자리 */}
                      <input
                        type="text"
                        name="phoneMid"
                        className="phone-input modal-input chamfer-box"
                        value={phoneMid}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                          setFormData(prev => ({ ...prev, phone: `${value}-${phoneLast}` }));
                        }}
                        maxLength={4}
                        placeholder="0000"
                        style={{
                          width: '100px',
                          flexShrink: 0,
                          padding: '14px 16px',
                          backgroundColor: '#252836',
                          border: '1px solid transparent',
                          borderRadius: '0',
                          color: '#fff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{ color: '#555', fontSize: '16px', padding: '0 8px' }}>-</span>
                      {/* 마지막 4자리 */}
                      <input
                        type="text"
                        name="phoneLast"
                        className="phone-input modal-input chamfer-box"
                        value={phoneLast}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                          setFormData(prev => ({ ...prev, phone: `${phoneMid}-${value}` }));
                        }}
                        maxLength={4}
                        placeholder="0000"
                        style={{
                          width: '100px',
                          flexShrink: 0,
                          padding: '14px 16px',
                          backgroundColor: '#252836',
                          border: '1px solid transparent',
                          borderRadius: '0',
                          color: '#fff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  );
                })()}
              </div>

              {/* 이메일 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                  이메일
                </label>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {/* 이메일 아이디 입력 */}
                  <input
                    className="modal-input chamfer-box"
                    type="text"
                    name="emailId"
                    value={formData.emailId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, emailId: value }));

                      // 이메일 아이디 형식 검증 (영문, 숫자, ., _, - 만 허용)
                      const emailIdRegex = /^[a-zA-Z0-9._-]*$/;
                      if (value && !emailIdRegex.test(value)) {
                        setErrors(prev => ({ ...prev, email: '이메일 아이디는 영문, 숫자, ., _, - 만 사용 가능합니다' }));
                      } else if (value && value.length < 2) {
                        setErrors(prev => ({ ...prev, email: '이메일 아이디는 2자 이상 입력해주세요' }));
                      } else {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="example"
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      backgroundColor: '#252836',
                      border: errors.email ? '1px solid #ff6b6b' : '1px solid transparent',
                      borderRadius: '0',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)'
                    }}
                  />
                  <span style={{ color: '#555', fontSize: '16px', padding: '0 8px' }}>@</span>
                  {/* 이메일 도메인 드롭다운 또는 직접 입력 */}
                  {!isCustomEmailDomain ? (
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div
                        className="chamfer-box"
                        onClick={() => setOpenDropdown(openDropdown === 'emailDomain' ? null : 'emailDomain')}
                        style={{
                          padding: '14px 12px',
                          backgroundColor: '#252836',
                          borderRadius: '0',
                          color: formData.emailDomain ? '#fff' : '#6b6e7a',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: openDropdown === 'emailDomain' ? '1px solid #FFA500' : '1px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span>{formData.emailDomain || '선택'}</span>
                        <span style={{
                          transform: openDropdown === 'emailDomain' ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          fontSize: '10px',
                          color: '#8a8d98'
                        }}>▼</span>
                      </div>
                      {openDropdown === 'emailDomain' && (
                        <div
                          className="custom-dropdown-list"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            backgroundColor: '#1a1d29',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 100,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                          }}
                        >
                          {['naver.com', 'gmail.com', 'daum.net', 'hanmail.net', 'kakao.com', 'nate.com', 'outlook.com', 'icloud.com'].map(domain => (
                            <div
                              key={domain}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, emailDomain: domain }));
                                setOpenDropdown(null);
                              }}
                              style={{
                                padding: '12px 14px',
                                color: formData.emailDomain === domain ? '#FFA500' : '#fff',
                                backgroundColor: formData.emailDomain === domain ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                borderBottom: '1px solid #252836'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.15)';
                                e.currentTarget.style.color = '#FFA500';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = formData.emailDomain === domain ? 'rgba(255, 165, 0, 0.1)' : 'transparent';
                                e.currentTarget.style.color = formData.emailDomain === domain ? '#FFA500' : '#fff';
                              }}
                            >
                              {domain}
                            </div>
                          ))}
                          {/* 직접 입력 옵션 */}
                          <div
                            onClick={() => {
                              setIsCustomEmailDomain(true);
                              setFormData(prev => ({ ...prev, emailDomain: '' }));
                              setOpenDropdown(null);
                            }}
                            style={{
                              padding: '12px 14px',
                              color: '#FFA500',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              borderTop: '2px solid #333',
                              fontWeight: 500
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            직접 입력
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        className="modal-input chamfer-box"
                        type="text"
                        name="customEmailDomain"
                        value={formData.customEmailDomain}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-Z0-9.-]/g, '');
                          setFormData(prev => ({ ...prev, customEmailDomain: value }));
                        }}
                        placeholder="domain.com"
                        style={{
                          flex: 1,
                          padding: '14px 16px',
                          backgroundColor: '#252836',
                          border: '1px solid #FFB84D',
                          borderRadius: '0',
                          color: '#fff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        className="chamfer-box"
                        onClick={() => {
                          setIsCustomEmailDomain(false);
                          setFormData(prev => ({ ...prev, customEmailDomain: '' }));
                        }}
                        style={{
                          padding: '14px 12px',
                          backgroundColor: '#252836',
                          border: '1px solid #555',
                          borderRadius: '0',
                          color: '#8a8d98',
                          fontSize: '12px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#FFA500';
                          e.currentTarget.style.color = '#FFA500';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#555';
                          e.currentTarget.style.color = '#8a8d98';
                        }}
                      >
                        목록
                      </button>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* 슬로건 섹션 */}
              <div style={{ marginBottom: '24px', borderTop: '1px solid #333', paddingTop: '24px' }}>
                <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                  슬로건
                </label>
                <textarea
                  className="modal-input chamfer-box"
                  name="slogan"
                  value={formData.slogan}
                  onChange={(e) => {
                    if (e.target.value.length <= 70) {
                      setFormData(prev => ({ ...prev, slogan: e.target.value }));
                    }
                  }}
                  placeholder="나만의 슬로건을 입력해주세요 (예: 가장 어두운 순간에도 빛을 향해 용기 있게...)"
                  maxLength={70}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#252836',
                    border: '1px solid transparent',
                    borderRadius: '0',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '80px',
                    lineHeight: '1.5'
                  }}
                />
                <span style={{ color: '#8a8d98', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  {formData.slogan.length}/70자
                </span>
              </div>

              {/* 연계 링크 */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#8a8d98', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                  연계 링크
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ color: '#8a8d98', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Image src="/images/0/cluster 1/003.png" alt="" width={16} height={16} />
                      Portfolio Files
                    </label>
                    <input
                      className="modal-input chamfer-box"
                      type="url"
                      value={iconLink3}
                      onChange={(e) => handleIconLinkChange(e.target.value, 3)}
                      placeholder="https://example.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#252836',
                        border: iconLinkErrors.link3 ? '1px solid #ff6b6b' : '1px solid transparent',
                        borderRadius: '0',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {iconLinkErrors.link3 && (
                      <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                        {iconLinkErrors.link3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#3a3d4a',
                margin: '16px 0 32px 0'
              }} />

              {/* Submit Button */}
              <style dangerouslySetInnerHTML={{__html: `
                @font-face {
                  font-family: 'Cafe24Ohsquare';
                  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Cafe24Ohsquare.woff') format('woff');
                  font-weight: normal;
                  font-style: normal;
                }
                .submit-btn-cafe {
                  font-family: 'Cafe24Ohsquare', sans-serif !important;
                }
              `}} />
              <button
                type="submit"
                className="chamfer-box submit-btn-cafe"
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#FFA500',
                  border: 'none',
                  borderRadius: '0',
                  color: '#1a1d29',
                  fontSize: '20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                작성완료
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 핸드폰 코멘트 모달 - 타크루 프로필용 (안내 팝업) */}
      {isPhoneCommentModalOpen && debugProfileType === '타크루' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}
          onClick={() => setIsPhoneCommentModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1d29',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '480px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              {/* 전화 아이콘 */}
              <div style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Image src="/images/0/cluster 1/phone-only-dynamic-color.png" alt="phone" width={28} height={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.4,
                  fontFamily: 'Pretendard, sans-serif'
                }}>
                  연락이 필요하시면, 하단 내용을 참고해주세요 :)
                </h3>
              </div>
              <button
                onClick={() => setIsPhoneCommentModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8a8d98',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>
            {/* 내용 */}
            <div
              style={{
                backgroundColor: '#252836',
                borderRadius: '12px',
                padding: '16px 20px',
                marginTop: '16px'
              }}
            >
              <p style={{ color: '#ffffff', fontSize: '16px', margin: 0, lineHeight: 1.6, fontFamily: 'Pretendard, sans-serif', wordBreak: 'keep-all' }}>
                저는 평일 9~23시까지 언제든 연락이 가능합니다 :)<br />
                주말에는 10~24시까지 연락이 가능합니다. 수요일 5시는 어려워요!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 핸드폰 코멘트 모달 - 본인 프로필용 (입력 폼) */}
      {isPhoneCommentModalOpen && debugProfileType === '본인' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}
          onClick={() => setIsPhoneCommentModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1d29',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '480px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              {/* 전화 아이콘 */}
              <div style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Image src="/images/0/cluster 1/phone-only-dynamic-color.png" alt="phone" width={28} height={28} />
              </div>
              <div>
                <h3 style={{
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  연락이 가능한 시간대와 코멘트를 작성해 주세요 :)
                </h3>
                <p style={{
                  color: '#8a8d98',
                  fontSize: '14px',
                  margin: '2px 0 0 0'
                }}>
                  최대 70자까지 작성 가능합니다
                </p>
              </div>
            </div>

            {/* 입력 필드 */}
            <style dangerouslySetInnerHTML={{__html: `
              .phone-comment-input::placeholder {
                color: #999;
              }
            `}} />
            <div style={{ marginTop: '20px' }}>
              <input
                className="phone-comment-input"
                type="text"
                value={formData.phoneComment}
                onChange={(e) => {
                  if (e.target.value.length <= 70) {
                    setFormData(prev => ({ ...prev, phoneComment: e.target.value }));
                  }
                }}
                placeholder="내용을 작성해 주세요."
                maxLength={70}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#252836',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 작성 완료 버튼 */}
            <style dangerouslySetInnerHTML={{__html: `
              @font-face {
                font-family: 'Cafe24Ohsquare';
                src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Cafe24Ohsquare.woff') format('woff');
                font-weight: normal;
                font-style: normal;
              }
              .phone-modal-btn {
                font-family: 'Cafe24Ohsquare', sans-serif !important;
              }
            `}} />
            <button
              className="chamfer-box phone-modal-btn"
              onClick={async () => {
                try {
                  const response = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contact_available: formData.phoneComment || null }),
                  });
                  const result = await response.json();
                  if (result.success) {
                    setIsPhoneCommentModalOpen(false);
                  } else {
                    alert('저장 실패: ' + (result.error || '알 수 없는 오류'));
                  }
                } catch (error) {
                  console.error('연락처 코멘트 저장 오류:', error);
                  alert('저장 중 오류가 발생했습니다.');
                }
              }}
              style={{
                width: '70%',
                marginTop: '20px',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'block',
                padding: '12px 24px',
                backgroundColor: '#FFA500',
                border: 'none',
                color: '#000',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
              }}
            >
              작성 완료
            </button>
          </div>
        </div>
      )}

      {/* PP test 디버그 패널 - createPortal로 body에 렌더링 */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* PP test 디버그 패널 토글 버튼 */}
          <div
            onClick={() => setIsDebugPanelOpen(!isDebugPanelOpen)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#FFA500',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#000'
            }}
          >
            PP
          </div>

          {/* PP test 디버그 패널 */}
          {isDebugPanelOpen && (
            <div
              style={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                width: '400px',
                maxHeight: '500px',
                backgroundColor: '#1a1d29',
                borderRadius: '12px',
                padding: '16px',
                zIndex: 9999,
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                overflowY: 'auto'
              }}
            >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#FFA500', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>PP test</h3>
            <span
              onClick={() => setIsDebugPanelOpen(false)}
              style={{ color: '#8a8d98', cursor: 'pointer', fontSize: '20px' }}
            >×</span>
          </div>

          {/* 본인 프로필 / 타 크루 프로필 버튼 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setDebugProfileType('본인')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: debugProfileType === '본인' ? '#FFA500' : '#252836',
                border: debugProfileType === '본인' ? 'none' : '1px solid #333',
                borderRadius: '8px',
                color: debugProfileType === '본인' ? '#000' : '#fff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              본인 프로필
            </button>
            <button
              onClick={() => setDebugProfileType('타크루')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: debugProfileType === '타크루' ? '#FFA500' : '#252836',
                border: debugProfileType === '타크루' ? 'none' : '1px solid #333',
                borderRadius: '8px',
                color: debugProfileType === '타크루' ? '#000' : '#fff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              타 크루 프로필
            </button>
          </div>

          {/* OK / EC / PX 선택 버튼 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setDebugPanelType('OK')}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: debugPanelType === 'OK' ? '#FFA500' : '#252836',
                border: debugPanelType === 'OK' ? 'none' : '1px solid #FFA500',
                borderRadius: '8px',
                color: debugPanelType === 'OK' ? '#000' : '#FFA500',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              OK
            </button>
            <button
              onClick={() => setDebugPanelType('EC')}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: debugPanelType === 'EC' ? '#f97316' : '#252836',
                border: debugPanelType === 'EC' ? 'none' : '1px solid #f97316',
                borderRadius: '8px',
                color: debugPanelType === 'EC' ? '#000' : '#f97316',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              EC
            </button>
            <button
              onClick={() => setDebugPanelType('PX')}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: debugPanelType === 'PX' ? '#3b82f6' : '#252836',
                border: debugPanelType === 'PX' ? 'none' : '1px solid #3b82f6',
                borderRadius: '8px',
                color: debugPanelType === 'PX' ? '#fff' : '#3b82f6',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              PX
            </button>
          </div>

          {/* 크루 상태 선택 버튼 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#8a8d98', fontSize: '12px', marginBottom: '8px' }}>크루 상태 (섹션 6)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(['Running', 'Complete', 'On Rest', 'Recharging', 'Next Challenge'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setCrewStatus(status)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: crewStatus === status ? '#22c55e' : '#252836',
                    border: crewStatus === status ? 'none' : '1px solid #22c55e',
                    borderRadius: '6px',
                    color: crewStatus === status ? '#000' : '#22c55e',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* 데이터 상태 토글 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#8a8d98', fontSize: '12px', marginBottom: '8px' }}>데이터 상태</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setHasData(true)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: hasData ? '#3b82f6' : '#252836',
                  border: hasData ? 'none' : '1px solid #3b82f6',
                  borderRadius: '6px',
                  color: hasData ? '#fff' : '#3b82f6',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                데이터 있음
              </button>
              <button
                onClick={() => setHasData(false)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: !hasData ? '#ef4444' : '#252836',
                  border: !hasData ? 'none' : '1px solid #ef4444',
                  borderRadius: '6px',
                  color: !hasData ? '#fff' : '#ef4444',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                데이터 없음
              </button>
            </div>
          </div>

          {/* 선택된 타입에 따른 데이터 표시 */}
          <div style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}>
            <div style={{
              color: debugPanelType === 'OK' ? '#FFA500' : debugPanelType === 'EC' ? '#f97316' : '#3b82f6',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              {debugPanelType} - {debugProfileType === '본인' ? '본인 프로필' : '타 크루 프로필'}
            </div>
            <pre style={{
              backgroundColor: '#252836',
              padding: '12px',
              borderRadius: '8px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0
            }}>
              {debugPanelType === 'OK' && JSON.stringify({
                lastName: formData.lastName,
                firstName: formData.firstName,
                gender: formData.gender,
                birthDate: formData.birthDate,
                addressCity: formData.addressCity,
                addressDistrict: formData.addressDistrict,
                phone: formData.phone,
                phoneComment: formData.phoneComment,
                emailId: formData.emailId,
                emailDomain: formData.emailDomain
              }, null, 2)}
              {debugPanelType === 'EC' && JSON.stringify({
                schoolType: formData.schoolType,
                school: formData.school,
                major: formData.major,
                graduationStatus: formData.graduationStatus,
                entranceYear: formData.entranceYear,
                entranceMonth: formData.entranceMonth,
                graduationYear: formData.graduationYear,
                graduationMonth: formData.graduationMonth,
                gpa: formData.gpa,
                gpaMax: formData.gpaMax
              }, null, 2)}
              {debugPanelType === 'PX' && JSON.stringify({
                additionalMajor: formData.additionalMajor,
                additionalMajorType: formData.additionalMajorType,
                customEmailDomain: formData.customEmailDomain,
                customAddress: formData.customAddress,
                customGpaMax: formData.customGpaMax,
                educationLevel: formData.educationLevel
              }, null, 2)}
            </pre>
          </div>
            </div>
          )}
        </>,
        document.body
      )}

      {/* 커스텀 툴팁 */}
      {tooltipVisible && (
        <div
          className="custom-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            ...(tooltipVisible === 'major' && {
              background: 'transparent',
              padding: 0,
              boxShadow: 'none',
              borderRadius: 0
            })
          }}
        >
          {tooltipVisible === 'email' && currentProfile.email}
          {tooltipVisible === 'school' && currentProfile.school}
          {tooltipVisible === 'major' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: 'rgba(20, 20, 20, 0.95)',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              minWidth: '180px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: currentProfile.accentColor, fontSize: '10px' }}>●</span>
                <span style={{ color: '#666', fontSize: '11px' }}>전공 1</span>
                <span style={{ color: '#fff', fontSize: '13px' }}>{currentProfile.major}</span>
              </div>
              {currentProfile.major2 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: currentProfile.lightColor, fontSize: '10px' }}>●</span>
                  <span style={{ color: '#666', fontSize: '11px' }}>전공 2</span>
                  <span style={{ color: '#fff', fontSize: '13px' }}>{currentProfile.major2}</span>
                </div>
              )}
              {currentProfile.major3 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#888', fontSize: '10px' }}>●</span>
                  <span style={{ color: '#666', fontSize: '11px' }}>전공 3</span>
                  <span style={{ color: '#fff', fontSize: '13px' }}>{currentProfile.major3}</span>
                </div>
              )}
            </div>
          )}
          {tooltipVisible === 'hexagon1' && 'Club Community'}
          {tooltipVisible === 'hexagon2' && 'Life Resume'}
          {tooltipVisible === 'hexagon3' && 'Portfolio Files'}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
