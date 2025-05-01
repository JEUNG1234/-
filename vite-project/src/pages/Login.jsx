import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import InputField from '../components/InputField';
import FormButton from '../components/FormButton';
import useUserStore from '../store/useUserStore';

const Container = styled.div`
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Login = () => {
  const { register, handleSubmit, reset } = useForm();
  const login = useUserStore((state) => state.login);

  const onSubmit = async (data) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/users?email=${data.email}&password=${data.password}`
      );

      if (res.data.length > 0) {
        login(res.data[0]); // Zustand에 저장
        toast.success(`${res.data[0].name}님 환영합니다!`);
        reset();
      } else {
        toast.error('이메일 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      toast.error('로그인 요청 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <Container>
      <Title>로그인</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField label="이메일" name="email" register={register} />
        <InputField label="비밀번호" name="password" type="password" register={register} />
        <FormButton text="로그인" />
      </form>
    </Container>
  );
};

export default Login;
