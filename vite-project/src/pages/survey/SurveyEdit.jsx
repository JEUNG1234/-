// src/pages/survey/SurveyEdit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, Input, PrimaryButton, DangerButton } from '../../components/CommonStyles';

// --- Styled Components (기존과 동일) ---
const SurveyFormTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: ${props => props.theme.colors.text || '#333'};
`;

const SurveyTitleInput = styled(Input)`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding: 0.8rem;
`;

const SurveyDescriptionTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.8rem;
  border: 1px solid ${props => props.theme.colors.border || '#ccc'};
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  resize: vertical;
  font-family: inherit;
  background-color: ${props => props.theme.colors.surface || '#fff'};
  color: ${props => props.theme.colors.text || '#333'};
`;

const QuestionCard = styled.div`
  background: ${props => props.theme.colors.surfaceLight || '#f9f9f9'};
  border: 1px solid ${props => props.theme.colors.borderLight || '#e0e0e0'};
  border-radius: ${props => props.theme.borderRadius.large || '8px'};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${props => props.theme.shadows.small || '0 2px 4px rgba(0,0,0,0.05)'};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 0.7rem;
  border: 1px solid ${props => props.theme.colors.border || '#ccc'};
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  font-size: 1rem;
  margin-bottom: 1rem;
  resize: vertical;
  font-family: inherit;
`;

const QuestionTypeSelect = styled.select`
  width: auto;
  padding: 0.6rem 0.8rem;
  border: 1px solid ${props => props.theme.colors.border || '#ccc'};
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  font-size: 0.9rem;
  font-family: inherit;
  background-color: ${props => props.theme.colors.surface || 'white'};
  color: ${props => props.theme.colors.text || '#333'};
`;

const OptionInputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  input[type="text"] {
    flex-grow: 1;
    margin-right: 0.5rem;
    padding: 0.6rem;
    font-size: 0.9rem;
    border: 1px solid ${props => props.theme.colors.border || '#ccc'};
    border-radius: ${props => props.theme.borderRadius.small || '4px'};
    font-family: inherit;
  }
`;

const AddButton = styled(PrimaryButton)`
  background-color: ${props => props.theme.colors.success || '#28a745'};
  &:hover {
    background-color: #218838;
  }
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
`;

const RemoveButton = styled(DangerButton)`
  padding: 0.4rem 0.7rem;
  font-size: 0.85rem;
  line-height: 1.2;
  min-width: auto;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  border-top: 1px solid ${props => props.theme.colors.border || '#eee'};
  padding-top: 1.5rem;
