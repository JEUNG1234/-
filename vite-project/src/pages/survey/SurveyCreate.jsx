// src/pages/survey/SurveyCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, Input, PrimaryButton, DangerButton } from '../../components/CommonStyles';

// --- SurveyCreate 전용 Styled Components (이전 답변과 동일) ---
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
  background: ${props => props.theme.colors.surface || '#f9f9f9'};
  border: 1px solid #e0e0e0;
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
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
`;
// --- 여기까지 Styled Components ---

const SurveyCreate = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([
    { qId: uuidv4(), qText: '', qType: 'singleChoice', options: [{ optId: uuidv4(), text: '' }, { optId: uuidv4(), text: '' }], isRequired: false }
  ]);

  if (!user) {
    toast.info('설문지를 만들려면 로그인이 필요합니다.', { autoClose: 2000 });
    navigate('/login');
    return null;
  }

  const handleAddQuestion = () => {
    if (questions.length >= 20) {
        toast.warn('질문은 최대 20개까지 추가할 수 있습니다.');
        return;
    }
    setQuestions([
      ...questions,
      { qId: uuidv4(), qText: '', qType: 'singleChoice', options: [{ optId: uuidv4(), text: '' }, { optId: uuidv4(), text: '' }], isRequired: false }
    ]);
  };

  const handleRemoveQuestion = (questionIndex) => {
    if (questions.length <= 1) {
      toast.warn('설문지에는 최소 1개의 질문이 필요합니다.');
      return;
    }
    setQuestions(questions.filter((_, index) => index !== questionIndex));
  };

  const handleQuestionTextChange = (questionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].qText = value;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (questionIndex, value) => {
    const newQuestions = [...questions];
    const currentQuestion = newQuestions[questionIndex];
    currentQuestion.qType = value;
    if (value === 'singleChoice' || value === 'multipleChoice') {
      if (!currentQuestion.options || currentQuestion.options.length < 2) {
        currentQuestion.options = [{ optId: uuidv4(), text: '' }, { optId: uuidv4(), text: '' }];
      }
    } else {
      delete currentQuestion.options;
    }
    setQuestions(newQuestions);
  };

  const handleQuestionRequiredChange = (questionIndex, checked) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].isRequired = checked;
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    if (!question.options) {
        question.options = [];
    }
    if (question.options.length >= 10) {
        toast.warn('옵션은 최대 10개까지 추가할 수 있습니다.');
        return;
    }
    question.options.push({ optId: uuidv4(), text: '' });
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    if (question.options.length <= 2 && (question.qType === 'singleChoice' || question.qType === 'multipleChoice') ) {
      toast.warn('객관식 질문에는 최소 2개의 옵션이 필요합니다.');
      return;
    }
    question.options = question.options.filter((_, index) => index !== optionIndex);
    setQuestions(newQuestions);
  };

  const handleOptionTextChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleSubmitSurvey = async (e) => {
    e.preventDefault();
    if (!surveyTitle.trim()) {
      toast.warn('설문지 제목을 입력해주세요.');
      return;
    }
    for (const q of questions) {
        if (!q.qText.trim()) {
            toast.warn('모든 질문의 내용을 입력해주세요.');
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

    const newSurvey = {
      title: surveyTitle.trim(),
      description: surveyDescription.trim(),
      author: user.name,
      createdAt: new Date().toISOString(),
      status: "published",
      questions: questions.map(q => ({
        qId: q.qId,
        qText: q.qText,
        qType: q.qType,
        isRequired: q.isRequired,
        ...( (q.qType === 'singleChoice' || q.qType === 'multipleChoice') && {
            options: q.options.map(opt => ({ optId: opt.optId, text: opt.text, votes: 0 }))
          }
        )
      })),
      totalRespondents: 0
    };

    try {
      const response = await axios.post('http://localhost:8888/api/surveys', newSurvey);
      toast.success('새로운 설문지가 생성되었습니다!');
      console.log('New survey created:', response.data);

      // !!! 여기가 수정된 부분입니다 !!!
      // SurveyDetail 페이지가 준비되면 아래 주석을 해제하고, 위 navigate('/')는 주석 처리합니다.
      // if (response.data && response.data.id) {
      //   navigate(`/surveys/${response.data.id}`);
      // } else {
      //   toast.warn('생성된 설문 ID를 찾을 수 없어 홈으로 이동합니다.');
      //   navigate('/');
      // }
      navigate('/'); // SurveyDetail.jsx가 준비될 때까지 임시로 홈으로 이동

    } catch (error) {
      toast.error('설문지 생성 중 오류가 발생했습니다.');
      console.error("Failed to create survey:", error);
    }
  };

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <form onSubmit={handleSubmitSurvey}>
            <SurveyFormTitle>새 설문지 만들기</SurveyFormTitle>
            <SurveyTitleInput
              type="text"
              placeholder="설문지 제목을 입력하세요"
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              required
            />
            <SurveyDescriptionTextarea
              placeholder="설문지 설명을 입력하세요 (선택 사항)"
              value={surveyDescription}
              onChange={(e) => setSurveyDescription(e.target.value)}
            />

            {questions.map((q, qIndex) => (
              <QuestionCard key={q.qId}>
                <QuestionHeader>
                  <strong>질문 {qIndex + 1}</strong>
                  {questions.length > 1 && (
                     <RemoveButton type="button" onClick={() => handleRemoveQuestion(qIndex)}>질문 삭제</RemoveButton>
                  )}
                </QuestionHeader>
                <QuestionTextarea
                  placeholder="질문 내용을 입력하세요"
                  value={q.qText}
                  onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                  required
                />
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <div>
                    <label htmlFor={`qType-${q.qId}`} style={{ marginRight: '10px', fontSize: '0.9rem' }}>질문 유형:</label>
                    <QuestionTypeSelect
                      id={`qType-${q.qId}`}
                      value={q.qType}
                      onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                    >
                      <option value="singleChoice">객관식 (단일 선택)</option>
                      <option value="multipleChoice">객관식 (다중 선택)</option>
                    </QuestionTypeSelect>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id={`isRequired-${q.qId}`}
                      checked={q.isRequired}
                      onChange={(e) => handleQuestionRequiredChange(qIndex, e.target.checked)}
                    />
                    <label htmlFor={`isRequired-${q.qId}`} style={{ marginLeft: '0.5rem', fontWeight:'normal', fontSize: '0.9rem' }}>필수 응답</label>
                  </div>
                </div>

                {(q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options && (
                  <div>
                    <strong style={{fontSize: '0.9rem', display:'block', marginBottom:'0.5rem'}}>선택 옵션:</strong>
                    {q.options.map((opt, optIndex) => (
                      <OptionInputGroup key={opt.optId}>
                        <Input
                          type="text"
                          placeholder={`옵션 ${optIndex + 1}`}
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                          required={q.qType === 'singleChoice' || q.qType === 'multipleChoice'}
                        />
                        {q.options.length > 2 && (
                          <RemoveButton type="button" onClick={() => handleRemoveOption(qIndex, optIndex)}>옵션 삭제</RemoveButton>
                        )}
                      </OptionInputGroup>
                    ))}
                    {q.options.length < 10 && (
                       <AddButton type="button" onClick={() => handleAddOption(qIndex)}>옵션 추가</AddButton>
                    )}
                  </div>
                )}
              </QuestionCard>
            ))}

            <div style={{textAlign: 'center', marginTop: '1rem' }}>
              <AddButton type="button" onClick={handleAddQuestion} style={{marginBottom: '2rem'}}>질문 추가</AddButton>
            </div>

            <FormActions>
              <PrimaryButton type="submit">설문지 생성</PrimaryButton>
              <DangerButton type="button" onClick={() => navigate('/')}>취소</DangerButton>
            </FormActions>
          </form>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyCreate;