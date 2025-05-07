// src/pages/survey/SurveyResult.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
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
  margin-bottom: 2rem;
  text-align: center;
  white-space: pre-wrap;
`;

const ResultInfoText = styled.p`
  text-align: right;
  font-weight: bold;
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1rem;
`;

const QuestionBlock = styled.div`
  background: ${props => props.theme.colors.surface || '#fff'};
  border: 1px solid #e0e0e0;
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
  span {
    color: ${props => props.theme.colors.danger || 'red'};
    margin-left: 0.25rem;
  }
`;

const OptionResultItem = styled.li`
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
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
  color: #333;
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
  color: #555;
  margin-left: 0.5rem;
  white-space: nowrap;
`;

const ResultBarBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #e9ecef;
  border-radius: 6px;
  z-index: 0;
`;

const ResultBarForeground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${props => props.theme.colors.primary || 'royalblue'};
  opacity: 0.7;
  border-radius: 6px;
  transition: width 0.5s ease-in-out;
  z-index: 1;
  width: ${props => props.$percentage}%;
`;

// 주관식 답변 표시용 스타일 (필요시 주석 해제하여 사용)
// const SubjectiveResponseList = styled.ul`
//   list-style: none;
//   padding-left: 0;
//   margin-top: 0.5rem;
// `;

// const SubjectiveResponseItem = styled.li`
//   background-color: #f8f9fa;
//   border: 1px solid #e9ecef;
//   padding: 0.75rem;
//   margin-bottom: 0.5rem;
//   border-radius: 4px;
//   font-size: 0.95rem;
//   color: #495057;
//   white-space: pre-wrap; // 줄바꿈 유지
// `;

const SurveyResult = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [individualResponses, setIndividualResponses] = useState([]); // 주관식 응답 기능 구현 전까지 주석 처리

  useEffect(() => {
    const fetchSurveyData = async () => {
      setIsLoading(true);
      try {
        const surveyRes = await axios.get(`http://localhost:3001/surveys/${surveyId}`);
        setSurvey(surveyRes.data);

        // 주관식 응답 기능 구현 시 아래 주석 해제 및 API 호출 로직 추가
        // const individualResponsesRes = await axios.get(`http://localhost:3001/individualResponses?surveyId=${surveyId}`);
        // setIndividualResponses(individualResponsesRes.data); 
      } catch (error) {
        toast.error('설문 결과를 불러오는데 실패했습니다.');
        console.error("Failed to fetch survey results:", error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurveyData();
  }, [surveyId, navigate]);

  if (isLoading) {
    return <PageWrapper><PageInner><Container><p>결과를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  if (!survey) {
    return <PageWrapper><PageInner><Container><p>결과 정보를 표시할 수 없습니다.</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <SurveyTitle>'{survey.title}' 설문 결과</SurveyTitle>
          {survey.description && <SurveyDescription>{survey.description}</SurveyDescription>}
          <ResultInfoText>총 응답자: {survey.totalRespondents || 0}명</ResultInfoText>

          {survey.questions && survey.questions.map((q, qIndex) => {
            let totalVotesForQuestion = 0;
            if ((q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options) {
              totalVotesForQuestion = q.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
            }

            // 주관식 응답 기능 구현 시 아래 주석 해제 및 individualResponses 사용
            // const questionSubjectiveResponses = individualResponses.filter(r => r.questionId === q.qId).map(r => r.answer);

            return (
              <QuestionBlock key={q.qId}>
                <QuestionText>
                  질문 {qIndex + 1}. {q.qText}
                  {q.isRequired && <span>*</span>}
                </QuestionText>

                {(q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options && (
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
                {(q.qType === 'textShort' || q.qType === 'textLong') && (
                  <>
                    <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.9em', marginBottom: '0.5rem' }}>
                      주관식 응답 항목입니다.
                    </p>
                    {/* 주관식 응답 기능 구현 시 아래 주석 해제 및 로직 구현
                    {questionSubjectiveResponses && questionSubjectiveResponses.length > 0 ? (
                      <SubjectiveResponseList>
                        {questionSubjectiveResponses.map((response, index) => (
                          <SubjectiveResponseItem key={index}>{response}</SubjectiveResponseItem>
                        ))}
                      </SubjectiveResponseList>
                    ) : (
                      <p style={{ fontSize: '0.9em', color: '#888' }}>받은 주관식 응답이 없습니다.</p>
                    )} */}
                     <p style={{ fontSize: '0.9em', color: '#888' }}>
                       (주관식 응답 표시는 추가적인 데이터 처리 및 연동 작업이 필요합니다.)
                     </p>
                  </>
                )}
              </QuestionBlock>
            );
          })}

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <PrimaryButton onClick={() => navigate(`/surveys/${surveyId}`)}>설문 상세로 돌아가기</PrimaryButton>
            <PrimaryButton onClick={() => navigate('/')} style={{marginLeft: '1rem'}}>홈으로</PrimaryButton>
          </div>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyResult;