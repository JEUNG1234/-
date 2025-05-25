// src/pages/survey/SurveyDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { format } from 'date-fns';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, Input, PrimaryButton, DangerButton } from '../../components/CommonStyles'; // Input, Textarea는 직접 사용 안함

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
  span {
    color: ${props => props.theme.colors.danger || 'red'};
    margin-left: 0.25rem;
    font-weight: normal;
  }
`;

const OptionLabel = styled.label`
  display: block;
  background: ${props => props.theme.colors.surfaceLight || '#f9f9f9'};
  border: 1px solid ${props => props.theme.colors.border || '#eee'};
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.small || '4px'};
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  font-size: 1rem;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${props => props.theme.colors.surfaceHover || '#f0f0f0'};
    border-color: ${props => props.theme.colors.primary || 'royalblue'};
  }

  input[type="radio"], input[type="checkbox"] {
    margin-right: 0.8rem;
    transform: scale(1.1);
    accent-color: ${props => props.theme.colors.primary || 'royalblue'};
  }
  &.selected {
    border-color: ${props => props.theme.colors.primary || 'royalblue'};
    background-color: #e6f7ff;
  }
`;

const SubmitActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight || '#eee'};
`;

const AuthorActionsGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  margin-top: -1rem;
`;

const SurveyDetail = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [isDeletingSurvey, setIsDeletingSurvey] = useState(false);

  const fetchSurvey = useCallback(async () => {
    if (!surveyId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/surveys/${surveyId}`);
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
        } else {
          setHasParticipated(false);
        }
      } else {
        setHasParticipated(false);
      }
    } catch (error) {
      toast.error('설문 정보를 불러오지 못했습니다.');
      console.error("Failed to fetch survey:", error);
      if (error.response && error.response.status === 404) {
        navigate('/404');
      } else {
        navigate('/surveys');
      }
    } finally {
      setIsLoading(false);
    }
  }, [surveyId, user, navigate]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

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
    if (!user || !user.id) {
        toast.warn('설문에 참여하려면 로그인이 필요합니다.');
        navigate('/login', { state: { from: `/surveys/${surveyId}` } });
        return;
    }
    if (user.id === survey?.authorId) {
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
                toast.warn(`질문 "${q.qText}"은(는) 필수 응답 항목입니다.`);
                return;
            }
        }
    }

    setIsSubmitting(true);
    const submittedResponsesPayload = Object.entries(responses).map(([qId, answer]) => {
      const question = survey.questions.find(q => q.qId === qId);
      if (question?.qType === 'singleChoice' && answer) {
        return { qId: qId, selectedOptIds: [answer] }; // 단일 선택도 배열로 전달
      }
      if (question?.qType === 'multipleChoice' && Array.isArray(answer) && answer.length > 0) {
        return { qId: qId, selectedOptIds: answer };
      }
      // 주관식 응답은 현재 DTO에 없으므로 필터링될 수 있음
      return null;
    }).filter(Boolean);


    const submitData = {
        responses: submittedResponsesPayload
    };

    try {
      const response = await axios.post(`http://localhost:8888/api/surveys/${surveyId}/responses`, submitData, {
        headers: {
          'X-USER-ID': user.id
        }
      });

      if (user) {
        localStorage.setItem(`survey_participation_${surveyId}_${user.id}`, 'true');
        setHasParticipated(true);
      }

      toast.success('설문이 성공적으로 제출되었습니다. 감사합니다!');
      setSurvey(response.data);
      navigate(`/surveys/${surveyId}/results`);

    } catch (error) {
      console.error("설문 제출 중 오류 발생:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error('설문 제출 권한이 없습니다.');
      } else {
        toast.error(error.response?.data?.message || '설문 제출 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

   const handleDeleteSurvey = async () => {
    if (!user || !user.id || user.id !== survey?.authorId) {
        toast.error('설문 삭제 권한이 없습니다.');
        return;
    }
    if (window.confirm('정말로 이 설문을 삭제하시겠습니까? 모든 응답 데이터도 함께 삭제됩니다.')) {
        setIsDeletingSurvey(true);
        try {
            await axios.delete(`http://localhost:8888/api/surveys/${surveyId}`,{
                headers: {
                    'X-USER-ID': user.id
                }
            });
            toast.success('설문이 삭제되었습니다.');
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith(`survey_participation_${surveyId}_`)) {
                localStorage.removeItem(key);
              }
            });
            navigate('/surveys');
        } catch (error) {
            console.error("설문 삭제 중 오류 발생:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error('설문 삭제 권한이 없습니다.');
            } else {
                toast.error(error.response?.data?.message || '설문 삭제 중 오류가 발생했습니다.');
            }
        } finally {
            setIsDeletingSurvey(false);
        }
    }
  };

  if (isLoading || !survey) {
    return <PageWrapper><PageInner><Container><p>설문 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  const isAuthor = user && survey && user.id === survey.authorId;

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <SurveyTitle>{survey.title}</SurveyTitle>
          {survey.description && <SurveyDescription>{survey.description}</SurveyDescription>}
          <SurveyMeta>
            <span>작성자: {survey.authorName}</span> |
            <span>생성일: {format(new Date(survey.createdAt), 'yyyy-MM-dd HH:mm')}</span> |
            <span>총 응답자: {survey.totalRespondents || 0}명</span>
          </SurveyMeta>

          {isAuthor && (
            <AuthorActionsGroup>
              <PrimaryButton
                as={Link}
                to={`/surveys/${surveyId}/edit`}
                style={{backgroundColor: '#ffc107', borderColor: '#ffc107', color: '#212529'}}
                disabled={isDeletingSurvey || isSubmitting}
              >
                설문 수정
              </PrimaryButton>
              <DangerButton onClick={handleDeleteSurvey} disabled={isDeletingSurvey || isSubmitting}>
                {isDeletingSurvey ? '삭제 중...' : '설문 삭제'}
              </DangerButton>
              <PrimaryButton as={Link} to={`/surveys/${surveyId}/results`} disabled={isSubmitting}>
                결과 보기
              </PrimaryButton>
            </AuthorActionsGroup>
          )}

          {!isAuthor && hasParticipated && (
            <div style={{textAlign: 'center', margin: '2rem 0', padding: '1rem', background: '#e9f7ef', borderRadius: '6px'}}>
                <p style={{color: '#155724', fontWeight: 'bold'}}>이미 이 설문에 참여하셨습니다.</p>
                <PrimaryButton as={Link} to={`/surveys/${surveyId}/results`} style={{marginTop: '0.5rem'}}>결과 보기</PrimaryButton>
            </div>
          )}

          {!isAuthor && !hasParticipated && survey.questions && survey.questions.length > 0 && (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitSurvey(); }}>
              {survey.questions.map((q, qIndex) => (
                <QuestionBlock key={q.qId}>
                  <QuestionText>
                    질문 {qIndex + 1}. {q.qText}
                    {q.isRequired && <span>*</span>}
                  </QuestionText>

                  {q.qType === 'singleChoice' && q.options && q.options.map(opt => (
                    <OptionLabel key={opt.optId} htmlFor={`q${q.qId}-opt${opt.optId}`} className={responses[q.qId] === opt.optId ? 'selected' : ''}>
                      <input
                        type="radio"
                        id={`q${q.qId}-opt${opt.optId}`}
                        name={`question-${q.qId}`}
                        value={opt.optId} // 옵션의 optId (프론트 UUID)를 값으로 사용
                        checked={responses[q.qId] === opt.optId}
                        onChange={(e) => handleResponseChange(q.qId, q.qType, e.target.value)}
                        required={q.isRequired && !responses[q.qId]}
                        disabled={isSubmitting}
                      />
                      {opt.text}
                    </OptionLabel>
                  ))}

                  {q.qType === 'multipleChoice' && q.options && q.options.map(opt => (
                    <OptionLabel key={opt.optId} htmlFor={`q${q.qId}-opt${opt.optId}`} className={(responses[q.qId] || []).includes(opt.optId) ? 'selected' : ''}>
                      <input
                        type="checkbox"
                        id={`q${q.qId}-opt${opt.optId}`}
                        name={`question-${q.qId}-${opt.optId}`}
                        value={opt.optId} // 옵션의 optId (프론트 UUID)를 값으로 사용
                        checked={(responses[q.qId] || []).includes(opt.optId)}
                        onChange={(e) => handleResponseChange(q.qId, q.qType, e.target.checked, opt.optId)}
                        disabled={isSubmitting}
                      />
                      {opt.text}
                    </OptionLabel>
                  ))}
                  {/* 주관식은 현재 미구현 */}
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
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <PrimaryButton onClick={() => navigate('/surveys')}>설문 목록으로</PrimaryButton>
          </div>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyDetail;