// src/pages/survey/SurveyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, Input, PrimaryButton, DangerButton } from '../../components/CommonStyles';

// --- SurveyDetail 전용 Styled Components ---
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
  white-space: pre-wrap; // 줄바꿈 유지
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
  span { // 필수 표시
    color: ${props => props.theme.colors.danger || 'red'};
    margin-left: 0.25rem;
  }
`;

const OptionLabel = styled.label`
  display: block;
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.small || '4px'};
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f0f0f0;
  }

  input[type="radio"], input[type="checkbox"] {
    margin-right: 0.8rem;
    transform: scale(1.1);
    accent-color: ${props => props.theme.colors.primary || 'royalblue'};
  }
`;

const TextInput = styled(Input)`
    margin-top: 0.5rem;
`;

const TextareaResponse = styled.textarea`
    width: 100%;
    min-height: 100px;
    padding: 0.8rem;
    border: 1px solid ${props => props.theme.colors.border || '#ccc'};
    border-radius: ${props => props.theme.borderRadius.medium || '6px'};
    font-size: 1rem;
    line-height: 1.5;
    font-family: inherit;
    resize: vertical;
    margin-top: 0.5rem;
`;

const SubmitActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const AuthorActionsGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

// --- 결과 표시용 Styled Components (PollDetail.jsx 참고 및 수정) ---
const ResultSectionTitle = styled.h3`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text || '#444'};
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const OptionResultItem = styled.li`
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  position: relative;
  overflow: hidden; // 중요: 내부 ResultBarBackground가 테두리를 넘지 않도록
`;

const OptionTextWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem; /* 결과 바와 텍스트 간격 */
  position: relative; /* 텍스트가 바 위에 오도록 */
  z-index: 2;
`;

const OptionResultText = styled.span`
  font-size: 1rem; /* OptionLabel의 font-size와 맞추거나 조절 */
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
  width: 100%; // 전체 너비를 채움
  background-color: #e9ecef; // 연한 배경색
  border-radius: 6px; // OptionResultItem의 radius와 일치
  z-index: 0; // 텍스트보다 뒤에 오도록
`;

const ResultBarForeground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${props => props.theme.colors.primary || 'royalblue'};
  opacity: 0.7; // 약간 투명하게 하여 뒷 배경과 구분되도록
  border-radius: 6px;
  transition: width 0.5s ease-in-out;
  z-index: 1; // 배경보다는 위, 텍스트보다는 아래
  width: ${props => props.$percentage}%; // transient prop 사용
`;

const TotalRespondentsText = styled.p`
  text-align: right;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9em;
`;
// --- 여기까지 Styled Components ---


