// src/routes/Router.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';

// 기존 페이지 컴포넌트들
import Home from '../pages/Home'; // 지금은 사용하지 않지만, 필요하면 다시 활용 가능
import Login from '../pages/Login';
import Register from '../pages/Register';
import Mypage from '../pages/Mypage';
import NotFound from '../pages/NotFound';

// 게시판 관련 컴포넌트들
import BoardList from '../pages/BoardList';
import BoardCreate from '../pages/BoardCreate';
import BoardDetail from '../pages/BoardDetail';
import BoardEdit from '../pages/BoardEdit';

// 새로 추가된 투표 관련 컴포넌트들
import PollList from '../pages/poll/PollList';
import PollDetail from '../pages/poll/PollDetail';

const Router = () => {
  return (
    <Routes>
      {/* 메인 페이지를 PollList로 변경 */}
      <Route path="/" element={<PollList />} />
      {/* <Route path="/" element={<Home />} /> 기존 홈 라우트 주석 처리 또는 삭제 */}

      {/* 인증 관련 페이지 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mypage" element={<Mypage />} />

      {/* 게시판 관련 페이지 (기존 유지) */}
      <Route path="/board" element={<BoardList />} />
      <Route path="/board/new" element={<BoardCreate />} />
      <Route path="/board/:id" element={<BoardDetail />} />
      <Route path="/board/edit/:id" element={<BoardEdit />} />

      {/* 투표 관련 페이지 */}
      <Route path="/polls/:id" element={<PollDetail />} />
      {/* 나중에 투표 생성 페이지 추가 시: <Route path="/polls/new" element={<PollCreate />} /> */}


      {/* 일치하는 경로가 없을 경우 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;