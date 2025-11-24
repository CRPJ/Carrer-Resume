"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SidebarProps {
  userId?: string;
}

interface UserProfile {
  id: string;
  display_name: string;
  eng_name: string | null;
  gender: string | null;
  birth_date: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  university: string | null;
  major_first: string | null;
  univ_admission_date: string | null;
  univ_graduation_date: string | null;
  univ_status: string | null;
  univ_gpa: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  club: string | null;
  reliability_rat: number | null;
  total_stars: number | null;
  total_shields: number | null;
  total_lightnings: number | null;
}

interface Season {
  year: string;
  name: string;
  season_order: number;
}

interface SeasonHistory {
  id: string;
  user_id: string;
  season_id: string;
  role_in_season: string;
  approved_weeks: string;
  total_weeks: string;
  progress_status: string;
  review_status: string;
  seasons: Season;
}

const Sidebar = ({ userId }: SidebarProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [seasonHistory, setSeasonHistory] = useState<SeasonHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('Fetching user data for userId:', userId);

      // 프로필과 시즌 히스토리를 병렬로 가져오기
      const [profileResponse, historyResponse] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/season-history`)
      ]);

      const profileResult = await profileResponse.json();
      const historyResult = await historyResponse.json();

      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Failed to fetch user profile');
      }

      setUserProfile(profileResult.data);

      if (historyResult.success) {
        setSeasonHistory(historyResult.data || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  // 전화번호 마스킹 함수: 010-1234-5678 -> 010-1***-****
  const maskPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return '010-****-****';

    // 하이픈 제거
    const cleaned = phone.replace(/-/g, '');

    // 010-1***-**** 형태로 변환
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.charAt(3)}***-****`;
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.charAt(3)}***-****`;
    }

    return '010-****-****';
  };

  // 시즌 이름 한글 변환
  const getSeasonNameKorean = (seasonName: string) => {
    const seasonMap: { [key: string]: string } = {
      'spring': '봄',
      'summer': '여름',
      'fall': '가을',
      'winter': '겨울'
    };
    return seasonMap[seasonName] || seasonName;
  };

  // 역할 한글 변환
  const getRoleKorean = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'crew_regular': '일반(정규)',
      'crew_advanced_agent': '심화(에이전트)',
      'crew_advanced_part_leader': '심화(파트장)',
      'admin_team_leader': '운영진(팀장)',
      'admin_ambassador': '운영진(앰배서더)',
      'admin_club_leader': '운영진(클럽장)'
    };
    return roleMap[role] || role;
  };

  // 진행 상태 한글 변환
  const getProgressStatusKorean = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'in_progress': '진행 중',
      'completed': '정상 완료',
      'full_rest': '통합 휴식',
      'discontinued': '활동 중단',
      'graduated': '정상 졸업'
    };
    return statusMap[status] || status;
  };

  // 검수 상태 한글 변환
  const getReviewStatusKorean = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'reviewing': '검수 중',
      'approved': '승인 완료'
    };
    return statusMap[status] || status;
  };

  // 진행 상태별 CSS 클래스
  const getProgressStatusClass = (status: string) => {
    const classMap: { [key: string]: string } = {
      'in_progress': 'active',
      'completed': 'complete',
      'full_rest': 'rest',
      'discontinued': 'stopped',
      'graduated': 'graduated'
    };
    return classMap[status] || '';
  };

  // 검수 상태별 CSS 클래스
  const getReviewStatusClass = (status: string) => {
    const classMap: { [key: string]: string } = {
      'reviewing': 'pending',
      'approved': 'approved'
    };
    return classMap[status] || '';
  };

  // 시즌별 아바타 이미지 (순서대로 순환)
  const getAvatarImage = (index: number) => {
    const avatars = ['/images/0/01.png', '/images/0/02.png', '/images/0/03.png'];
    return avatars[index % avatars.length];
  };

  if (loading) {
    return (
      <div className="col-xxl-3 order-xxl-first">
        <div className="resume-card">
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-xxl-3 order-xxl-first">
        <div className="resume-card">
          <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-xxl-3 order-xxl-first">
      <style dangerouslySetInnerHTML={{__html: `
        .resume-activities::-webkit-scrollbar {
          width: 4px !important;
        }
        .resume-activities::-webkit-scrollbar-button {
          display: none !important;
          height: 0 !important;
          width: 0 !important;
        }
        .resume-activities::-webkit-scrollbar-track {
          background: #2a2a2a !important;
        }
        .resume-activities::-webkit-scrollbar-thumb {
          background: #FFEC8F !important;
          border-radius: 4px !important;
        }
      `}} />
      <div className="resume-card">
        {/* Header Section */}
        <div className="resume-header">
          <div className="resume-photo">
            <Image
              src={userProfile?.profile_photo_url || "/images/0/iZKpm7I6mM-X1RCe8whJEe_K4L1q7r24whHrO5pK6vLZ1ivZs-sMvk3r35n6xbZ5P3Y8updzx8RXuoYL_5-GCQ.webp"}
              alt="Profile"
              width={240}
              height={273}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div className="resume-info">
            <h1 className="resume-name">
              <span className="back-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Image src="/images/0/small icon/Chevron_Right_MD.png" alt="" width={18} height={18} />


              </span>
              {userProfile?.display_name || '이름'} <span className="name-eng">{userProfile?.eng_name || 'name'}</span>
            </h1>

            <div className="resume-details">
              <div className="detail-row">
                <Image src="/images/0/small icon/User_01.png" alt="" width={16} height={16} />
                <span>·  {userProfile?.gender || '성별'} <Image src="/images/0/small icon/Gift.png" alt="" width={13} height={13} style={{ display: 'inline-block', verticalAlign: 'text-bottom', margin: '0 2px' }} /> · {userProfile?.birth_date || '1999.01.01'}</span>
              </div>
              <div className="detail-row">
                <Image src="/images/0/small icon/House_01.png" alt="" width={16} height={16} />
                <span>· {userProfile?.address || '주소'}</span>
              </div>
              <div className="detail-row">
                <Image src="/images/0/small icon/Mobile_Button.png" alt="" width={16} height={16} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  · {maskPhoneNumber(userProfile?.phone)}
                  <span style={{
                    color: '#FFC300',
                    fontSize: '14px',
                    fontWeight: '400',
                    lineHeight: '1'
                  }}>+</span>
                </span>
              </div>
              <div className="detail-row">
                <Image src="/images/0/small icon/Mail.png" alt="" width={16} height={16} />
                <span>· {userProfile?.email || 'example@gmail.com'}</span>
              </div>
              <div className="detail-row">
                <Image src="/images/0/small icon/Building_03.png" alt="" width={16} height={16} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px'
                }}>· {userProfile?.university || '한국대학교'} <span style={{ color: '#FFEC8F' }}>{userProfile?.major_first || '학과'}</span></span>
              </div>
              <div className="detail-row">
                <span style={{ width: '16px' }}></span>
                <span className="sub-text" style={{ color: '#FFEC8F' }}>
                  · {userProfile?.univ_admission_date || '2020.02'} ~ {userProfile?.univ_graduation_date || userProfile?.univ_status || '재학중'}
                </span>
              </div>
              <div className="detail-row">
                <span style={{ width: '16px' }}></span>
                <span className="sub-text">· {userProfile?.univ_gpa || '0.0'} <span style={{ color: '#999999' }}>/4.5</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction Box */}
        <div className="resume-intro">
          <Image
            src="/images/0/Image.png"
            alt=""
            width={24}
            height={24}
            className="intro-icon"
          />
          {userProfile?.bio || '한줄소개'}
        </div>

        {/* Three Column Section - 영역 4, 5, 6 side by side */}
        <div className="resume-three-column">
          {/* Stats Section - 영역 4 */}
          <div className="resume-stats">
            <div className="stat-item">
              <div className="stat-row">
                <span className="stat-label">· 일정 신뢰도</span>
                <span className="stat-value">{userProfile?.reliability_rat ?? 0}<span className="stat-unit">%</span></span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${userProfile?.reliability_rat ?? 0}%` }}></div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-row">
                <span className="stat-label">· 활동 완료율</span>
                <span className="stat-value">80<span className="stat-unit">%</span></span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>

          {/* Badges Section - 영역 5 */}
          <div className="resume-badges">
            <div className="badge-group">
              <span className="badge-icon icon-graphic10"></span>
              <span className="badge-num">{userProfile?.total_stars ?? 0}</span>
            </div>
            <div className="badge-group">
              <span className="badge-icon icon-shield"></span>
              <span className="badge-num">{userProfile?.total_shields ?? 0}</span>
            </div>
            <div className="badge-group">
              <span className="badge-icon icon-graphic13"></span>
              <span className="badge-num red">{userProfile?.total_lightnings ? -Math.abs(userProfile.total_lightnings) : 0}</span>
            </div>
          </div>

          {/* Medal Badge - 영역 6 */}
          <div className="resume-medal">
            <div className="medal-image-wrapper">
              <Image
                src="/images/0/금장_OK.png"
                alt="Medal"
                width={98}
                height={98}
              />
            </div>
            <div className="medal-text">진행중</div>
          </div>
        </div>

        {/* Activities */}
        <div className="resume-activities" style={{
          width: '474px',
          height: '95px',
          maxHeight: '95px',
          minHeight: '95px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          padding: 0,
          margin: 0,
          display: 'block',
          position: 'relative'
        } as React.CSSProperties}>
          {seasonHistory.length > 0 ? (
            seasonHistory.map((history, index) => (
              <div className="activity-row" key={history.id}>
                <div className="activity-avatar">
                  <Image src={getAvatarImage(index)} alt="" width={36} height={36} />
                </div>
                <div className="activity-content">
                  <div className="activity-line">
                    <span className="activity-season">
                      {String(history.seasons.year).slice(2)}, {getSeasonNameKorean(history.seasons.name)}
                      <span style={{ color: '#999' }}>시즌</span>
                    </span>
                    <span className="activity-period">
                      {history.approved_weeks}주 <span style={{ color: '#999' }}>/ {history.total_weeks}주</span>
                    </span>
                    <span className="activity-role">{getRoleKorean(history.role_in_season)}</span>
                    <span className={`activity-badge ${getProgressStatusClass(history.progress_status)}`}>
                      {getProgressStatusKorean(history.progress_status)}
                    </span>
                    <span className={`activity-check ${getReviewStatusClass(history.review_status)}`}>
                      {getReviewStatusKorean(history.review_status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              시즌 히스토리가 없습니다
            </div>
          )}
        </div>

        {/* Skill Cards and Footer Notices - with background */}
        <div className="resume-bottom-section">
          {/* Skill Cards */}
          <div className="resume-skills">
            <div className="skill-card">
              <div className="skill-num">21</div>
              <div className="skill-label">실무 역량 성장</div>
            </div>
            <div className="skill-card">
              <div className="skill-num">21</div>
              <div className="skill-label">실무 경험 축적</div>
            </div>
            <div className="skill-card">
              <div className="skill-num">21</div>
              <div className="skill-label">실무 정보 습득</div>
            </div>
            <div className="skill-card">
              <div className="skill-num">21</div>
              <div className="skill-label">실무 경력 누적</div>
            </div>
          </div>

          {/* Footer Notices */}
          <div className="resume-notices">
            <div className="notice-box yellow">
              <Image src="/images/0/Star Badge.png" alt="" width={25} height={25} className="notice-icon-img" />
              <span className="notice-text notice-text-top">전국청춘연합 마케팅/퍼포먼스 클럽, 오랑캐</span>
              <Image src="/images/0/오랑캐 도장.png" alt="" width={46} height={46} className="notice-stamp" />
            </div>
            <div className="notice-box green">
              <Image src="/images/0/Star Badge2.png" alt="" width={25} height={25} className="notice-icon-img" />
              <span className="notice-text">전국청춘성장 클럽, 실무/기업 관리 후원회</span>
              <Image src="/images/0/실무기업 도장.png" alt="" width={46} height={46} className="notice-stamp" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;