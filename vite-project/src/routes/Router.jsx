
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BoardList from '../pages/BoardList';
import NotFound from '../pages/NotFound';
import BoardCreate from '../pages/BoardCreate';
import MainPage from '../pages/MainPage';
import BoardDetail from '../pages/BoardDetail';
import BoardEdit from '../pages/BoardEdit';
import Mypage from "../pages/Mypage";

const Router = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/main" element={<MainPage />} />
    <Route path="/mypage" element={<Mypage />} />
    <Route path="/board" element={<BoardList />} />
    <Route path="/board/new" element={<BoardCreate />} />
    <Route path="/board/:id" element={<BoardDetail />} />
    <Route path="/board/edit/:id" element={<BoardEdit />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default Router;
