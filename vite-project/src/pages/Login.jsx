import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../store/useUserStore';
import { toast } from 'react-toastify';
import { PrimaryButton } from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout'; // 추가

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
  const { login } = useUserStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const res = await axios.get('http://localhost:8888/api/members');
      const found = res.data.find(
        (u) => u.email === form.email && u.password === form.password
      );

      if (found) {
        login(found);
        toast.success('로그인 성공!');
        navigate('/');
      } else {
        toast.error('이메일 또는 비밀번호가 틀렸습니다.');
      }
    } catch (err) {
      toast.error('로그인 중 오류 발생');
      console.error(err);
    }
  };

  return (
    <PageWrapper>  {/* 추가 */}
      <PageInner>    {/* 추가 */}
        <Wrapper>
          <LoginBox>
            <Title>로그인</Title>
            <Input
              type="email"
              name="email"
              placeholder="이메일"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
            />
            <PrimaryButton onClick={handleLogin}>로그인</PrimaryButton>
          </LoginBox>
        </Wrapper>
      </PageInner>  
    </PageWrapper>  
  );
};

export default Login;