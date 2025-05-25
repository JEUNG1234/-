import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 추가
import axios from 'axios';
import useUserStore from '../store/useUserStore';
import { toast } from 'react-toastify';
import { PrimaryButton } from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 1rem;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 이전 페이지 정보를 가져오기 위해 추가
  const { login } = useUserStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.warn('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true); // 로딩 시작
    try {
      // 백엔드의 /api/members/login 엔드포인트로 POST 요청
      const response = await axios.post('http://localhost:8888/api/members/login', {
        email: form.email,
        password: form.password,
      });

      // 백엔드 응답에서 토큰과 사용자 정보 추출
      const { token, userInfo } = response.data; // MemberDto.LoginResponse 구조에 맞춰서

      // Zustand 스토어에 사용자 정보 저장 (토큰은 실제 사용 시 localStorage 등에 저장)
      login(userInfo); // useUserStore의 login 액션은 사용자 객체를 받음
      // 토큰 저장 (예시: localStorage) - 실제 JWT 사용 시 토큰 만료 관리 등 필요
      if (token) {
        localStorage.setItem('jwtToken', token); // 더미 토큰 저장
      }

      toast.success('로그인 성공!');
      // 이전 페이지가 있으면 해당 페이지로, 없으면 홈으로 이동
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message); // 백엔드에서 전달하는 오류 메시지 사용
      } else if (err.response && err.response.status === 401) { // Unauthorized (비밀번호 불일치 등)
        toast.error('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else if (err.response && err.response.status === 404) { // Not Found (가입되지 않은 이메일)
        toast.error('가입되지 않은 이메일입니다.');
      }
      else {
        toast.error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <PageWrapper>
      <PageInner>
        <Wrapper>
          <LoginBox>
            <Title>로그인</Title>
            <Input
              type="email"
              name="email"
              placeholder="이메일"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleLogin()} // 엔터키로 로그인
              disabled={isLoading}
            />
            <PrimaryButton onClick={handleLogin} disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? '로그인 중...' : '로그인'}
            </PrimaryButton>
          </LoginBox>
        </Wrapper>
      </PageInner>
    </PageWrapper>
  );
};

export default Login;