`;
// --- Styled Components 끝 ---


const SurveyEdit = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [originalAuthorId, setOriginalAuthorId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSurveyData = useCallback(async () => {
    if (!surveyId) {
        navigate('/404'); // 또는 다른 적절한 처리
        return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8888/api/surveys/${surveyId}`);
      const surveyData = response.data;

      if (!user || user.id !== surveyData.authorId) {
        toast.error('설문 수정 권한이 없습니다.');
        navigate(`/surveys/${surveyData.id || surveyId}`);
        return;
      }

      setOriginalAuthorId(surveyData.authorId);
      setSurveyTitle(surveyData.title);
      setSurveyDescription(surveyData.description || '');
      setQuestions(surveyData.questions.map(q => ({
        qId: q.qId,
        qText: q.qText,
        qType: q.qType,
        isRequired: q.isRequired,
        options: q.options ? q.options.map(opt => ({ optId: opt.optId, text: opt.text, votes: opt.votes || 0 })) : []
      })));
    } catch (error) {
      toast.error('설문 정보를 불러오는데 실패했습니다.');
      console.error("Failed to fetch survey for edit:", error);
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
    if (!user) {
      toast.info('수정하려면 로그인이 필요합니다.');
      navigate('/login', {replace: true});
      return;
    }
    fetchSurveyData();
  }, [user, navigate, fetchSurveyData]);

  const handleAddQuestion = () => {
    if (questions.length >= 20) {
        toast.warn('질문은 최대 20개까지 추가할 수 있습니다.');
        return;
    }
    setQuestions(prevQuestions => [
      ...prevQuestions,
      { qId: uuidv4(), qText: '', qType: 'singleChoice', options: [{ optId: uuidv4(), text: '', votes: 0 }, { optId: uuidv4(), text: '', votes: 0 }], isRequired: false }
    ]);
  };

  const handleRemoveQuestion = (qIndexToRemove) => {
    if (questions.length <= 1) {
      toast.warn('설문지에는 최소 1개의 질문이 필요합니다.');
      return;
    }
    setQuestions(prevQuestions => prevQuestions.filter((_, index) => index !== qIndexToRemove));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = questions.map((q, idx) => {
      if (idx === qIndex) {
        const updatedQuestion = { ...q, [field]: value };
        if (field === 'qType') {
          if ((value === 'singleChoice' || value === 'multipleChoice') && (!updatedQuestion.options || updatedQuestion.options.length < 2)) {
            updatedQuestion.options = [{ optId: uuidv4(), text: '', votes: 0 }, { optId: uuidv4(), text: '', votes: 0 }];
          } else if (value !== 'singleChoice' && value !== 'multipleChoice') {
            delete updatedQuestion.options;
          }
        }
        return updatedQuestion;
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    if (!question.options) question.options = [];
    if (question.options.length >= 10) {
        toast.warn('옵션은 최대 10개까지 추가할 수 있습니다.');
        return;
    }
    question.options.push({ optId: uuidv4(), text: '', votes: 0 });
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex, optIndexToRemove) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    if (question.options.length <= 2 && (question.qType === 'singleChoice' || question.qType === 'multipleChoice')) {
      toast.warn('객관식 질문에는 최소 2개의 옵션이 필요합니다.');
      return;
    }
    question.options = question.options.filter((_, index) => index !== optIndexToRemove);
    setQuestions(newQuestions);
  };

  const handleOptionTextChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleUpdateSurvey = async (e) => {
    e.preventDefault();
     if (!user || user.id !== originalAuthorId) {
        toast.error('설문 수정 권한이 없습니다.');
        return;
    }
    if (!surveyTitle.trim()) {
      toast.warn('설문지 제목을 입력해주세요.');
      return;
    }
    // 유효성 검사 (SurveyCreate와 동일하게 추가)
    for (const q of questions) { // 'q' 변수가 여기서 사용됩니다.
        if (!q.qText.trim()) {
            toast.warn(`질문 ${questions.indexOf(q) + 1}의 내용을 입력해주세요.`);
            return;
        }
        if ((q.qType === 'singleChoice' || q.qType === 'multipleChoice')) {
            if(!q.options || q.options.length < 2) {
                toast.warn(`질문 "${q.qText || `질문 ${questions.indexOf(q) + 1}`}"에는 최소 2개의 옵션이 필요합니다.`);
                return;
            }
            if (q.options.some(opt => !opt.text.trim())) {
                toast.warn(`질문 "${q.qText || `질문 ${questions.indexOf(q) + 1}`}"의 모든 옵션 내용을 입력해주세요.`);
                return;
            }
        }
    }

    setIsSubmitting(true);
    const surveyUpdateData = {
      title: surveyTitle.trim(),
      description: surveyDescription.trim(),
      questions: questions.map(q => ({
        qId: q.qId,
        qText: q.qText.trim(),
        qType: q.qType,
        isRequired: q.isRequired,
        options: (q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options
          ? q.options.map(opt => ({
              optId: opt.optId,
              text: opt.text.trim(),
              // votes는 백엔드에서 기존 값을 보존하거나, DTO에 포함시켜 전달 후 처리 필요
            }))
          : undefined,
      })),
    };

    try {
      await axios.put(`http://localhost:8888/api/surveys/${surveyId}`, surveyUpdateData, {
        headers: {
          'X-USER-ID': user.id
        }
      });
      toast.success('설문이 성공적으로 수정되었습니다!');
      navigate(`/surveys/${surveyId}`);
    } catch (error) {
      console.error("설문 수정 중 오류 발생:", error);
       if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error('설문 수정 권한이 없습니다.');
      } else {
        toast.error(error.response?.data?.message || '설문 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageWrapper><PageInner><Container><p>설문 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }
  if (!user || user.id !== originalAuthorId) {
    return <PageWrapper><PageInner><Container><p>접근 권한이 없습니다.</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <form onSubmit={handleUpdateSurvey}>
            <SurveyFormTitle>설문 수정</SurveyFormTitle>
            <SurveyTitleInput
              type="text"
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <SurveyDescriptionTextarea
              value={surveyDescription}
              onChange={(e) => setSurveyDescription(e.target.value)}
              disabled={isSubmitting}
            />

            {questions.map((q, qIndex) => (
              <QuestionCard key={q.qId || `edit-q-${qIndex}`}> {/* 키 값 안정화 */}
                <QuestionHeader>
                  <strong>질문 {qIndex + 1}</strong>
                  {questions.length > 1 && (
                     <RemoveButton type="button" onClick={() => handleRemoveQuestion(qIndex)} disabled={isSubmitting}>질문 삭제</RemoveButton>
                  )}
                </QuestionHeader>
                <QuestionTextarea
                  value={q.qText}
                  onChange={(e) => handleQuestionChange(qIndex, 'qText', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <div>
                    <label htmlFor={`qType-edit-${q.qId || qIndex}`} style={{ marginRight: '10px', fontSize: '0.9rem' }}>질문 유형:</label>
                    <QuestionTypeSelect
                      id={`qType-edit-${q.qId || qIndex}`}
                      value={q.qType}
                      onChange={(e) => handleQuestionChange(qIndex, 'qType', e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="singleChoice">객관식 (단일 선택)</option>
                      <option value="multipleChoice">객관식 (다중 선택)</option>
                       {/* 주관식 유형은 현재 백엔드 DTO에서 options를 undefined로 처리하므로,
                           선택 UI를 추가하려면 백엔드 SurveyDto.QuestionCreate의 options 처리도 수정 필요 */}
                       {/* <option value="textShort">주관식 (단답형)</option> */}
                       {/* <option value="textLong">주관식 (장문형)</option> */}
                    </QuestionTypeSelect>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id={`isRequired-edit-${q.qId || qIndex}`}
                      checked={q.isRequired}
                      onChange={(e) => handleQuestionChange(qIndex, 'isRequired', e.target.checked)}
                      disabled={isSubmitting}
                    />
                    <label htmlFor={`isRequired-edit-${q.qId || qIndex}`} style={{ marginLeft: '0.5rem', fontWeight:'normal', fontSize: '0.9rem' }}>필수 응답</label>
                  </div>
                </div>

                {(q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options && (
                  <div>
                    <strong style={{fontSize: '0.9rem', display:'block', marginBottom:'0.5rem'}}>선택 옵션:</strong>
                    {q.options.map((opt, optIndex) => (
                      <OptionInputGroup key={opt.optId || `edit-opt-${qIndex}-${optIndex}`}> {/* 키 값 안정화 */}
                        <Input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                        {q.options.length > 2 && (
                          <RemoveButton type="button" onClick={() => handleRemoveOption(qIndex, optIndex)} disabled={isSubmitting}>옵션 삭제</RemoveButton>
                        )}
                      </OptionInputGroup>
                    ))}
                    {q.options.length < 10 && (
                       <AddButton type="button" onClick={() => handleAddOption(qIndex)} disabled={isSubmitting}>옵션 추가</AddButton>
                    )}
                  </div>
                )}
              </QuestionCard>
            ))}

            <div style={{textAlign: 'center', marginTop: '1rem' }}>
              <AddButton type="button" onClick={handleAddQuestion} style={{marginBottom: '2rem'}} disabled={isSubmitting}>질문 추가</AddButton>
            </div>

            <FormActions>
              <DangerButton type="button" onClick={() => navigate(`/surveys/${surveyId}`)} disabled={isSubmitting}>취소</DangerButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? '수정 중...' : '수정 완료'}
              </PrimaryButton>
            </FormActions>
          </form>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyEdit;