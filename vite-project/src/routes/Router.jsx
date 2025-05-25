// src/routes/Router.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';

// 페이지 컴포넌트들
import Login from '../pages/Login';
import Register from '../pages/Register.jsx';
import Mypage from '../pages/Mypage';
import NotFound from '../pages/NotFound';

// 게시판 관련 컴포넌트들
import BoardList from '../pages/BoardList';
import BoardCreate from '../pages/BoardCreate';
import BoardDetail from '../pages/BoardDetail';
import BoardEdit from '../pages/BoardEdit';

// Poll (단일 질문 투표) 관련 컴포넌트들
import PollList from '../pages/poll/PollList';
import PollDetail from '../pages/poll/PollDetail';
import PollCreate from '../pages/poll/PollCreate';
import PollEdit from '../pages/poll/PollEdit';

// Survey (다중 질문 설문) 관련 컴포넌트
import SurveyList from '../pages/survey/SurveyList';
import SurveyCreate from '../pages/survey/SurveyCreate';
import SurveyDetail from '../pages/survey/SurveyDetail';
import SurveyEdit from '../pages/survey/SurveyEdit';     // 임포트 주석 해제 또는 추가
import SurveyResult from '../pages/survey/SurveyResult'; // 임포트 주석 해제 또는 추가

// 메인 대시보드 페이지 (HOT 항목만 표시)
import MainDashboardPage from '../pages/MainDashboardPage';


const Router = () => {
  return (
    <Routes>
      {/* 홈 페이지는 HOT 항목만 보여주는 MainDashboardPage */}
      <Route path="/" element={<MainDashboardPage />} />

      {/* 전체 설문 목록 페이지 */}
      <Route path="/surveys" element={<SurveyList />} />
      {/* 전체 투표 목록 페이지 */}
      <Route path="/polls" element={<PollList />} />

      {/* 인증 관련 라우트 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mypage" element={<Mypage />} />

      {/* 게시판 관련 라우트 */}
      <Route path="/board" element={<BoardList />} />
      <Route path="/board/new" element={<BoardCreate />} />
      <Route path="/board/:id" element={<BoardDetail />} />
      <Route path="/board/edit/:id" element={<BoardEdit />} />

      {/* 개별 Poll 생성/상세/수정 라우트 */}
      <Route path="/polls/new" element={<PollCreate />} />
      <Route path="/polls/:id" element={<PollDetail />} />
      <Route path="/polls/edit/:id" element={<PollEdit />} />

      {/* 개별 Survey 생성/상세 라우트 (+ 필요시 수정/결과 라우트) */}
      <Route path="/surveys/new" element={<SurveyCreate />} />
      <Route path="/surveys/:id" element={<SurveyDetail />} />
      <Route path="/surveys/:id/edit" element={<SurveyEdit />} />     {/* 라우트 주석 해제 */}
      <Route path="/surveys/:id/results" element={<SurveyResult />} /> {/* 라우트 주석 해제 */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;