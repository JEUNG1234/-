// src/pages/MainDashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { PageWrapper, PageInner } from '../components/PageLayout';
import { Container } from '../components/CommonStyles';

const Item = styled.li`
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

  p {
    font-size: 0.95rem;
    color: ${props => props.theme.colors.textSecondary || '#555'};
    margin: 0.5rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 3.2em;
    line-height: 1.6em;
  }

  small {
    display: block;
    margin-top: 0.5rem;
    color: ${props => props.theme.colors.textSecondary || '#777'};
    font-size: 0.85rem;
  }
`;

const HotItem = styled(Item)`
  border-left: 5px solid ${props => props.theme.colors.primary || '#ffc107'};
  background-color: ${props => props.theme.colors.surfaceLight || '#fffef5'};
`;

const MainTitle = styled.h2`
  font-size: 2.2rem;
  color: ${props => props.theme.colors.text || '#222'};
  text-align: center;
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  color: ${props => props.theme.colors.text || '#333'};
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
`;

const NoItemsMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary || '#777'};
  text-align: center;
  padding: 1rem 0;
  font-style: italic;
`;

const MoreLinkWrapper = styled.div`
  text-align: right;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const DashboardSection = styled.section`
  margin-bottom: 3rem;
  background-color: ${props => props.theme.colors.surface || '#fff'};
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.large || '8px'};
  box-shadow: ${props => props.theme.shadows.medium || '0 4px 10px rgba(0,0,0,0.08)'};
`;

const MainDashboardPage = () => {
  const [hotSurveys, setHotSurveys] = useState([]);
  const [hotPolls, setHotPolls] = useState([]);
  const [isLoadingSurveys, setIsLoadingSurveys] = useState(true);
  const [isLoadingPolls, setIsLoadingPolls] = useState(true);

  const fetchHotSurveys = useCallback(async () => {
    setIsLoadingSurveys(true);
    try {
      const surveyRes = await axios.get('http://localhost:8888/api/surveys?hot=true');
      setHotSurveys(surveyRes.data.content || []);
    } catch (error) {
      console.error("Failed to fetch hot surveys:", error);
      toast.error("HOT 설문 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingSurveys(false);
    }
  }, []);

  const fetchHotPolls = useCallback(async () => {
    setIsLoadingPolls(true);
    try {
      const pollRes = await axios.get('http://localhost:8888/api/polls?hot=true');
      setHotPolls(pollRes.data.content || []);
    } catch (error) {
      console.error("Failed to fetch hot polls:", error);
      toast.error("HOT 투표 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingPolls(false);
    }
  }, []);

  useEffect(() => {
    fetchHotSurveys();
    fetchHotPolls();
  }, [fetchHotSurveys, fetchHotPolls]);

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <MainTitle>주요 소식</MainTitle>

          <DashboardSection>
            <SectionTitle>🔥 지금 HOT한 설문!</SectionTitle>
            {isLoadingSurveys ? <p>HOT 설문 로딩 중...</p> :
              hotSurveys.length > 0 ? (
              <>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {hotSurveys.map((survey) => (
                    <HotItem key={`hot-survey-${survey.id}`}>
                      <Link to={`/surveys/${survey.id}`}>{survey.title}</Link>
                      {survey.description && <p>{survey.description}</p>}
                      <small>
                        작성자: {survey.authorName} · 응답자: {survey.totalRespondents || 0}명 · 생성일: {format(new Date(survey.createdAt), 'yyyy-MM-dd')}
                      </small>
                    </HotItem>
                  ))}
                </ul>
                <MoreLinkWrapper>
                  <Link to="/surveys">더 많은 설문 보기 →</Link>
                </MoreLinkWrapper>
              </>
            ) : (
              <NoItemsMessage>진행중인 HOT 설문이 없습니다.</NoItemsMessage>
            )}
          </DashboardSection>

          <DashboardSection>
            <SectionTitle>🔥 지금 HOT한 투표!</SectionTitle>
            {isLoadingPolls ? <p>HOT 투표 로딩 중...</p> :
              hotPolls.length > 0 ? (
              <>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {hotPolls.map((poll) => (
                    <HotItem key={`hot-poll-${poll.id}`}>
                      <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
                      <small>
                        작성자: {poll.authorName} · 총 {poll.totalVotes || 0}표 · 생성일: {format(new Date(poll.createdAt), 'yyyy-MM-dd')}
                      </small>
                    </HotItem>
                  ))}
                </ul>
                <MoreLinkWrapper>
                  <Link to="/polls">더 많은 투표 보기 →</Link>
                </MoreLinkWrapper>
              </>
            ) : (
              <NoItemsMessage>진행중인 HOT 투표가 없습니다.</NoItemsMessage>
            )}
          </DashboardSection>

        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default MainDashboardPage;