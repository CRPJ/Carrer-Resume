"use client";

// #ToDo 커리어넷 API 키 발급 후 전국 학교 목록 연동

import { useState, useRef, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import schoolDataJson from "@/data/korea-schools.json";

const schoolData: { [key: string]: string[] } = schoolDataJson;

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

// 학력 데이터 (기본값 - DB에서 로드되면 덮어씀)
const initialEducationData: EduData[] = [
  {
    eduLevel: "-",
    school: "-",
    status: "-",
    category: "-",
    major1: "-",
    major2: "-",
    major3: "-",
    period: "-",
    startYear: "",
    startMonth: "",
    endYear: "",
    endMonth: "",
    gradeMax: "-",
    gradeValue: "-",
    description: "-",
    isFinal: true
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
  // 세션 및 본인 프로필 여부 확인
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get('userId') || searchParams.get('userID');

  // 본인 프로필인지 확인: URL에 userId가 없거나, 로그인한 사용자 ID와 같으면 본인
  const isOwner = !urlUserId || (session?.user?.id === urlUserId);

  const [currentPage, setCurrentPage] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<EduData | null>(null);

  // 승인 상태 관련
  const [isApproved, setIsApproved] = useState(false);

  // 승인 상태 확인 함수
  const checkApprovalStatus = async () => {
    if (!session) return false;

    try {
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
    }
  };

  // 수정 버튼 클릭 핸들러 (승인 상태 체크)
  const handleEditClick = async (openModalFn: () => void) => {
    // TODO: 프로덕션 배포 전 로그인 체크 복원
    openModalFn();
};

  // 섹션 1 모달 (프로필 사진 수정)
  const [section1ModalOpen, setSection1ModalOpen] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<string | null>(null);
  const [subPhotos, setSubPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [starredPhoto, setStarredPhoto] = useState<number | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);

  // 이미지 압축 함수 (2MB 이하로)
  const compressImage = async (file: File, maxSizeMB: number = 2): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        const maxDimension = 1200; // 최대 1200px

        // 크기 조정
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // 품질 조정하면서 압축
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size <= maxSizeMB * 1024 * 1024) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else if (quality > 0.1) {
                quality -= 0.1;
                tryCompress();
              } else {
                resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
              }
            },
            'image/jpeg',
            quality
          );
        };
        tryCompress();
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // 사진 업로드 함수
  const uploadPhoto = async (file: File, photoType: string): Promise<string | null> => {
    try {
      // 2MB 초과시 압축
      let processedFile = file;
      if (file.size > 2 * 1024 * 1024) {
        processedFile = await compressImage(file);
      }

      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('type', photoType);

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        return result.url;
      } else {
        alert(result.error || '사진 업로드에 실패했습니다.');
        return null;
      }
    } catch (error) {
      console.error('사진 업로드 오류:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
      return null;
    }
  };

  // DB에서 사진 로드
  const fetchPhotos = async () => {
    if (!session) return;

    setPhotoLoading(true);
    try {
      const response = await fetch('/api/photos');
      const result = await response.json();

      if (result.success && result.data) {
        setMainPhoto(result.data.mainPhoto || null);
        setSubPhotos(result.data.subPhotos || [null, null, null, null]);
      }
    } catch (error) {
      console.error('사진 로드 오류:', error);
    } finally {
      setPhotoLoading(false);
    }
  };

  // 세션 변경 시 사진 로드
  useEffect(() => {
    if (session && isOwner) {
      fetchPhotos();
    }
  }, [session, isOwner]);

  // 사진 저장 함수
  const handleSavePhotos = async () => {
    setPhotoSaving(true);
    try {
      const response = await fetch('/api/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainPhoto,
          subPhotos,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('사진이 저장되었습니다.');
        setSection1ModalOpen(false);
      } else {
        alert(result.error || '사진 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('사진 저장 오류:', error);
      alert('사진 저장 중 오류가 발생했습니다.');
    } finally {
      setPhotoSaving(false);
    }
  };

  // 파일 input refs
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const subPhotoInputRef = useRef<HTMLInputElement>(null);
  const [currentSubIndex, setCurrentSubIndex] = useState<number>(0);

  // 메인 사진 변경 핸들러
  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoLoading(true);
      const url = await uploadPhoto(file, 'main');
      if (url) {
        setMainPhoto(url);
      }
      setPhotoLoading(false);
    }
    e.target.value = '';
  };

  // 서브 사진 업로드 핸들러 - 순서대로 채움
  const handleSubPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoLoading(true);
      // 업로드할 슬롯 결정
      const targetIndex = subPhotos.findIndex(photo => !photo);
      const uploadIndex = targetIndex !== -1 ? targetIndex : currentSubIndex;
      const photoType = `sub${uploadIndex + 1}`;

      const url = await uploadPhoto(file, photoType);
      if (url) {
        setSubPhotos(prev => {
          const newPhotos = [...prev];
          newPhotos[uploadIndex] = url;
          return newPhotos;
        });
      }
      setPhotoLoading(false);
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
    slogan1: { option: "", content: "" },
    slogan2: { option: "", content: "" },
    slogan3: { option: "", content: "" }
  });
  const [editingSloganData, setEditingSloganData] = useState(sloganData);
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);
  const [dropdown3Open, setDropdown3Open] = useState(false);
  const [sloganSaving, setSloganSaving] = useState(false);
  const [sloganAuthorName, setSloganAuthorName] = useState("");

  // DB에서 슬로건 로드
  const fetchSlogans = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/slogans');
      const result = await response.json();

      if (result.success && result.data) {
        const newSloganData = {
          slogan1: {
            option: result.data.slogan1?.option || "",
            content: result.data.slogan1?.content || ""
          },
          slogan2: {
            option: result.data.slogan2?.option || "",
            content: result.data.slogan2?.content || ""
          },
          slogan3: {
            option: result.data.slogan3?.option || "",
            content: result.data.slogan3?.content || ""
          }
        };
        setSloganData(newSloganData);
        setEditingSloganData(newSloganData);

        // 영어 이름 설정
        if (result.data.engName) {
          setSloganAuthorName(result.data.engName);
        }
      }
    } catch (error) {
      console.error('슬로건 로드 오류:', error);
    }
  };

  // 세션 변경 시 슬로건 로드
  useEffect(() => {
    if (session && isOwner) {
      fetchSlogans();
    }
  }, [session, isOwner]);

  // 슬로건 저장
  const handleSaveSlogans = async () => {
    setSloganSaving(true);
    try {
      const response = await fetch('/api/slogans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slogan1: editingSloganData.slogan1,
          slogan2: editingSloganData.slogan2,
          slogan3: editingSloganData.slogan3,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSloganData(editingSloganData);
        alert('슬로건이 저장되었습니다.');
        setSection2ModalOpen(false);
      } else {
        alert(result.error || '슬로건 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('슬로건 저장 오류:', error);
      alert('슬로건 저장 중 오류가 발생했습니다.');
    } finally {
      setSloganSaving(false);
    }
  };

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
      videoUrl: ""
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
  const [videoSaving, setVideoSaving] = useState(false);

  // DB에서 영상 URL 로드
  const fetchVideos = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/videos');
      const result = await response.json();

      if (result.success && result.data) {
        const authorName = result.data.engName || 'Unknown';
        setVideoData(prev => {
          const newData = [...prev];
          // 모든 영상에 영어 이름 설정
          newData.forEach(video => {
            video.author = authorName;
          });
          if (result.data.videoUrl1) {
            newData[0].videoUrl = result.data.videoUrl1;
            newData[0].thumbnail = getYouTubeThumbnail(result.data.videoUrl1);
          }
          if (result.data.videoUrl2) {
            newData[1].videoUrl = result.data.videoUrl2;
            newData[1].thumbnail = getYouTubeThumbnail(result.data.videoUrl2);
          }
          if (result.data.videoUrl3) {
            newData[2].videoUrl = result.data.videoUrl3;
            newData[2].thumbnail = getYouTubeThumbnail(result.data.videoUrl3);
          }
          return newData;
        });
      }
    } catch (error) {
      console.error('영상 로드 오류:', error);
    }
  };

  // 세션 변경 시 영상 로드
  useEffect(() => {
    if (session && isOwner) {
      fetchVideos();
    }
  }, [session, isOwner]);

  // 영상 URL 저장
  const handleSaveVideos = async () => {
    setVideoSaving(true);
    try {
      const response = await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl1: editingVideoData[0]?.videoUrl || null,
          videoUrl2: editingVideoData[1]?.videoUrl || null,
          videoUrl3: editingVideoData[2]?.videoUrl || null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setVideoData([...editingVideoData]);
        alert('영상이 저장되었습니다.');
        setSection21ModalOpen(false);
      } else {
        alert(result.error || '영상 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('영상 저장 오류:', error);
      alert('영상 저장 중 오류가 발생했습니다.');
    } finally {
      setVideoSaving(false);
    }
  };

  // 섹션 3 모달 (학력 편집)
  const [section3ModalOpen, setSection3ModalOpen] = useState(false);
  const [educationData, setEducationData] = useState<EduData[]>(initialEducationData);
  const [editingEduData, setEditingEduData] = useState<EduData[]>(initialEducationData);
  const [hasEduChanges, setHasEduChanges] = useState(false); // 학력 변경사항 추적
  const [eduSaving, setEduSaving] = useState(false);

  // 학력 데이터 로드
  const fetchEducations = async () => {
    try {
      const response = await fetch('/api/educations');
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        setEducationData(result.data);
        setEditingEduData(result.data);
      }
    } catch (error) {
      console.error('학력 로드 오류:', error);
    }
  };

  // 세션 변경 시 학력 로드
  useEffect(() => {
    if (session && isOwner) {
      fetchEducations();
    }
  }, [session, isOwner]);

  // 학력 저장 함수
  const handleSaveEducations = async (processedData: EduData[]) => {
    setEduSaving(true);
    try {
      const response = await fetch('/api/educations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          educations: processedData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setEducationData(processedData);
        setEditingEduData(processedData);
        setHasEduChanges(false);
        setSection3ModalOpen(false);
        alert('학력이 저장되었습니다.');
      } else {
        alert(result.error || '학력 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('학력 저장 오류:', error);
      alert('학력 저장 중 오류가 발생했습니다.');
    } finally {
      setEduSaving(false);
    }
  };

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
  const defaultIntroContent = '카드를 클릭하여 자기소개서를 작성해주세요';
  const [introCards, setIntroCards] = useState([
    {
      id: 1,
      icon: '/images/0/cluster 2/icon/01성장 과정.png',
      title: '성장 과정',
      subtitle: '저는 이렇게 성장하였습니다 😊',
      content: defaultIntroContent
    },
    {
      id: 2,
      icon: '/images/0/cluster 2/icon/03사회 경험.png',
      title: '사회 경험',
      subtitle: '저는 이런 것들을 경험하였습니다 😊',
      content: defaultIntroContent
    },
    {
      id: 3,
      icon: '/images/0/cluster 2/icon/02커리어 방향.png',
      title: '커리어 방향',
      subtitle: '저는 이 방향으로 나아가고자 합니다 😊',
      content: defaultIntroContent
    },
    {
      id: 4,
      icon: '/images/0/cluster 2/icon/04실무 스타일.png',
      title: '실무 스타일',
      subtitle: '저는 이렇게 일합니다 😊',
      content: defaultIntroContent
    },
    {
      id: 5,
      icon: '/images/0/cluster 2/icon/05퍼스널 스토리.png',
      title: '퍼스널 스토리',
      subtitle: '저는 이런 사람입니다 😊',
      content: defaultIntroContent
    }
  ]);
  const [introModalOpen, setIntroModalOpen] = useState(false);
  const [selectedIntroCard, setSelectedIntroCard] = useState<number | null>(null);
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [editingIntroData, setEditingIntroData] = useState({ content: '' });
  const [introSaving, setIntroSaving] = useState(false);
  const [reviewLinks, setReviewLinks] = useState<string[]>([
    '', // Total Complete (cluving_review_link)
    '', // 3 weeks
    '', // 6 weeks
    '', // 9 weeks
    '', // 12 weeks
    '', // 15 weeks
    '', // 18 weeks
    '', // 21 weeks
    '', // 24 weeks
    ''  // 27 weeks
  ]);
  const [editingReviewLinks, setEditingReviewLinks] = useState<string[]>([
    '', '', '', '', '', '', '', '', '', ''
  ]);
  const [reviewLinkSaving, setReviewLinkSaving] = useState(false);

  // DB에서 리뷰 링크 로드
  const fetchReviewLink = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/review-link');
      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.cluvingReviewLink) {
          setReviewLinks(prev => {
            const newLinks = [...prev];
            newLinks[0] = result.data.cluvingReviewLink;
            return newLinks;
          });
        }
      }
    } catch (error) {
      console.error('리뷰 링크 로드 오류:', error);
    }
  };

  // 세션 변경 시 리뷰 링크 로드
  useEffect(() => {
    if (session && isOwner) {
      fetchReviewLink();
    }
  }, [session, isOwner]);

  // DB에서 자기소개서 로드
  const fetchIntroductions = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/introductions');
      const result = await response.json();

      if (result.success && result.data) {
        const fieldMapping: { [key: string]: string } = {
          growthStory: '성장 과정',
          socialExperience: '사회 경험',
          careerDirection: '커리어 방향',
          workStyle: '실무 스타일',
          personalStory: '퍼스널 스토리',
        };

        const dbFieldOrder = ['growthStory', 'socialExperience', 'careerDirection', 'workStyle', 'personalStory'];

        setIntroCards(prev => {
          const newCards = [...prev];
          dbFieldOrder.forEach((dbField, index) => {
            const dbValue = result.data[dbField];
            if (dbValue) {
              newCards[index] = {
                ...newCards[index],
                content: dbValue
              };
            }
          });
          return newCards;
        });
      }
    } catch (error) {
      console.error('자기소개서 로드 오류:', error);
    }
  };

  // 세션 변경 시 자기소개서 로드
  useEffect(() => {
    if (session && isOwner) {
      fetchIntroductions();
    }
  }, [session, isOwner]);

  // 자기소개서 저장
  const handleSaveIntroduction = async (cardIndex: number, content: string) => {
    const fieldMapping = ['growth_story', 'social_experience', 'career_direction', 'work_style', 'personal_story'];
    const field = fieldMapping[cardIndex];

    setIntroSaving(true);
    try {
      const response = await fetch('/api/introductions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          content,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const newCards = [...introCards];
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          content: content
        };
        setIntroCards(newCards);
        setIsEditingIntro(false);
        alert('자기소개서가 저장되었습니다.');
      } else {
        alert(result.error || '자기소개서 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('자기소개서 저장 오류:', error);
      alert('자기소개서 저장 중 오류가 발생했습니다.');
    } finally {
      setIntroSaving(false);
    }
  };

  // 리뷰 링크 저장
  const handleSaveReviewLinks = async () => {
    setReviewLinkSaving(true);
    try {
      const response = await fetch('/api/review-link', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cluvingReviewLink: editingReviewLinks[0] || null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setReviewLinks([...editingReviewLinks]);
        alert('리뷰 링크가 저장되었습니다.');
        setSection4ModalOpen(false);
      } else {
        alert(result.error || '리뷰 링크 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 링크 저장 오류:', error);
      alert('리뷰 링크 저장 중 오류가 발생했습니다.');
    } finally {
      setReviewLinkSaving(false);
    }
  };
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
  const videosRef = useRef<HTMLDivElement>(null);
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
    // 모바일 CTA 성격: 자기소개서 섹션으로 스크롤
    introRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

          {/* Floating Icons - 설명 영역 우측 하단 */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '5px',
            marginTop: '10px',
            marginRight: '40px'    
          }}>
            <div className="edit-icon">
              <img src="/images/0/cluster 2/icon -  modify.png" alt="Modify" />
            </div>
            <div className="edit-icon">
              <img src="/images/0/cluster 2/icon - help.png" alt="Help" />
            </div>
          </div>
        </div>  {/* section1-description 닫힘 */}
      </div>    {/* cluster2-title-wrapper 닫힘 */}

      {/* 상단 섹션: 연결된 프레임 */}
      <div className="cluster2-top-frame" style={{ position: 'relative' }}>
        {/* Floating Icons - PROFILE 영역 우측 하단 */}
        {session && isOwner && (
          <div className="floating-icons" style={{
            display: 'flex',
            position: 'absolute',
            bottom: '220px',
            right: '40px',
            zIndex: 100,
            gap: '5px'
          }}>
            <div className="edit-icon" style={{ cursor: 'pointer' }} onClick={() => handleEditClick(() => setSection1ModalOpen(true))}>
                <img src="/images/0/cluster 2/icon -  modify.png" alt="Modify" style={{ pointerEvents: 'none' }} />
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
          <img
            src={mainPhoto || "/images/0/cluster 2/이안0.png"}
            alt="Profile"
          />
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
            <span>With us</span>
          </button>
        </div>
      </div>

      {/* 섹션 2-1: 비디오 섹션 */}
      <div ref={videosRef} className="cluster2-videos" style={{ position: 'relative' }}>
        {/* Floating Icons - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => handleEditClick(() => { setEditingVideoData([...videoData]); setSection21ModalOpen(true); })}>
              <img src="/images/0/cluster /icon/Edit_Pencil_Line_01.png" alt="Edit" />
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
        {/* Floating Icons - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => handleEditClick(() => { setEditingSloganData(sloganData); setSection2ModalOpen(true); })}>
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
              <p className="quote-subtext">
                지금의 한 걸음이 작아 보여도 결국 미래를 바꾸는 결정적 힘이 된다 흔들려도 멈추지 않으면 결국 도착한다 그게 성장의 증거다
              </p>
              <p className="quote-text">
                {sloganData.slogan2.content}
              </p>
              <div className="quote-footer">
                <div className="quote-author">
                  <img src={subPhotos[0] || "/images/0/cluster 2/이안1.webp"} alt="" />
                  <div className="author-info">
                    <span className="author-name">{sloganAuthorName || 'Unknown'}</span>
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
                    <span className="score-count">n/10</span>
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
              <p className="quote-subtext">
                지금의 한 걸음이 작아 보여도 결국 미래를 바꾸는 결정적 힘이 된다 흔들려도 멈추지 않으면 결국 도착한다 그게 성장의 증거다
              </p>
              <p className="quote-text">
                {sloganData.slogan3.content}
              </p>
              <div className="quote-footer">
                <div className="quote-author">
                  <img src={subPhotos[2] || "/images/0/cluster 2/이안3.jpg"} alt="" />
                  <div className="author-info">
                    <span className="author-name">{sloganAuthorName || 'Unknown'}</span>
                    <span className="author-role">{sloganData.slogan3.option}</span>
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
                    <span className="score-count">n/10</span>
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
        {/* Floating Icons - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => handleEditClick(() => { setEditingEduData([...educationData]); setSection3ModalOpen(true); })}>
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
                <li><span className="dot">·</span><span className="label">성적</span><span className="value highlight">{edu.gradeMax === '9등급' ? `${edu.gradeValue}등급` : edu.gradeMax === '100%' ? `${edu.gradeValue}%` : edu.gradeValue}{edu.gradeMax !== '기타' && <span className="grade-sub"> / {edu.gradeMax}</span>}</span></li>
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
                  <p className="desc-text">{edu.description.length > 35 ? edu.description.substring(0, 35) + '...' : edu.description}</p>
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
        {/* Floating Icons - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon" onClick={() => handleEditClick(() => { setEditingReviewLinks([...reviewLinks]); setSection4ModalOpen(true); })}>
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
        {/* Floating Icons - 로그인한 본인만 표시 */}
        {session && isOwner && (
          <div className="floating-icons" style={{ display: 'flex' }}>
            <div className="edit-icon search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <div className="tooltip">등록된 도움말이 없습니다</div>
            </div>
          </div>
        )}
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
            <div className="section1-modal-body" style={{ position: 'relative' }}>
              {/* 로딩 오버레이 */}
              {photoLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  borderRadius: '8px',
                }}>
                  <span style={{ color: '#fff', fontSize: '14px' }}>업로드 중...</span>
                </div>
              )}
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
              <button className="cancel-btn" onClick={() => setSection1ModalOpen(false)} disabled={photoSaving}>취소</button>
              <button className="save-btn" onClick={handleSavePhotos} disabled={photoSaving || photoLoading}>
                {photoSaving ? '저장 중...' : '저장'}
              </button>
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
                    onClick={() => { setDropdown1Open(!dropdown1Open); setDropdown2Open(false); setDropdown3Open(false); }}
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
                    onClick={() => { setDropdown2Open(!dropdown2Open); setDropdown1Open(false); setDropdown3Open(false); }}
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

              {/* 슬로건 3 */}
              <div className="slogan-edit-item">
                <span className="slogan-label">슬로건 3</span>
                <div className="slogan-dropdown-wrapper">
                  <button
                    className="slogan-dropdown-btn"
                    onClick={() => { setDropdown3Open(!dropdown3Open); setDropdown1Open(false); setDropdown2Open(false); }}
                  >
                    <span>{editingSloganData.slogan3.option}</span>
                    <i className={`ti ti-chevron-down ${dropdown3Open ? 'rotate' : ''}`}></i>
                  </button>
                  {dropdown3Open && (
                    <div className="slogan-dropdown-menu">
                      {sloganOptions.map((option) => (
                        <div
                          key={option}
                          className={`dropdown-item ${editingSloganData.slogan3.option === option ? 'selected' : ''}`}
                          onClick={() => {
                            setEditingSloganData({
                              ...editingSloganData,
                              slogan3: { ...editingSloganData.slogan3, option }
                            });
                            setDropdown3Open(false);
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
                    value={editingSloganData.slogan3.content}
                    onChange={(e) => {
                      if (e.target.value.length <= 86) {
                        setEditingSloganData({
                          ...editingSloganData,
                          slogan3: { ...editingSloganData.slogan3, content: e.target.value }
                        });
                      }
                    }}
                    maxLength={86}
                    placeholder="슬로건 내용을 입력하세요 (최대 86자)"
                  />
                  <span className="char-count">{editingSloganData.slogan3.content.length}/86</span>
                </div>
              </div>
            </div>
            <div className="section2-modal-footer">
              <button className="cancel-btn" onClick={() => setSection2ModalOpen(false)} disabled={sloganSaving}>취소</button>
              <button
                className="save-btn"
                onClick={handleSaveSlogans}
                disabled={sloganSaving}
              >
                {sloganSaving ? '저장 중...' : '저장'}
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
              <button className="cancel-btn" onClick={() => setSection21ModalOpen(false)} disabled={videoSaving}>취소</button>
              <button
                className="save-btn"
                onClick={handleSaveVideos}
                disabled={videoSaving}
              >
                {videoSaving ? '저장 중...' : '저장'}
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
                {!isEditingIntro && (
                  <button
                    className="intro-edit-btn"
                    aria-label="수정"
                    onClick={() =>
                      handleEditClick(() => {
                        setEditingIntroData({
                          content: introCards[selectedIntroCard].content,
                        });
                        setIsEditingIntro(true);
                      })
                    }
                  >
                    <i className="ti ti-pencil"></i> 수정
                  </button>
                )}
                {isEditingIntro && (
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
                      disabled={introSaving}
                      onClick={() => {
                        if (selectedIntroCard !== null) {
                          handleSaveIntroduction(selectedIntroCard, editingIntroData.content);
                        }
                      }}
                    >
                      {introSaving ? '저장 중...' : '저장'}
                    </button>
                  </>
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
                    placeholder="(입력해도 저장되지 않습니다. 곧 도입될 예정입니다.)"
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
              <button className="cancel-btn" onClick={() => setSection4ModalOpen(false)} disabled={reviewLinkSaving}>취소</button>
              <button
                className="save-btn"
                onClick={handleSaveReviewLinks}
                disabled={reviewLinkSaving}
              >
                {reviewLinkSaving ? '저장 중...' : '저장'}
              </button>
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
                disabled={eduSaving}
                onClick={() => {
                  // 필수 입력 검증: 학교, 상태, 계열, 전공1, 입학년도, 성적
                  const invalidCards = editingEduData.map((edu, index) => {
                    const missing: string[] = [];
                    if (!edu.school || edu.school === '-') missing.push('학교');
                    if (!edu.status || edu.status === '-') missing.push('상태');
                    if (!edu.category || edu.category === '-') missing.push('계열');
                    if (!edu.major1 || edu.major1 === '-') missing.push('전공 1');
                    if (!edu.startYear) missing.push('입학년도');
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

                  // 저장 로직 - 빈 전공 필드를 "-"로 변환 + period 계산 후 저장
                  const processedData = editingEduData.map(edu => {
                    // period 계산: startYear/startMonth, endYear/endMonth, status 기반
                    const startStr = edu.startYear && edu.startMonth
                      ? `${edu.startYear}.${edu.startMonth}`
                      : edu.startYear || "";
                    const endStr = edu.endYear && edu.endMonth
                      ? `${edu.endYear}.${edu.endMonth}`
                      : edu.endYear || "";
                    const isOngoing = ['재학', '졸예', '졸업예정', '휴학'].includes(edu.status);

                    let period = "";
                    if (startStr) {
                      if (isOngoing) {
                        period = `${startStr} - ~ing`;
                      } else if (endStr) {
                        period = `${startStr} - ${endStr}`;
                      } else {
                        period = `${startStr} -`;
                      }
                    }

                    return {
                      ...edu,
                      period,
                      major1: edu.major1.trim() === '' ? '-' : edu.major1,
                      major2: edu.major2.trim() === '' ? '-' : edu.major2,
                      major3: edu.major3.trim() === '' ? '-' : edu.major3,
                    };
                  });
                  handleSaveEducations(processedData);
                }}
              >
                {eduSaving ? '저장 중...' : '저장'}
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