import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

const Container = styled.div`
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  text-align: center;
`;

const Button = styled(Link)`
  display: inline-block;
  margin: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #0070f3;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    background-color: #0059c1;
  }
`;

const LogoutButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  background-color: #b82323;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Home = () => {
  const { user, logout } = useUserStore();

  return (
    <Container>
      {user ? (
        <>
          <h2>안녕하세요, <strong>{user.name}</strong>님!</h2>
          <p>오늘도 좋은 하루 되세요</p>
          <LogoutButton onClick={logout}>로그아웃</LogoutButton>
        </>
      ) : (
        <>
          <h2>환영합니다!</h2>
          <p>계정을 만들어 서비스를 시작해보세요</p>
          <Button to="/login">로그인</Button>
          <Button to="/register">회원가입</Button>
        </>
      )}
    </Container>
  );
};

export default Home;
