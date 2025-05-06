import styled from 'styled-components';

export const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 3rem 1rem; // 패딩 확인
  background-color: #f2f4f7; // 배경색 확인

  display: flex; // flex 적용 확인
  justify-content: center; // 중앙 정렬 핵심
  align-items: flex-start; // 상단 정렬

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

export const PageInner = styled.div`
  width: 100%;
  display: flex; // 추가
  justify-content: center; // 추가
`;