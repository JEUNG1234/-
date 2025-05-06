import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

const HeaderContainer = styled.header`
  background: #222;
  padding: 1rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavItem = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
`;

const Header = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Nav>
        <NavItem to="/">홈</NavItem>
        <NavItem to="/board">게시판</NavItem>
        {user && <NavItem to="/board/new">글쓰기</NavItem>}
        {user && <NavItem to="/mypage">마이페이지</NavItem>}
      </Nav>

      <UserInfo>
        {user ? (
          <>
            <span>{user.name}님</span>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </>
        ) : (
          <>
            <NavItem to="/login">로그인</NavItem>
            <NavItem to="/register">회원가입</NavItem>
          </>
        )}
      </UserInfo>
    </HeaderContainer>
  );
};

export default Header;
