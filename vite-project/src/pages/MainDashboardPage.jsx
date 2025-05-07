// src/pages/MainDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { PageWrapper, PageInner } from '../components/PageLayout';
import { Container, PrimaryButton } from '../components/CommonStyles'; // PrimaryButton은 "더보기" 등에 사용 가능


// --- Styled Components (이전과 유사하게 사용 또는 필요시 조정) ---
const Item = styled.li`
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
    color: #337ab7;
    font-weight: bold;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  p { // 설문 설명용
    font-size: 0.95rem;
    color: #555;
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
    color: #777;
    font-size: 0.85rem;
  }
`;

// HotItem 스타일은 동일하게 사용
const HotItem = styled(Item)`
  border-left: 5px solid ${props => props.theme.colors.primary || '#ffc107'};
  background-color: #fffef5;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
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
  /* border-bottom: 2px solid #eee; */ // 대시보드에서는 하단 선 제거 또는 다르게 표현 가능
  /* padding-bottom: 0.75rem; */
`;

const NoItemsMessage = styled.p`
  color: #777;
  text-align: center;
  padding: 1rem 0;
  font-style: italic;
`;

const MoreLinkWrapper = styled.div`
  text-align: right;
  margin-top: 0.5rem;
  margin-bottom: 2rem; /* 섹션 간 간격 */
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
  // const { user } = useUserStore(); // 새 글 작성 버튼이 없으므로 user 필요 없을 수 있음

  const NUMBER_OF_HOT_ITEMS = 3; // 메인에 보여줄 HOT 항목 개수

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 설문 데이터 가져오기
        const surveyRes = await axios.get('http://localhost:3001/surveys');
        const surveysData = surveyRes.data;
        const sortedByRespondents = [...surveysData].sort((a, b) => (b.totalRespondents || 0) - (a.totalRespondents || 0));
        setHotSurveys(sortedByRespondents.slice(0, NUMBER_OF_HOT_ITEMS));

        // 투표 데이터 가져오기
        const pollRes = await axios.get('http://localhost:3001/polls');
        const pollsData = pollRes.data;
        const sortedByVotes = [...pollsData].sort((a, b) => b.totalVotes - a.totalVotes);
        setHotPolls(sortedByVotes.slice(0, NUMBER_OF_HOT_ITEMS));

      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("HOT 데이터를 불러오는데 실패했습니다.");
      }
    };
    fetchData();
  }, []);

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <MainTitle>주요 소식</MainTitle>

          {/* --- HOT 설문 섹션 --- */}
          <DashboardSection>
            <SectionTitle>🔥 지금 HOT한 설문!</SectionTitle>
            {hotSurveys.length > 0 ? (
              <>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {hotSurveys.map((survey) => (
                    <HotItem key={`hot-survey-${survey.id}`}>
                      <Link to={`/surveys/${survey.id}`}>{survey.title}</Link>
                      {survey.description && <p>{survey.description}</p>}
                      <small>
                        작성자: {survey.author} · 응답자: {survey.totalRespondents || 0}명 · 생성일: {format(new Date(survey.createdAt), 'yyyy-MM-dd')}
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

          {/* --- HOT 투표 섹션 --- */}
          <DashboardSection>
            <SectionTitle>🔥 지금 HOT한 투표!</SectionTitle>
            {hotPolls.length > 0 ? (
              <>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {hotPolls.map((poll) => (
                    <HotItem key={`hot-poll-${poll.id}`}>
                      <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
                      <small>
                        작성자: {poll.author} · 총 {poll.totalVotes}표
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