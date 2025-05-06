// components/PageLayout.js
import styled from 'styled-components';

export const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 3rem 1rem;
  background-color: #f2f4f7;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

export const PageInner = styled.div`
  width: 100%;
  max-width: 900px;
`;
