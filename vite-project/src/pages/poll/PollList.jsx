// src/pages/poll/PollList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton } from '../../components/CommonStyles';
import useUserStore from '../../store/useUserStore';

const PollItem = styled.li`
  background: ${props => props.theme.colors.surface || '#fff'};
  border: 1px solid ${props => props.theme.colors.borderLight || '#eee'};
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: ${props => props.theme.borderRadius.large || '8px'};
  box-shadow: ${props => props.theme.shadows.small || '0 2px 4px rgba(0, 0, 0, 0.05)'};
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: ${props => props.theme.shadows.medium || '0 4px 8px rgba(0, 0, 0, 0.1)'};
  }

  a {
    font-size: 1.2rem;
    color: ${props => props.theme.colors.primary || '#337ab7'};
    font-weight: bold;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  small {
    display: block;
    margin-top: 0.5rem;
    color: ${props => props.theme.colors.textSecondary || '#777'};
    font-size: 0.85rem;
  }
`;

const HeaderGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const MainTitle = styled.h2`
  font-size: 2rem;
  color: ${props => props.theme.colors.text || '#222'};
  text-align: center;
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.6rem;
  color: ${props => props.theme.colors.text || '#333'};
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${props => props.theme.colors.borderLight || '#eee'};
`;

const HotPollItem = styled(PollItem)`
  border-left: 5px solid ${props => props.theme.colors.primary || '#ffc107'};
  background-color: ${props => props.theme.colors.surfaceLight || '#fffef5'};
`;

const NoPollsMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary || '#777'};
  text-align: center;
  padding: 2rem 0;
  font-style: italic;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 0.5rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid ${props => props.theme.colors.border || '#ccc'};
    background-color: ${props => props.theme.colors.surface || '#fff'};
    color: ${props => props.theme.colors.primary || 'royalblue'};
    cursor: pointer;
    border-radius: ${props => props.theme.borderRadius.small || '4px'};

    &:disabled {
      color: #aaa;
      cursor: not-allowed;
      background-color: #f0f0f0;
    }
    &:hover:not(:disabled) {
      background-color: #e9ecef;
    }
  }
  span {
    padding: 0.5rem;
    font-weight: bold;
  }
`;

const PollList = () => {
  const { user } = useUserStore();
  const [hotPollsPage, setHotPollsPage] = useState({ content: [] });
  const [allPollsPage, setAllPollsPage] = useState({
    content: [],
    currentPage: 0,
    totalPage: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [currentAllPollsPageNumber, setCurrentAllPollsPageNumber] = useState(0);
  const [isLoadingHot, setIsLoadingHot] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);

  const fetchHotPolls = useCallback(async () => {
    setIsLoadingHot(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/polls?hot=true`);
      setHotPollsPage(res.data); // 백엔드는 PageResponse<PollDto.Response> 반환
    } catch (error) {
      console.error("Failed to fetch hot polls:", error);
      toast.error("HOT 투표 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingHot(false);
    }
  }, []);

  const fetchAllPolls = useCallback(async (page) => {
    setIsLoadingAll(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/polls?page=${page}&size=5&sort=createdAt,desc`);
      setAllPollsPage(res.data);
    } catch (error) {
      console.error("Failed to fetch all polls:", error);
      toast.error("전체 투표 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    fetchHotPolls();
  }, [fetchHotPolls]);

  useEffect(() => {
    fetchAllPolls(currentAllPollsPageNumber);
  }, [fetchAllPolls, currentAllPollsPageNumber]);


  const handleAllPollsPageChange = (newPageNumber) => {
    setCurrentAllPollsPageNumber(newPageNumber);
  };

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <MainTitle>투표 광장</MainTitle>

          {!isLoadingHot && hotPollsPage.content && hotPollsPage.content.length > 0 && (
            <section>
              <HeaderGroup>
                <SectionTitle>🔥 지금 HOT한 투표!</SectionTitle>
              </HeaderGroup>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {hotPollsPage.content.map((poll) => (
                  <HotPollItem key={`hot-${poll.id}`}>
                    <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
                    <small>
                      작성자: {poll.authorName} · 총 {poll.totalVotes || 0}표 · 생성일: {format(new Date(poll.createdAt), 'yyyy-MM-dd')}
                    </small>
                  </HotPollItem>
                ))}
              </ul>
            </section>
          )}

          <section>
            <HeaderGroup style={{ marginTop: (hotPollsPage.content && hotPollsPage.content.length > 0) ? '3rem' : '0' }}>
              <SectionTitle>전체 투표 목록</SectionTitle>
              {user && (
                <PrimaryButton as={Link} to="/polls/new">
                  새 투표 만들기
                </PrimaryButton>
              )}
            </HeaderGroup>

            {isLoadingAll ? <p>투표 목록을 불러오는 중...</p> :
              allPollsPage.content && allPollsPage.content.length > 0 ? (
              <>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {allPollsPage.content.map((poll) => (
                    <PollItem key={poll.id}>
                      <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
                      <small>
                        작성자: {poll.authorName} · 총 {poll.totalVotes || 0}표 · 생성일: {format(new Date(poll.createdAt), 'yyyy-MM-dd HH:mm')}
                      </small>
                    </PollItem>
                  ))}
                </ul>
                {allPollsPage.totalPage > 1 && (
                  <PaginationContainer>
                    <button
                      onClick={() => handleAllPollsPageChange(currentAllPollsPageNumber - 1)}
                      disabled={!allPollsPage.hasPrevious}
                    >
                      이전
                    </button>
                    <span>{allPollsPage.currentPage + 1} / {allPollsPage.totalPage}</span>
                    <button
                      onClick={() => handleAllPollsPageChange(currentAllPollsPageNumber + 1)}
                      disabled={!allPollsPage.hasNext}
                    >
                      다음
                    </button>
                  </PaginationContainer>
                )}
              </>
            ) : (
              <NoPollsMessage>진행중인 투표가 없습니다.</NoPollsMessage>
            )}
          </section>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollList;