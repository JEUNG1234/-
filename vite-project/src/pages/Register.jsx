// src/pages/Register.jsx
import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate import 추가

import InputField from '../components/InputField';
import FormButton from '../components/FormButton';
import { Container } from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 1rem;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: #333;
`;

const schema = yup.object({
  name: yup.string().required('이름은 필수입니다.'),
  email: yup.string().email('이메일 형식이 아닙니다.').required('이메일은 필수입니다.'),
  password: yup.string().min(6, '비밀번호는 최소 6자 이상입니다.').required('비밀번호는 필수입니다.'),
});

const Register = () => {
  const navigate = useNavigate(); // 2. useNavigate 사용
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      // 동일 이메일 사용자가 있는지 먼저 확인 (선택 사항이지만 좋은 UX)
      const existingUsersRes = await axios.get(`http://localhost:3001/users?email=${data.email}`);
      if (existingUsersRes.data && existingUsersRes.data.length > 0) {
        toast.error('이미 사용 중인 이메일입니다.');
        return;
      }

      await axios.post('http://localhost:3001/users', data);
      toast.success('회원가입 성공! 로그인 페이지로 이동합니다.');
      reset();
      navigate('/login'); // 3. 회원가입 성공 후 로그인 페이지로 이동
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      // API 에러 메시지가 있다면 표시, 없다면 일반 메시지
      const errorMessage = error.response?.data?.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      toast.error(errorMessage);
    }
  };

  return (
    <PageWrapper>
      <PageInner>
        <Wrapper>
          <Container style={{ maxWidth: '400px' }}>
            <Title>회원가입</Title>
            <form onSubmit={handleSubmit(onSubmit)}>
              <InputField label="이름" name="name" register={register} error={errors.name} />
              <InputField label="이메일" name="email" register={register} error={errors.email} />
              <InputField
                label="비밀번호"
                name="password"
                type="password"
                register={register}
                error={errors.password}
              />
              <FormButton text="회원가입" />
            </form>
          </Container>
        </Wrapper>
      </PageInner>
    </PageWrapper>
  );
};

export default Register;