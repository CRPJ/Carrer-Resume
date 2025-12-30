"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const Cluster41Content = () => {
  return (
    <div className="cluster4-content">
      {/* Section 1: CLUB CHALLENGE GROWTH */}
      <section className="cluster4-section1">
        {/* 좌측 상단 탭 (세로 정렬) */}
        <div className="top-tabs">
          <div className="tab active">
            <img src="/images/0/cluster%204/icon/icon%20-%20%EC%A0%84%EA%B5%AC.png" alt="전구" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Weekly Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </div>
          <Link href="/cluster-4-1" className="tab">
            <img src="/images/0/cluster%204/icon/icon%20-%20book.png" alt="book" className="tab-icon" />
            <div className="tab-badge">
              <span className="badge-text">Season Growth</span>
              <img src="/images/0/cluster%204/icon/icon%20-%20wallet.png" alt="wallet" className="badge-icon" />
            </div>
          </Link>
        </div>

        {/* 타이틀 */}
        <div className="section1-title-wrapper">
          <div className="title-inner">
            <h2 className="section1-title-shadow">CLUB CHALLENGE GROWTH</h2>
            <h2 className="section1-title">CLUB CHALLENGE GROWTH</h2>
          </div>
        </div>

        {/* 설명 텍스트 */}
        <div className="section1-description">
          <p>이 페이지에서는 주차별로(weekly), 시즌별로(season) 차곡차곡 성장한 클럽의 내역이 나옵니다.</p>
          <p>잠깐의 열정과 객기는 누구나 가질 수 있지만, 역경과 부침, 짜증나는 고난과 요동치는 감정을 이겨내며 꾸준하게 성장할 수 있는 사람은 생각보다 적습니다.</p>
          <p className="small-text">1주, 1개월, 1분기, 1반기, 1년.. 세상에서 평가하는 나의 신뢰성은 어떠한가요?</p>
          <p className="quote-text">
            There is no magic to achievement. It's really about hard work, choices and persistence.<br />
            무언가를 성취하기 위해 부릴 수 있는 마법은 없다. 필요한 것은 오직 노력, 선택 그리고 꾸준함일 뿐이다.<br />
            -Michelle Obama-
          </p>
        </div>
      </section>

      {/* Weekly Content Section */}
      <section className="cluster4-section-weekly">
        <div className="weekly-content">
          <h2 className="weekly-title">WEEKLY GROWTH</h2>
          <p className="weekly-description">주차별 성장 내역이 여기에 표시됩니다.</p>
        </div>
      </section>
    </div>
  );
};

export default Cluster41Content;
