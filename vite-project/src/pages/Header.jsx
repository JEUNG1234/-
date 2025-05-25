import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderWrapper = styled.div`
  width: 100%;
  height: 4rem;
  background-color: #0f62fe;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Logo = styled(Link)`
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  text-decoration: none;

  &:hover {
    opacity: 0.9;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 15px;
`;

const Btn = styled(Link)`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: white;
  color: #0f62fe;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: background 0.3s ease, color 0.3s ease;

  &:hover {
    background: #f0f4ff;
    color: #0353e9;
  }
`;

export default function Header() {
  return (
    <HeaderWrapper>
      <Logo to="/">🏠 유저 관리</Logo>
      <Nav>
        <Btn to="/">홈</Btn>
        <Btn to="/UserList">유저 목록</Btn>
        <Btn to="/UserRegistration">유저 등록</Btn>
      </Nav>
    </HeaderWrapper>
  );
}
