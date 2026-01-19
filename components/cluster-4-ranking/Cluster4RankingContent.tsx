"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface WeekOption {
  id: string;
  weekNumber: number;
  seasonYear: number;
  seasonName: string;
  startDate: string;
  endDate: string;
  isClubBreak: boolean;
  holidayName: string | null;
  label: string;
}

interface RateInfo {
  total: number;
  count: number;
  rate: number;
}

interface RankingUser {
  userId: string;
  displayName: string;
  profilePhotoUrl: string | null;
  status: string;
  teamName: string | null;
  partName: string | null;
  roleLabel: string;
  star: number;
  lightning: number;
  shield: number;
  injeolmi: number;
  growthStatus: string;
  cumulativeApprovedWeeks: number;
  growthRate: RateInfo;
  infoRate: RateInfo;
  competencyRate: RateInfo;
  experienceRate: RateInfo;
  careerRate: RateInfo;
}

const Cluster4RankingContent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("역대 시즌");
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [seasonBtnPos, setSeasonBtnPos] = useState({ top: 0, left: 0 });
  const [weekBtnPos, setWeekBtnPos] = useState({ top: 0, left: 0 });
  const seasonBtnRef = useRef<HTMLDivElement>(null);
  const weekBtnRef = useRef<HTMLDivElement>(null);

  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekOption | null>(null);
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 주차 목록 로드
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await fetch('/api/cluster-4-ranking');
        const result = await response.json();
        if (result.success && result.weeks) {
          setWeeks(result.weeks);

          // 가장 최근 완료된 주차를 기본 선택 (현재 진행 중인 주차는 API에서 제외됨)
          if (result.weeks.length > 0) {
            setSelectedWeekId(result.weeks[0].id);
            setSelectedSeason(`${result.weeks[0].seasonYear}년, ${result.weeks[0].seasonName} 시즌`);
          }
        }
      } catch (error) {
        console.error("주차 목록 로드 오류:", error);
      }
    };
    fetchWeeks();
  }, []);

  // 선택된 주차의 랭킹 데이터 로드
  useEffect(() => {
    if (!selectedWeekId) return;

    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/cluster-4-ranking?weekId=${selectedWeekId}`);
        const result = await response.json();
        if (result.success) {
          setSelectedWeek(result.selectedWeek);
          setRankings(result.rankings || []);
        }
      } catch (error) {
        console.error("랭킹 데이터 로드 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
    setCurrentPage(1);
  }, [selectedWeekId]);

  // 시즌 옵션 추출
  const seasonOptions = React.useMemo(() => {
    const seasonOrder: { [key: string]: number } = { '봄': 1, '여름': 2, '가을': 3, '겨울': 4 };
    const uniqueSeasons = new Map<string, { year: number; season: string }>();
    weeks.forEach(week => {
      const key = `${week.seasonYear}-${week.seasonName}`;
      if (!uniqueSeasons.has(key)) {
        uniqueSeasons.set(key, { year: week.seasonYear, season: week.seasonName });
      }
    });
    return Array.from(uniqueSeasons.values())
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return (seasonOrder[b.season] || 0) - (seasonOrder[a.season] || 0);
      })
      .map(s => `${s.year}년, ${s.season} 시즌`);
  }, [weeks]);

  // 선택된 시즌의 주차 옵션
  const weekOptions = React.useMemo(() => {
    if (selectedSeason === "역대 시즌") return weeks;
    const [yearPart, seasonPart] = selectedSeason.replace("년,", "").split(" ");
    const year = parseInt(yearPart);
    const season = seasonPart;
    return weeks.filter(w => w.seasonYear === year && w.seasonName === season);
  }, [weeks, selectedSeason]);

  // 버튼 위치 업데이트
  const updateSeasonPos = () => {
    if (seasonBtnRef.current) {
      const rect = seasonBtnRef.current.getBoundingClientRect();
      setSeasonBtnPos({ top: rect.bottom + 8, left: rect.left });
    }
  };

  const updateWeekPos = () => {
    if (weekBtnRef.current) {
      const rect = weekBtnRef.current.getBoundingClientRect();
      setWeekBtnPos({ top: rect.bottom + 8, left: rect.left });
    }
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayOfWeek = days[date.getDay()];
    return `${year} - ${month} - ${day} (${dayOfWeek})`;
  };

  // 페이지네이션
  const itemsPerPage = 10;
  const totalPages = Math.ceil(rankings.length / itemsPerPage);
  const paginatedRankings = rankings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* 드롭다운 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 시즌 드롭다운 */}
      {seasonDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: seasonBtnPos.top,
            left: seasonBtnPos.left,
            width: '200px',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            zIndex: 999999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'dropdownSlide 0.2s ease-out',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {seasonOptions.map((option, index) => (
            <div
              key={index}
              style={{
                padding: '12px 16px',
                color: selectedSeason === option ? '#FFA500' : '#fff',
                background: selectedSeason === option ? 'rgba(255,165,0,0.2)' : 'transparent',
                cursor: 'pointer',
                borderBottom: index < seasonOptions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}
              onClick={() => {
                setSelectedSeason(option);
                setSeasonDropdownOpen(false);
                // 시즌 변경 시 해당 시즌의 첫 주차 선택
                const [yearPart, seasonPart] = option.replace("년,", "").split(" ");
                const year = parseInt(yearPart);
                const season = seasonPart;
                const firstWeek = weeks.find(w => w.seasonYear === year && w.seasonName === season);
                if (firstWeek) setSelectedWeekId(firstWeek.id);
              }}
              onMouseEnter={(e) => {
                if (selectedSeason !== option) e.currentTarget.style.background = 'rgba(255,165,0,0.1)';
              }}
              onMouseLeave={(e) => {
                if (selectedSeason !== option) e.currentTarget.style.background = 'transparent';
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {/* 주차 드롭다운 */}
      {weekDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: weekBtnPos.top,
            left: weekBtnPos.left,
            width: '280px',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            zIndex: 999999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'dropdownSlide 0.2s ease-out',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {weekOptions.map((week, index) => (
            <div
              key={week.id}
              style={{
                padding: '12px 16px',
                color: selectedWeekId === week.id ? '#FFA500' : '#fff',
                background: selectedWeekId === week.id ? 'rgba(255,165,0,0.2)' : 'transparent',
                cursor: 'pointer',
                borderBottom: index < weekOptions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}
              onClick={() => {
                setSelectedWeekId(week.id);
                setWeekDropdownOpen(false);
              }}
              onMouseEnter={(e) => {
                if (selectedWeekId !== week.id) e.currentTarget.style.background = 'rgba(255,165,0,0.1)';
              }}
              onMouseLeave={(e) => {
                if (selectedWeekId !== week.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              {week.weekNumber}주차 ({formatDate(week.startDate).split(' ').slice(2).join(' ')})
            </div>
          ))}
        </div>
      )}

      <div className="cluster4-content cluster4-content--week">

        {/* Section 3: 랭킹 리스트 */}
        <section className="cluster4-weekly-list">
          {/* 필터 바 */}
          <div className="weekly-filter-bar">
            <div
              className="filter-card filter-card-large"
              onClick={() => {
                setSelectedSeason("역대 시즌");
                if (weeks.length > 0) setSelectedWeekId(weeks[0].id);
                setSeasonDropdownOpen(false);
                setWeekDropdownOpen(false);
              }}
            >
              <div className="card-left">
                <img src="/images/0/cluster 4/icon/icon - 1.png" alt="reset" className="filter-icon" />
                <span>Reset</span>
              </div>
            </div>
            {/* 시즌 선택 */}
            <div
              ref={seasonBtnRef}
              className="filter-card filter-dropdown"
              style={{
                borderColor: selectedSeason !== "역대 시즌" ? '#FFA500' : 'rgba(255, 255, 255, 0.12)',
                background: selectedSeason !== "역대 시즌" ? 'rgba(255, 165, 0, 0.1)' : 'transparent'
              }}
              onClick={() => {
                updateSeasonPos();
                setSeasonDropdownOpen(!seasonDropdownOpen);
                setWeekDropdownOpen(false);
              }}
            >
              <div className="card-left">
                <img src="/images/0/cluster 4/icon/icon - 2.png" alt="calendar" className="card-icon" />
                <span className="card-label" style={{ color: selectedSeason !== "역대 시즌" ? '#FFA500' : '#fff' }}>{selectedSeason}</span>
              </div>
              <span className={`card-arrow ${seasonDropdownOpen ? 'open' : ''}`} style={{ color: selectedSeason !== "역대 시즌" ? '#FFA500' : '#fff' }}>▼</span>
            </div>
            {/* 주차 선택 */}
            <div
              ref={weekBtnRef}
              className="filter-card filter-dropdown"
              style={{
                borderColor: '#FFA500',
                background: 'rgba(255, 165, 0, 0.1)'
              }}
              onClick={() => {
                updateWeekPos();
                setWeekDropdownOpen(!weekDropdownOpen);
                setSeasonDropdownOpen(false);
              }}
            >
              <div className="card-left">
                <img src="/images/0/cluster 4/icon/icon - 7.png" alt="clock" className="card-icon" />
                <span className="card-label" style={{ color: '#FFA500' }}>
                  {selectedWeek ? `${selectedWeek.weekNumber}주차` : '주차 선택'}
                </span>
              </div>
              <span className={`card-arrow ${weekDropdownOpen ? 'open' : ''}`} style={{ color: '#FFA500' }}>▼</span>
            </div>
            <div className="filter-card">
              <div className="card-left">
                <img src="/images/0/cluster 4/icon/icon - 4.png" alt="search" className="card-icon" />
                <span className="card-label">크루 수</span>
              </div>
              <span className="card-value">{rankings.length}</span>
            </div>
          </div>

          {/* 선택된 주차 정보 */}
          {selectedWeek && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(255, 165, 0, 0.1)',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 165, 0, 0.3)'
            }}>
              <span style={{ color: '#FFA500', fontWeight: 600 }}>
                {selectedWeek.seasonYear}년 {selectedWeek.seasonName} 시즌, {selectedWeek.weekNumber}주차
              </span>
              <span style={{ color: '#888', marginLeft: '16px' }}>
                {formatDate(selectedWeek.startDate)} ~ {formatDate(selectedWeek.endDate)}
              </span>
            </div>
          )}

          {/* 랭킹 카드 리스트 */}
          <div className="weekly-cards">
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>랭킹 데이터 로딩 중...</div>
            ) : paginatedRankings.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>해당 주차에 활동한 크루가 없습니다.</div>
            ) : paginatedRankings.map((user, index) => (
              <Link href={`/cluster-4-card/${selectedWeekId}?userId=${user.userId}`} key={user.userId} className="weekly-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                {/* 왼쪽: 프로필 이미지 */}
                <div className={`weekly-card-image ${user.growthStatus === '휴식(개인)' ? 'rest-personal-overlay' : ''}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#1a1a1a',
                  position: 'relative',
                  minWidth: '100px',
                  maxWidth: '100px'
                }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid rgba(255, 165, 0, 0.5)',
                    position: 'relative'
                  }}>
                    <Image
                      src={user.profilePhotoUrl || "/images/streamer/t-two.png"}
                      alt={`${user.displayName} profile`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  {/* 랭킹 번호 */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: index < 3 ? '#FFA500' : '#333',
                    color: index < 3 ? '#000' : '#fff',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  {user.growthStatus === '휴식(개인)' && (
                    <div className="rest-message">
                      <span className="rest-text-line">충분히</span>
                      <span className="rest-text-line">쉬었나요..?</span>
                    </div>
                  )}
                  <div className="image-badges">
                    <div className={`badge-tag ${user.growthStatus === '실패' ? 'fail' : ''} ${user.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${user.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>
                      {user.growthStatus.includes('휴식') ? user.growthStatus : `성장(${user.growthStatus})`}
                    </div>
                  </div>
                </div>

                {/* 중앙 콘텐츠 */}
                <div className="weekly-card-content">
                  {/* 첫 번째 줄: 이름, 날짜, 주차 */}
                  <div className="weekly-card-header">
                    <h4 className="weekly-card-title">{user.displayName}</h4>
                    {selectedWeek && (
                      <>
                        <span className="weekly-card-date">
                          <img src="/images/0/cluster 4/icon/icon - 6.png" alt="calendar" className="date-icon" />
                          {formatDate(selectedWeek.startDate)} ~ {formatDate(selectedWeek.endDate)}
                        </span>
                        <span className="weekly-card-week">
                          <img src="/images/0/cluster 4/icon/icon - 7.png" alt="clock" className="week-icon" />
                          <span className="week-number">{user.cumulativeApprovedWeeks}</span> / 30 주차
                        </span>
                      </>
                    )}
                  </div>

                  {/* 두 번째 줄: 팀, 파트, 역할, 아이템 */}
                  <div className="weekly-card-info">
                    <div className="info-group">
                      <span className="info-item team">
                        <strong>[팀]</strong>{' '}
                        <span className="text-gray">{user.teamName || '-'}</span>
                      </span>
                      <span className="info-divider">|</span>
                      <span className="info-item part">
                        <strong>[파트]</strong>{' '}
                        <span className="text-gray">{user.partName || '-'}</span>
                      </span>
                    </div>
                    <div className="info-group">
                      <span className="info-badge role">
                        <img src="/images/0/cluster 4/icon/icon - 8.png" alt="role" className="role-icon" />
                        <span>{user.roleLabel}</span>
                      </span>
                    </div>
                    <div className="info-group items">
                      <span className="info-divider">·</span>
                      <span className="info-item with-icon">
                        단감
                        <img src="/images/0/cluster 4/icon/icon - 단감.png" alt="단감" className="item-icon" />
                        <strong className="number-value">{user.star}</strong>
                        개
                      </span>
                      <span className="info-divider">·</span>
                      <span className="info-item with-icon">
                        인절미
                        <img src="/images/0/cluster 4/icon/icon - 인절미.png" alt="인절미" className="item-icon" />
                        <strong className="number-value">{user.injeolmi}</strong>
                        개
                      </span>
                      <span className="info-divider">·</span>
                      <span className="info-item with-icon">
                        어흥
                        <img src="/images/0/cluster 4/icon/icon - 어흥.png" alt="어흥" className="item-icon" />
                        <strong className="number-value">{user.lightning > 0 ? `-${user.lightning}` : user.lightning}</strong>
                        개
                      </span>
                    </div>
                  </div>

                  {/* 세 번째 줄: 주차 성장률 */}
                  {(() => {
                    const isRest = user.growthStatus.includes('휴식');
                    return (
                      <>
                        <div className="weekly-card-main-progress">
                          <span className="progress-label"><span className="dot">·</span> 주차 성장률 <strong>{isRest ? '-' : user.growthRate.rate}%</strong></span>
                          <div className="progress-bar-wrapper">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${isRest ? 0 : user.growthRate.rate}%` }}></div>
                            </div>
                          </div>
                          <span className="total-count">
                            <img src="/images/0/cluster 4/icon/icon - 0.png" alt="leaf" className="leaf-icon" />
                            총 {user.growthRate.total} 개 중 <strong>{isRest ? '-' : user.growthRate.count}</strong> 개
                          </span>
                        </div>

                        <div className={`weekly-card-stats-wrapper ${user.growthStatus === '실패' ? 'fail' : ''} ${user.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${user.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>
                          <div className="weekly-card-stats">
                            <span className="stat"><span className="dot">·</span> 실무 <span className={`highlight ${user.growthStatus === '실패' ? 'fail' : ''} ${user.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${user.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>정보</span> 강화율 <strong>{isRest ? '-' : user.infoRate.rate}%</strong> <span className="gray">(<span className="num">{isRest ? '-' : user.infoRate.count}</span>/{user.infoRate.total})</span></span>
                            <span className="stat"><span className="dot">·</span> 실무 <span className={`highlight ${user.growthStatus === '실패' ? 'fail' : ''} ${user.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${user.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>역량</span> 강화율 <strong>{isRest ? '-' : user.competencyRate.rate}%</strong> <span className="gray">(<span className="num">{isRest ? '-' : user.competencyRate.count}</span>/{user.competencyRate.total})</span></span>
                            <span className="stat"><span className="dot">·</span> 실무 <span className={`highlight ${user.growthStatus === '실패' ? 'fail' : ''} ${user.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${user.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>경험</span> 강화율 <strong>{isRest ? '-' : user.experienceRate.rate}%</strong> <span className="gray">(<span className="num">{isRest ? '-' : user.experienceRate.count}</span>/{user.experienceRate.total})</span></span>
                            <span className="stat"><span className="dot">·</span> 실무 <span className={`highlight ${user.growthStatus === '실패' ? 'fail' : ''} ${user.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${user.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>경력</span> 강화율 <strong>{isRest ? '-' : user.careerRate.rate}%</strong> <span className="gray">(<span className="num">{isRest ? '-' : user.careerRate.count}</span>/{user.careerRate.total})</span></span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* 우측 성장 상태 */}
                <div className={`weekly-card-status-badge ${user.growthStatus === '실패' ? 'fail' : ''} ${user.growthStatus === '휴식(개인)' ? 'rest-personal' : ''} ${user.growthStatus === '휴식(공식)' ? 'rest-official' : ''}`}>
                  <span className="status-text">{user.growthStatus.includes('휴식') ? user.growthStatus : `성장 (${user.growthStatus})`}</span>
                  <img src={`/images/0/cluster%204/icon/icon%20-%20${user.growthStatus.includes('휴식') ? user.growthStatus.replace('(', '%28').replace(')', '%29') : `성장%28${user.growthStatus}%29`}.png`} alt={user.growthStatus} className="trophy-icon" />
                </div>

                {/* 더보기 버튼 */}
                <div className="weekly-card-more-btn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="2" fill="none" />
                    <path d="M7 5.5L10 8L7 10.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="weekly-pagination">
            {totalPages > 0 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <span
                  key={num}
                  className={`page-num ${currentPage === num ? 'active' : ''}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </span>
              ))
            ) : (
              <span className="page-num active">1</span>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Cluster4RankingContent;
