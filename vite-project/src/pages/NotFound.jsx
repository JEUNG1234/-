import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Container, Button, Input, Textarea } from '../components/CommonStyles';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #fefefe;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: #ff4d4f;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 2rem;
`;

const HomeLink = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: #0070f3;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    background-color: #005ac1;
  }
`;

const NotFound = () => {
  return (
    <Wrapper>
      <Title>404</Title>
      <Message>페이지를 찾을 수 없습니다.</Message>
      <HomeLink to="/">홈으로 돌아가기</HomeLink>
    </Wrapper>
  );
};

export default NotFound;