const SurveyDetail = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) return;
      try {
        const res = await axios.get(`http://localhost:3001/surveys/${surveyId}`);
        setSurvey(res.data);
        const initialResponses = {};
        if (res.data && res.data.questions) {
          res.data.questions.forEach(q => {
            initialResponses[q.qId] = q.qType === 'multipleChoice' ? [] : '';
          });
        }
        setResponses(initialResponses);

        if (user && res.data) {
          const participationRecord = localStorage.getItem(`survey_participation_${surveyId}_${user.id}`);
          if (participationRecord) {
            setHasParticipated(true);
          }
        }
      } catch (error) {
        toast.error('설문 정보를 불러오지 못했습니다.');
        console.error("Failed to fetch survey:", error);
        navigate('/');
      }
    };
    fetchSurvey();
  }, [surveyId, user, navigate]); // navigate 의존성 추가

  const handleResponseChange = (questionId, questionType, value, optionIdIfCheckbox = null) => {
    setResponses(prev => {
      const newResponses = { ...prev };
      if (questionType === 'multipleChoice') {
        const currentSelections = prev[questionId] || [];
        if (value) {
          newResponses[questionId] = [...currentSelections, optionIdIfCheckbox];
        } else {
          newResponses[questionId] = currentSelections.filter(id => id !== optionIdIfCheckbox);
        }
      } else {
        newResponses[questionId] = value;
      }
      return newResponses;
    });
  };

  const handleSubmitSurvey = async () => {
    if (!user) {
        toast.warn('설문에 참여하려면 로그인이 필요합니다.');
        navigate('/login');
        return;
    }
    if (survey && user.name === survey.author) {
        toast.info('자신이 만든 설문에는 응답을 제출할 수 없습니다.');
        navigate(`/surveys/${surveyId}/results`);
        return;
    }
    if (hasParticipated) {
        toast.info('이미 이 설문에 참여하셨습니다.');
        navigate(`/surveys/${surveyId}/results`);
        return;
    }

    for (const q of survey.questions) {
        if (q.isRequired) {
            const answer = responses[q.qId];
            const isEmptyAnswer = (q.qType === 'multipleChoice' && (!answer || answer.length === 0)) ||
                                  ((q.qType !== 'multipleChoice') && (!answer || String(answer).trim() === ''));
            if (isEmptyAnswer) {
                toast.warn(`질문 "${q.qText}"은(는) 필수 항목입니다.`);
                return;
            }
        }
    }

    setIsSubmitting(true);
    try {
      const updatedTotalRespondents = (survey.totalRespondents || 0) + 1;
      const updatedQuestions = survey.questions.map(q => {
        const newQ = { ...q };
        const userAnswer = responses[q.qId];

        if (q.options && (q.qType === 'singleChoice' || q.qType === 'multipleChoice')) {
          newQ.options = newQ.options.map(opt => {
            let shouldIncrementVote = false;
            if (q.qType === 'singleChoice' && opt.optId === userAnswer) {
              shouldIncrementVote = true;
            } else if (q.qType === 'multipleChoice' && Array.isArray(userAnswer) && userAnswer.includes(opt.optId)) {
              shouldIncrementVote = true;
            }
            return shouldIncrementVote ? { ...opt, votes: (opt.votes || 0) + 1 } : opt;
          });
        }
        // 주관식 답변의 경우, 백엔드에서 별도의 responses 테이블/컬렉션에 저장하는 것이 일반적입니다.
        // 여기서는 votes만 업데이트하므로, 주관식 결과 집계는 SurveyResult 페이지에서 다루는 것이 더 적절합니다.
        return newQ;
      });

      const surveyUpdatePayload = {
        ...survey,
        questions: updatedQuestions,
        totalRespondents: updatedTotalRespondents,
      };

      await axios.put(`http://localhost:3001/surveys/${surveyId}`, surveyUpdatePayload);

      if (user) {
        localStorage.setItem(`survey_participation_${surveyId}_${user.id}`, 'true');
        setHasParticipated(true);
      }

      toast.success('설문이 제출되었습니다. 감사합니다!');
      navigate(`/surveys/${surveyId}/results`);
    } catch (error) {
      toast.error('설문 제출 중 오류가 발생했습니다.');
      console.error("Failed to submit survey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

   const handleDeleteSurvey = async () => {
    if (!user || user.name !== survey?.author) {
        toast.error('삭제 권한이 없습니다.');
        return;
    }
    if (window.confirm('정말로 이 설문을 삭제하시겠습니까? 모든 응답 데이터도 함께 삭제됩니다.')) {
        try {
            await axios.delete(`http://localhost:3001/surveys/${surveyId}`);
            toast.success('설문이 삭제되었습니다.');
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith(`survey_participation_${surveyId}_`)) {
                localStorage.removeItem(key);
              }
            });
            navigate('/');
        } catch (error) {
            toast.error('설문 삭제 중 오류가 발생했습니다.');
            console.error("Failed to delete survey:", error);
        }
    }
  };


  if (!survey) {
    return <PageWrapper><PageInner><Container><p>설문 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  const isAuthor = user && user.name === survey.author;

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <SurveyTitle>{survey.title}</SurveyTitle>
          {survey.description && <SurveyDescription>{survey.description}</SurveyDescription>}

          {/* --- 작성자에게만 보이는 영역 --- */}
          {isAuthor && (
            <>
              <AuthorActionsGroup>
                <PrimaryButton
                  as={Link}
                  to={`/surveys/${surveyId}/edit`}
                  style={{backgroundColor: '#ffc107', borderColor: '#ffc107', color: '#212529'}}
                >
                  설문 수정
                </PrimaryButton>
                <DangerButton onClick={handleDeleteSurvey}>
                  설문 삭제
                </DangerButton>
                <PrimaryButton as={Link} to={`/surveys/${surveyId}/results`}>
                  결과 상세 보기
                </PrimaryButton>
              </AuthorActionsGroup>

              <ResultSectionTitle>설문 내용 및 현재 응답 현황</ResultSectionTitle>
              {survey.totalRespondents > 0 && (
                <TotalRespondentsText>총 응답자: {survey.totalRespondents}명</TotalRespondentsText>
              )}
              {survey.questions && survey.questions.map((q, qIndex) => {
                // 해당 질문에 대한 총 투표 수 계산 (객관식만 해당)
                let totalVotesForQuestion = 0;
                if ((q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options) {
                  totalVotesForQuestion = q.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
                }

                return (
                  <QuestionBlock key={q.qId} style={{background: '#fdfdfd'}}>
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
                      <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.9em' }}>
                        * 주관식 응답 항목입니다. (상세 응답은 '결과 상세 보기'에서 확인 가능)
                      </p>
                    )}
                  </QuestionBlock>
                );
              })}
            </>
          )}

          {/* --- 이미 참여한 경우 (작성자 아님) --- */}
          {!isAuthor && hasParticipated && (
            <div style={{textAlign: 'center', margin: '2rem 0', padding: '1rem', background: '#e9f7ef', borderRadius: '6px'}}>
                <p style={{color: '#155724', fontWeight: 'bold'}}>이미 이 설문에 참여하셨습니다.</p>
                <PrimaryButton as={Link} to={`/surveys/${surveyId}/results`} style={{marginTop: '0.5rem'}}>결과 보기</PrimaryButton>
            </div>
          )}

          {/* --- 참여 폼 (작성자가 아니고, 아직 참여하지 않은 경우) --- */}
          {!isAuthor && !hasParticipated && survey.questions && survey.questions.length > 0 && (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitSurvey(); }}>
              {survey.questions.map((q, qIndex) => (
                <QuestionBlock key={q.qId}>
                  <QuestionText>
                    질문 {qIndex + 1}. {q.qText}
                    {q.isRequired && <span>*</span>}
                  </QuestionText>

                  {q.qType === 'singleChoice' && q.options && q.options.map(opt => (
                    <OptionLabel key={opt.optId} htmlFor={`q${q.qId}-opt${opt.optId}`}>
                      <input
                        type="radio"
                        id={`q${q.qId}-opt${opt.optId}`}
                        name={`question-${q.qId}`}
                        value={opt.optId}
                        checked={responses[q.qId] === opt.optId}
                        onChange={(e) => handleResponseChange(q.qId, q.qType, e.target.value)}
                        required={q.isRequired}
                      />
                      {opt.text}
                    </OptionLabel>
                  ))}

                  {q.qType === 'multipleChoice' && q.options && q.options.map(opt => (
                    <OptionLabel key={opt.optId} htmlFor={`q${q.qId}-opt${opt.optId}`}>
                      <input
                        type="checkbox"
                        id={`q${q.qId}-opt${opt.optId}`}
                        name={`question-${q.qId}-${opt.optId}`} // 고유한 name 부여
                        value={opt.optId}
                        checked={(responses[q.qId] || []).includes(opt.optId)}
                        onChange={(e) => handleResponseChange(q.qId, q.qType, e.target.checked, opt.optId)}
                      />
                      {opt.text}
                    </OptionLabel>
                  ))}

                  {q.qType === 'textShort' && (
                    <TextInput
                      type="text"
                      value={responses[q.qId] || ''}
                      onChange={(e) => handleResponseChange(q.qId, q.qType, e.target.value)}
                      placeholder="답변을 입력해주세요 (단답형)"
                      required={q.isRequired}
                    />
                  )}
                  {q.qType === 'textLong' && (
                    <TextareaResponse
                      value={responses[q.qId] || ''}
                      onChange={(e) => handleResponseChange(q.qId, q.qType, e.target.value)}
                      placeholder="답변을 입력해주세요 (장문형)"
                      rows={4}
                      required={q.isRequired}
                    />
                  )}
                </QuestionBlock>
              ))}
              <SubmitActions>
                <PrimaryButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '제출 중...' : '설문 제출하기'}
                </PrimaryButton>
              </SubmitActions>
            </form>
          )}

          {!isAuthor && !hasParticipated && (!survey.questions || survey.questions.length === 0) && (
             <p style={{textAlign:'center', color: '#777', marginTop: '2rem'}}>이 설문에는 아직 질문이 준비되지 않았습니다.</p>
           )}

        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyDetail;