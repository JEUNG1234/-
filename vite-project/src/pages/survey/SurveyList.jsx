// src/pages/survey/SurveyList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton } from '../../components/CommonStyles';
import useUserStore from '../../store/useUserStore';
import { format } from 'date-fns';

const SurveyItem = styled.li`
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

const HotSurveyItem = styled(SurveyItem)`
  border-left: 5px solid ${props => props.theme.colors.primary || '#ffc107'};
  background-color: ${props => props.theme.colors.surfaceLight || '#fffef5'};
`;

const NoSurveysMessage = styled.p`
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


const SurveyList = () => {
  const { user } = useUserStore();
  const [hotSurveysPage, setHotSurveysPage] = useState({ content: [] });
  const [allSurveysPage, setAllSurveysPage] = useState({
    content: [],
    currentPage: 0,
    totalPage: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [currentAllSurveysPageNumber, setCurrentAllSurveysPageNumber] = useState(0);
  const [isLoadingHot, setIsLoadingHot] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);

  const fetchHotSurveys = useCallback(async () => {
    setIsLoadingHot(true);
    try {
      const res = await axios.get('http://localhost:8888/api/surveys?hot=true');
      setHotSurveysPage(res.data);
    } catch (error) {
      console.error("Failed to fetch hot surveys:", error);
      toast.error("HOT 설문 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingHot(false);
    }
  }, []);

  const fetchAllSurveys = useCallback(async (page) => {
    setIsLoadingAll(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/surveys?page=${page}&size=5&sort=createdAt,desc`);
      setAllSurveysPage(res.data);
    } catch (error) {
      console.error("Failed to fetch all surveys:", error);
      toast.error("전체 설문 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    fetchHotSurveys();
  }, [fetchHotSurveys]);

  useEffect(() => {
    fetchAllSurveys(currentAllSurveysPageNumber);
  }, [fetchAllSurveys, currentAllSurveysPageNumber]);

  const handleAllSurveysPageChange = (newPageNumber) => {
    setCurrentAllSurveysPageNumber(newPageNumber);
  };

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <MainTitle>설문 광장</MainTitle>

          {!isLoadingHot && hotSurveysPage.content && hotSurveysPage.content.length > 0 && (
            <section>
              <HeaderGroup>
                <SectionTitle>🔥 지금 HOT한 설문!</SectionTitle>
              </HeaderGroup>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {hotSurveysPage.content.map((survey) => (
                  <HotSurveyItem key={`hot-survey-${survey.id}`}>
                    <Link to={`/surveys/${survey.id}`}>{survey.title}</Link>
                    {survey.description && <p>{survey.description}</p>}
                    <small>
                      작성자: {survey.authorName} · 응답자: {survey.totalRespondents || 0}명 · 생성일: {format(new Date(survey.createdAt), 'yyyy-MM-dd')}
                    </small>
                  </HotSurveyItem>
                ))}
              </ul>
            </section>
          )}

          <section>
            <HeaderGroup style={{ marginTop: (hotSurveysPage.content && hotSurveysPage.content.length > 0) ? '3rem' : '0' }}>
              <SectionTitle>전체 설문 목록</SectionTitle>
              {user && (
                <PrimaryButton as={Link} to="/surveys/new">
                  새 설문 만들기
                </PrimaryButton>
              )}
            </HeaderGroup>

            {isLoadingAll ? <p>설문 목록을 불러오는 중...</p> :
              allSurveysPage.content && allSurveysPage.content.length > 0 ? (
              <>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {allSurveysPage.content.map((survey) => (
                    <SurveyItem key={survey.id}>
                      <Link to={`/surveys/${survey.id}`}>{survey.title}</Link>
                      {survey.description && <p>{survey.description}</p>}
                      <small>
                        작성자: {survey.authorName} · 응답자: {survey.totalRespondents || 0}명 · 생성일: {format(new Date(survey.createdAt), 'yyyy-MM-dd HH:mm')}
                      </small>
                    </SurveyItem>
                  ))}
                </ul>
                {allSurveysPage.totalPage > 1 && (
                  <PaginationContainer>
                    <button
                      onClick={() => handleAllSurveysPageChange(currentAllSurveysPageNumber - 1)}
                      disabled={!allSurveysPage.hasPrevious}
                    >
                      이전
                    </button>
                    <span>{allSurveysPage.currentPage + 1} / {allSurveysPage.totalPage}</span>
                    <button
                      onClick={() => handleAllSurveysPageChange(currentAllSurveysPageNumber + 1)}
                      disabled={!allSurveysPage.hasNext}
                    >
                      다음
                    </button>
                  </PaginationContainer>
                )}
              </>
            ) : (
              <NoSurveysMessage>진행중인 설문이 없습니다.</NoSurveysMessage>
            )}
          </section>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyList;