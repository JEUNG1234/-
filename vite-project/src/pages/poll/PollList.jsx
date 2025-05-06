// src/pages/poll/PollList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton } from '../../components/CommonStyles'; // PrimaryButton은 나중에 "투표 만들기"에 사용 가능

const PollItem = styled.li`
  background: #fff;
  border: 1px solid #eee;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  a {
    font-size: 1.2rem;
    color: #337ab7; /* Bootstrap primary color for links */
    font-weight: bold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  small {
    display: block;
    margin-top: 0.5rem;
    color: #777;
  }
`;

const HeaderGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #333;
`;

const PollList = () => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get('http://localhost:3001/polls');
        setPolls(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); // 최신순 정렬
      } catch (error) {
        console.error("Failed to fetch polls:", error);
        // 사용자에게 오류 메시지를 보여줄 수 있습니다 (예: toast)
      }
    };
    fetchPolls();
  }, []);

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <HeaderGroup>
            <Title>진행중인 투표</Title>
            {/* <PrimaryButton as={Link} to="/polls/new">새 투표 만들기</PrimaryButton> */} {/* 나중에 추가 가능 */}
          </HeaderGroup>

          {polls.length === 0 ? (
            <p>진행중인 투표가 없습니다.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {polls.map((poll) => (
                <PollItem key={poll.id}>
                  <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
                  <small>
                    작성자: {poll.author} · 총 {poll.totalVotes}표
                  </small>
                </PollItem>
              ))}
            </ul>
          )}
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollList;