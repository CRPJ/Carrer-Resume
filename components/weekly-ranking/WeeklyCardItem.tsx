"use client";

import Image from "next/image";
import Tilt from "react-parallax-tilt";
import type { WeeklyCardData } from "@/constants/dummyData/weekly-card-dummy";

const truncate = (text: string | null | undefined, maxLen: number): string => {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '..' : text;
};

interface Props {
  data: WeeklyCardData;
}

export default function WeeklyCardItem({ data }: Props) {
  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      transitionSpeed={400}
      className="col-12 col-md-6 col-xl-4"
    >
      <div className="badge__single weekly-card">
        <div className="weekly-card__header">
          <div className="weekly-card__title">
            <h4 className="weekly-card__season">
              {data.seasonName}, {data.weekNumber} 주차
            </h4>
            <p className="weekly-card__date">
              {data.dateRange.start} - {data.dateRange.end}
            </p>
          </div>
          <div className="weekly-card__status-panel">
            <div className="weekly-card__status-row">
              <span className="weekly-card__status-label">리그 결과</span>
              <span className="weekly-card__status-value">{data.leagueResultStatus}</span>
            </div>
            <div className="weekly-card__status-row">
              <span className="weekly-card__status-label">리그 기록</span>
              <span className="weekly-card__status-value">{data.leagueRecordStatus}</span>
            </div>
          </div>
        </div>

        <div className="weekly-card__thumb">
          {data.imageUrl ? (
            <Image
              src={data.imageUrl}
              alt={`주차 ${data.weekNumber} 이미지`}
              width={280}
              height={180}
              className="weekly-card__thumb-image"
            />
          ) : (
            <div className="weekly-card__thumb-placeholder">
              <span>주차 이미지</span>
            </div>
          )}
        </div>

        <div className="resume-stats weekly-card__rates">
          <div className="stat-item">
            <div className="stat-row">
              <span className="stat-label"><span className="stat-dot">·</span> 성장 성공율</span>
              <div className="weekly-card__stat-meter">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${data.growthSuccessRate}%` }} />
                </div>
                <span className="stat-value">{data.growthSuccessRate}<span className="stat-unit">%</span></span>
              </div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-row">
              <span className="stat-label"><span className="stat-dot">·</span> 성장 도전율</span>
              <div className="weekly-card__stat-meter">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${data.growthChallengeRate}%` }} />
                </div>
                <span className="stat-value">{data.growthChallengeRate}<span className="stat-unit">%</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="resume-skills weekly-card__skills">
          <div className="skill-card">
            <Image src="/images/0/cluster4/icon/icon - cluv.png" alt="" width={34} height={34} className="skill-icon" />
            <div className="skill-num-row">
              <span className="skill-num">{data.totalCrews}</span>
              <span className="skill-unit">명</span>
            </div>
            <span className="skill-label">전체 크루</span>
          </div>

          <div className="skill-card">
            <Image src="/images/0/cluster4/icon/icon - 성장 (진행 중).png" alt="" width={34} height={34} className="skill-icon" />
            <div className="skill-num-row">
              <span className="skill-num">{data.growthChallenge}</span>
              <span className="skill-unit">명</span>
            </div>
            <span className="skill-label">성장 도전</span>
          </div>

          <div className="skill-card">
            <Image src="/images/0/cluster4/icon/icon - 성장(성공).png" alt="" width={34} height={34} className="skill-icon" />
            <div className="skill-num-row">
              <span className="skill-num">{data.growthSuccess}</span>
              <span className="skill-unit">명</span>
            </div>
            <span className="skill-label">성장 성공</span>
          </div>

          <div className="skill-card">
            <Image src="/images/0/cluster4/icon/icon - 성장(실패).png" alt="" width={34} height={34} className="skill-icon" />
            <div className="skill-num-row">
              <span className="skill-num">{data.growthFail}</span>
              <span className="skill-unit">명</span>
            </div>
            <span className="skill-label">성장 실패</span>
          </div>

          <div className="skill-card">
            <Image src="/images/0/cluster4/icon/icon - 휴식(개인).png" alt="" width={34} height={34} className="skill-icon" />
            <div className="skill-num-row">
              <span className="skill-num">{data.personalRest}</span>
              <span className="skill-unit">명</span>
            </div>
            <span className="skill-label">개인 휴식</span>
          </div>

          <div className="weekly-card__winner">
            <span className="weekly-card__winner-tag">우승</span>
            {data.winningTeamImage ? (
              <Image src={data.winningTeamImage} alt="우승 팀" width={80} height={80} className="weekly-card__winner-image" />
            ) : (
              <div className="weekly-card__winner-placeholder" />
            )}
          </div>
        </div>

        <div className="weekly-card__top3">
          {data.top3.map((crew) => (
            <div key={crew.rank} className={`weekly-card__crew weekly-card__crew--rank${crew.rank}`}>
              <div className="weekly-card__crew-icon">
                <span className="weekly-card__crew-rank">{crew.rank}</span>
              </div>
              <div className="weekly-card__crew-info">
                <span className="weekly-card__crew-name">{truncate(crew.name, 4)}</span>
                <span className="weekly-card__crew-sep">|</span>
                <span className="weekly-card__crew-team">{truncate(crew.team, 5)}</span>
                <span className="weekly-card__crew-sep">|</span>
                <span className="weekly-card__crew-part">{truncate(crew.part, 5)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Tilt>
  );
}
