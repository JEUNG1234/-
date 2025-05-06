import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PrimaryButton } from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout'; // 추가

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f2f2f2;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
  text-align: center;
  max-width: 600px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavButton = styled(PrimaryButton).attrs({ as: Link })`
  text-decoration: none;
  display: inline-block;
`;

const Home = () => {
  return (
    <PageWrapper> {/* 추가 */}
      <PageInner>   {/* 추가 */}
        <Wrapper>
          <Title>나만의 리액트 홈페이지</Title>
          <Description>
            게시판, 회원가입, 마이페이지 기능이 포함된 리액트 프로젝트입니다.
          </Description>
          <ButtonGroup>
            <NavButton to="/login">로그인</NavButton>
            <NavButton to="/register">회원가입</NavButton>
          </ButtonGroup>
        </Wrapper>
      </PageInner>  
    </PageWrapper> 
  );
};

export default Home;