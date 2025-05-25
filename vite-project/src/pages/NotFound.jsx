import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Mainpage = styled.div`
  background: linear-gradient(to bottom right, #ffffff, #7d7d7d);
  width: 100%;
  min-height: 100vh;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
`

const Title = styled.h1`
  font-size: 4rem;
  color: #2d3436;
  margin-bottom: 1rem;
`

const Message = styled.p`
  font-size: 1.5rem;
  color: #636e72;
  margin-bottom: 2rem;
`

const StyledLink = styled(Link)`
  background-color: white;
  padding: 0.75rem 1.5rem;
  color: #000000;
  font-weight: bold;
  border-radius: 10px;
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #e7e7e7;
    color: #000000;
  }
`

const NotFound = () => {
  return (
    <Mainpage>
      <Title>404 ERROR</Title>
      <Message>페이지를 찾을 수 없습니다</Message>
      <StyledLink to="/">홈으로 돌아가기</StyledLink>
    </Mainpage>
  )
}

export default NotFound
