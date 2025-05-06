import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

import InputField from '../components/InputField';
import FormButton from '../components/FormButton'; // 이건 따로 유지
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
      await axios.post('http://localhost:3001/users', data);
      toast.success('회원가입 성공!');
      reset();
    } catch (error) {
      console.error(error);
      toast.error('회원가입 실패');
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
