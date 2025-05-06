import React from 'react';
import styled from 'styled-components';
import { Container, Button, Input, Textarea } from '../components/CommonStyles';


const Header = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
`;

const ScheduleBox = styled.div`
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 2rem;
  background: #f8f9fa;
`;

const Dropdown = styled.select`
  padding: 0.6rem;
  margin-bottom: 1rem;
  width: 100%;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const AddButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    opacity: 0.9;
  }
`;

const MainPage = () => {
  return (
    <Container>
      <Header>시간표 관리</Header>
      <ScheduleBox>
        <Dropdown>
          <option>2025년 1학기</option>
          <option>2024년 겨울학기</option>
        </Dropdown>
        <AddButton>➕ 직접 추가</AddButton>
      </ScheduleBox>
    </Container>
  );
};

export default MainPage;
