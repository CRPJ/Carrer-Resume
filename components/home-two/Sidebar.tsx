"use client";
import Image from "next/image";

const Sidebar = () => {
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
              src="/images/0/iZKpm7I6mM-X1RCe8whJEe_K4L1q7r24whHrO5pK6vLZ1ivZs-sMvk3r35n6xbZ5P3Y8updzx8RXuoYL_5-GCQ.webp"
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
              </span>정이안 <span className="name-eng">Jung Ian</span>
            </h1>

            <div className="resume-details">
              <div className="detail-row">
                <Image src="/images/0/small icon/User_01.png" alt="" width={16} height={16} />
                <span>· 여 <Image src="/images/0/small icon/Gift.png" alt="" width={13} height={13} style={{ display: 'inline-block', verticalAlign: 'text-bottom', margin: '0 2px' }} /> · 2002.02.02</span>
              </div>
              <div className="detail-row">
                <Image src="/images/0/small icon/House_01.png" alt="" width={16} height={16} />
                <span>· 서울특별시 강남구</span>
              </div>
              <div className="detail-row">
                <Image src="/images/0/small icon/Mobile_Button.png" alt="" width={16} height={16} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  · 010-1***-****
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
                <span>· gildong@naver.com</span>
              </div>
              <div className="detail-row">
                <Image src="/images/0/small icon/Building_03.png" alt="" width={16} height={16} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px'
                }}>· 성균관대학교 <span style={{ color: '#FFEC8F' }}>미디어커뮤니케이션학과</span></span>
              </div>
              <div className="detail-row">
                <span style={{ width: '16px' }}></span>
                <span className="sub-text" style={{ color: '#FFEC8F' }}>· 2025.03 ~ 재학중</span>
              </div>
              <div className="detail-row">
                <span style={{ width: '16px' }}></span>
                <span className="sub-text">· 3.0 <span style={{ color: '#999999' }}>/4.5</span></span>
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
          가장 어두운 순간에도 빛을 향해 용기 있게 한 걸음 내딛는 자에게는 언제나 반드시 새로운 길이 열리고 밝은 희망이 찾아온다
        </div>

        {/* Three Column Section - 영역 4, 5, 6 side by side */}
        <div className="resume-three-column">
          {/* Stats Section - 영역 4 */}
          <div className="resume-stats">
            <div className="stat-item">
              <div className="stat-row">
                <span className="stat-label">· 일정 신뢰도</span>
                <span className="stat-value">100<span className="stat-unit">%</span></span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }}></div>
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
              <span className="badge-num">99999</span>
            </div>
            <div className="badge-group">
              <span className="badge-icon icon-shield"></span>
              <span className="badge-num">99999</span>
            </div>
            <div className="badge-group">
              <span className="badge-icon icon-graphic13"></span>
              <span className="badge-num red">-9999</span>
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
          <div className="activity-row">
            <div className="activity-avatar">
              <Image src="/images/0/01.png" alt="" width={36} height={36} />
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
              <Image src="/images/0/02.png" alt="" width={36} height={36} />
            </div>
            <div className="activity-content">
              <div className="activity-line">
                <span className="activity-season">25, 겨울<span style={{ color: '#999' }}>시즌</span></span>
                <span className="activity-period">8주 <span style={{ color: '#999' }}>/ 8주</span></span>
                <span className="activity-role">심화(파트장)</span>
                <span className="activity-badge complete">정상 완료</span>
                <span className="activity-check approved">승인 완료</span>
              </div>
            </div>
          </div>

          <div className="activity-row">
            <div className="activity-avatar">
              <Image src="/images/0/03.png" alt="" width={36} height={36} />
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
