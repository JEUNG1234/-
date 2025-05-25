// src/pages/survey/SurveyResult.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { format } from 'date-fns';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton } from '../../components/CommonStyles';

const SurveyTitle = styled.h2`
  font-size: 1.8rem;
  color: ${props => props.theme.colors.text || '#333'};
  margin-bottom: 0.5rem;
  text-align: center;
`;

const SurveyDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary || '#666'};
  margin-bottom: 1.5rem;
  text-align: center;
  white-space: pre-wrap;
`;

const SurveyMeta = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary || '#666'};
  margin-bottom: 2rem;
  text-align: center;
  span {
    margin: 0 0.5rem;
    &:first-child { margin-left: 0; }
    &:last-child { margin-right: 0; }
  }
`;

const QuestionBlock = styled.div`
  background: ${props => props.theme.colors.surface || '#fff'};
  border: 1px solid ${props => props.theme.colors.borderLight || '#e0e0e0'};
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${props => props.theme.shadows.small || '0 2px 4px rgba(0,0,0,0.05)'};
`;

const QuestionText = styled.p`
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text || '#333'};
  span { // 필수 표시
    color: ${props => props.theme.colors.danger || 'red'};
    margin-left: 0.25rem;
    font-weight: normal;
  }
`;

const OptionResultItem = styled.li`
  background: ${props => props.theme.colors.surfaceLight || '#f9f9f9'};
  border: 1px solid ${props => props.theme.colors.borderLight || '#eee'};
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  position: relative;
  overflow: hidden;
`;

const OptionTextWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
`;

const OptionResultText = styled.span`
  font-size: 1rem;
  color: ${props => props.theme.colors.text || '#333'};
  word-break: break-word;
`;

const VoteCount = styled.span`
  font-size: 0.9rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary || 'royalblue'};
  margin-left: 0.5rem;
  white-space: nowrap;
`;

const PercentageText = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary || '#555'};
  margin-left: 0.5rem;
  white-space: nowrap;
`;

const ResultBarBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.colors.borderLight || '#e9ecef'};
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  z-index: 0;
`;

const ResultBarForeground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${props => props.theme.colors.primary || 'royalblue'};
  opacity: 0.6;
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  transition: width 0.5s ease-in-out;
  z-index: 1;
  width: ${props => props.$percentage}%;
`;

const TotalRespondentsText = styled.p`
  text-align: right;
  font-weight: bold;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.text || '#333'};
  font-size: 1rem;
`;

const SurveyResult = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSurveyResults = useCallback(async () => {
    if (!surveyId) return;
    setIsLoading(true);
    try {
      const surveyRes = await axios.get(`http://localhost:8888/api/surveys/${surveyId}/results`);
      setSurvey(surveyRes.data);
    } catch (error) {
      toast.error('설문 결과를 불러오는데 실패했습니다.');
      console.error("Failed to fetch survey results:", error);
      if (error.response && error.response.status === 404) {
        navigate('/404');
      } else {
        navigate('/surveys');
      }
    } finally {
      setIsLoading(false);
    }
  }, [surveyId, navigate]);

  useEffect(() => {
    fetchSurveyResults();
  }, [fetchSurveyResults]);

  if (isLoading || !survey) {
    return <PageWrapper><PageInner><Container><p>결과를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <SurveyTitle>'{survey.title}' 설문 결과</SurveyTitle>
          {survey.description && <SurveyDescription>{survey.description}</SurveyDescription>}
          <SurveyMeta>
            <span>작성자: {survey.authorName}</span> |
            <span>생성일: {format(new Date(survey.createdAt), 'yyyy-MM-dd HH:mm')}</span>
          </SurveyMeta>
          <TotalRespondentsText>총 응답자: {survey.totalRespondents || 0}명</TotalRespondentsText>

          {survey.questions && survey.questions.map((q, qIndex) => {
            let totalVotesForQuestion = 0;
            if ((q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options) {
              totalVotesForQuestion = q.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
            }

            return (
              <QuestionBlock key={q.qId}>
                <QuestionText>
                  질문 {qIndex + 1}. {q.qText}
                  {q.isRequired && <span>*</span>}
                </QuestionText>

                {(q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options && q.options.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {q.options.map(opt => {
                      const percentageValue = totalVotesForQuestion > 0 && opt.votes > 0
                        ? (opt.votes / totalVotesForQuestion) * 100
                        : 0;
                      return (
                        <OptionResultItem key={opt.optId}>
                          <ResultBarBackground />
                          <ResultBarForeground $percentage={percentageValue} />
                          <OptionTextWrapper>
                            <OptionResultText>{opt.text}</OptionResultText>
                            <div>
                              <VoteCount>{opt.votes || 0} 표</VoteCount>
                              <PercentageText>({percentageValue.toFixed(1)}%)</PercentageText>
                            </div>
                          </OptionTextWrapper>
                        </OptionResultItem>
                      );
                    })}
                  </ul>
                )}
                {(q.qType === 'singleChoice' || q.qType === 'multipleChoice') && (!q.options || q.options.length === 0) && (
                    <p style={{ fontSize: '0.9em', color: '#888' }}>옵션 정보가 없습니다.</p>
                )}
                {(q.qType !== 'singleChoice' && q.qType !== 'multipleChoice') && (
                     <p style={{ fontSize: '0.9em', color: '#888' }}>
                       (주관식 응답 결과 표시는 추가 구현이 필요합니다.)
                     </p>
                )}
              </QuestionBlock>
            );
          })}

          <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <PrimaryButton onClick={() => navigate(`/surveys/${surveyId}`)}>설문으로 돌아가기</PrimaryButton>
            <PrimaryButton onClick={() => navigate('/surveys')}>설문 목록으로</PrimaryButton>
          </div>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyResult;