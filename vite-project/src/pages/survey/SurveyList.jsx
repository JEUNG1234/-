// src/pages/survey/SurveyList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton } from '../../components/CommonStyles';
import useUserStore from '../../store/useUserStore';
import { format } from 'date-fns'; // 날짜 포맷을 위해 import

// --- Styled Components (PollList.jsx와 유사하게 사용 가능) ---
const SurveyItem = styled.li`
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

  p { // 설문 설명
    font-size: 0.95rem;
    color: #555;
    margin: 0.5rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 3.2em; // 약 2줄까지 보이도록 (line-height에 따라 조절)
    line-height: 1.6em;
  }

  small {
    display: block;
    margin-top: 0.5rem;
    color: #777;
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
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
`;

const HotSurveyItem = styled(SurveyItem)` // HOT 설문 강조 스타일
  border-left: 5px solid ${props => props.theme.colors.primary || '#ffc107'};
  background-color: #fffef5; // 약간 다른 배경색

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NoSurveysMessage = styled.p`
  color: #777;
  text-align: center;
  padding: 2rem 0;
`;
// --- 여기까지 Styled Components ---


const SurveyList = () => {
  const [allSurveys, setAllSurveys] = useState([]);
  const [hotSurveys, setHotSurveys] = useState([]);
  const { user } = useUserStore();

  const NUMBER_OF_HOT_SURVEYS = 3; // HOT 설문으로 보여줄 개수

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await axios.get('http://localhost:8888/api/surveys'); // 엔드포인트 변경
        const surveysData = res.data;

        // 전체 설문 목록 (최신순 정렬)
        const sortedAllSurveys = [...surveysData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllSurveys(sortedAllSurveys);

        // HOT 설문 선정 (totalRespondents 많은 순, 상위 N개)
        const sortedByRespondents = [...surveysData].sort((a, b) => (b.totalRespondents || 0) - (a.totalRespondents || 0));
        setHotSurveys(sortedByRespondents.slice(0, NUMBER_OF_HOT_SURVEYS));

      } catch (error) {
        console.error("Failed to fetch surveys:", error);
        toast.error("설문 목록을 불러오는데 실패했습니다.");
      }
    };
    fetchSurveys();
  }, []);

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <MainTitle>설문 광장</MainTitle>

          {hotSurveys.length > 0 && (
            <section>
              <HeaderGroup>
                <SectionTitle>🔥 지금 HOT한 설문!</SectionTitle>
              </HeaderGroup>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {hotSurveys.map((survey) => (
                  <HotSurveyItem key={`hot-${survey.id}`}>
                    <Link to={`/surveys/${survey.id}`}>{survey.title}</Link>
                    {survey.description && <p>{survey.description}</p>}
                    <small>
                      작성자: {survey.author} · 응답자: {survey.totalRespondents || 0}명 · 생성일: {format(new Date(survey.createdAt), 'yyyy-MM-dd')}
                    </small>
                  </HotSurveyItem>
                ))}
              </ul>
            </section>
          )}

          <section>
            <HeaderGroup style={{ marginTop: hotSurveys.length > 0 ? '3rem' : '0' }}>
              <SectionTitle>전체 설문 목록</SectionTitle>
              {user && (
                <PrimaryButton as={Link} to="/surveys/new"> {/* 링크 경로 수정 */}
                  새 설문 만들기
                </PrimaryButton>
              )}
            </HeaderGroup>

            {allSurveys.length === 0 && hotSurveys.length === 0 ? (
              <NoSurveysMessage>진행중인 설문이 없습니다. 첫 번째 설문을 만들어보세요!</NoSurveysMessage>
            ) : allSurveys.length === 0 && hotSurveys.length > 0 ? (
              <NoSurveysMessage>더 많은 설문을 기다리고 있습니다!</NoSurveysMessage>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {allSurveys.map((survey) => (
                  <SurveyItem key={survey.id}>
                    <Link to={`/surveys/${survey.id}`}>{survey.title}</Link>
                    {survey.description && <p>{survey.description}</p>}
                    <small>
                      작성자: {survey.author} · 응답자: {survey.totalRespondents || 0}명 · 생성일: {format(new Date(survey.createdAt), 'yyyy-MM-dd')}
                    </small>
                  </SurveyItem>
                ))}
              </ul>
            )}
          </section>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyList;