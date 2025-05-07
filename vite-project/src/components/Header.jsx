// src/components/Header.jsx
import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { toast } from 'react-toastify';

// ... (기존 styled-components 정의는 그대로 유지) ...
const HeaderContainer = styled.header`
  background-color: ${props => props.theme.colors.headerBackground || '#222'};
  padding: 1rem 2rem;
  color: ${props => props.theme.colors.textLight || 'white'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.2rem; /* 링크 간 간격 유지 또는 조정 */
`;

const NavItem = styled(Link)`
  color: ${props => props.theme.colors.textLight || 'white'};
  text-decoration: none;
  font-weight: bold;
  font-size: ${props => props.theme.fonts.sizes.medium || '1rem'};
  padding: 0.5rem 0;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${props => props.theme.colors.primary || 'royalblue'};
    transition: width 0.3s ease-in-out;
  }

  &:hover:after,
  &.active:after { /* 'active' 클래스가 있다면 활성화 스타일 적용 (NavLink 사용 시 유용) */
    width: 100%;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
 font-weight: bold;
`;

const LogoutButton = styled.button`
  background: ${props => props.theme.colors.danger || '#f44336'};
  color: ${props => props.theme.colors.textLight || 'white'};
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: ${props => props.theme.borderRadius.small || '4px'};
  cursor: pointer;
  font-weight: bold;
  font-size: ${props => props.theme.fonts.sizes.small || '0.875rem'};
  transition: background-color 0.2s ease;

  &:hover {
    background: #d32f2f;
  }
`;

const AuthLink = styled(NavItem)`
    font-size: ${props => props.theme.fonts.sizes.small || '0.875rem'};
    padding: 0.5rem 0.8rem;
    border: 1px solid transparent;
    border-radius: ${props => props.theme.borderRadius.small || '4px'};

    &:hover {
        background-color: rgba(255,255,255,0.1);
        text-decoration: none;
    }
    &:hover:after {
        width: 0;
    }
`;
// --- (여기까지 기존 스타일 복사 또는 확인) ---

const Header = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.info("로그아웃 되었습니다.");
  };

  return (
    <HeaderContainer>
      <Nav>
        <NavItem to="/">홈</NavItem> {/* MainDashboardPage (HOT 항목) */}
        <NavItem to="/surveys">설문</NavItem> {/* 전체 설문 목록 (SurveyList) */}
        <NavItem to="/polls">투표</NavItem>   {/* 전체 투표 목록 (PollList) */}
        <NavItem to="/board">게시판</NavItem>
        {/* "새 설문/투표 만들기"는 필요에 따라 분리하거나 드롭다운 등으로 구성 가능 */}
        {user && <NavItem to="/surveys/new">새 설문</NavItem>}
        {user && <NavItem to="/polls/new">새 투표</NavItem>}
        {user && <NavItem to="/mypage">마이페이지</NavItem>}
      </Nav>
      <UserInfo>
        {user ? (
          <>
            <UserName>{user.name}님</UserName>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </>
        ) : (
          <>
            <AuthLink to="/login">로그인</AuthLink>
            <AuthLink to="/register">회원가입</AuthLink>
          </>
        )}
      </UserInfo>
    </HeaderContainer>
  );
};

export default Header;