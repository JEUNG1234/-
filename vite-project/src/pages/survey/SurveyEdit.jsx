// src/pages/survey/SurveyEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid'; // 새 질문/옵션 ID 생성을 위해
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, Input, PrimaryButton, DangerButton } from '../../components/CommonStyles';

// SurveyCreate.jsx와 유사한 Styled Components 사용
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


const SurveyEdit = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [originalSurvey, setOriginalSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyData = async () => {
      if (!surveyId) {
        toast.error('잘못된 접근입니다.');
        navigate('/');
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8888/api/surveys/${surveyId}`);
        const surveyData = response.data;

        if (!user || user.name !== surveyData.author) {
          toast.error('수정 권한이 없습니다.');
          navigate(`/surveys/${surveyId}`);
          return;
        }

        setOriginalSurvey(surveyData);
        setSurveyTitle(surveyData.title);
        setSurveyDescription(surveyData.description || '');
        // votes와 같은 추가적인 option 속성을 유지하기 위해 깊은 복사
        setQuestions(surveyData.questions.map(q => ({
          ...q,
          options: q.options ? q.options.map(opt => ({ ...opt })) : []
        })));
      } catch (error) {
        toast.error('설문 정보를 불러오는데 실패했습니다.');
        console.error("Failed to fetch survey for edit:", error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      toast.info('수정하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    fetchSurveyData();
  }, [surveyId, user, navigate]);

  // --- 질문 및 옵션 핸들러 함수들 (SurveyCreate.jsx에서 가져와 수정) ---
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

  const handleRemoveQuestion = (questionIndex) => {
    if (questions.length <= 1) {
      toast.warn('설문지에는 최소 1개의 질문이 필요합니다.');
      return;
    }
    setQuestions(prevQuestions => prevQuestions.filter((_, index) => index !== questionIndex));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = questions.map((q, idx) => {
      if (idx === questionIndex) {
        const updatedQuestion = { ...q, [field]: value };
        // 질문 유형 변경 시 옵션 처리
        if (field === 'qType') {
          if ((value === 'singleChoice' || value === 'multipleChoice') && (!updatedQuestion.options || updatedQuestion.options.length < 2)) {
            updatedQuestion.options = [{ optId: uuidv4(), text: '', votes: 0 }, { optId: uuidv4(), text: '', votes: 0 }];
          } else if (value === 'textShort' || value === 'textLong') {
            delete updatedQuestion.options; // 주관식에는 옵션 없음
          }
        }
        return updatedQuestion;
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = questions.map((q, idx) => {
      if (idx === questionIndex) {
        if (!q.options) q.options = []; // 혹시 모를 경우 대비
        if (q.options.length >= 10) {
            toast.warn('옵션은 최대 10개까지 추가할 수 있습니다.');
            return q;
        }
        return { ...q, options: [...q.options, { optId: uuidv4(), text: '', votes: 0 }] };
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = questions.map((q, idx) => {
      if (idx === questionIndex) {
        if (q.options.length <= 2 && (q.qType === 'singleChoice' || q.qType === 'multipleChoice')) {
          toast.warn('객관식 질문에는 최소 2개의 옵션이 필요합니다.');
          return q;
        }
        return { ...q, options: q.options.filter((_, optIdx) => optIdx !== optionIndex) };
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  const handleOptionTextChange = (questionIndex, optionIndex, value) => {
    const newQuestions = questions.map((q, idx) => {
      if (idx === questionIndex) {
        const newOptions = q.options.map((opt, optIdx) => {
          if (optIdx === optionIndex) {
            return { ...opt, text: value };
          }
          return opt;
        });
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuestions(newQuestions);
  };
  // --- 핸들러 함수 끝 ---

  const handleUpdateSurvey = async (e) => {
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

    const updatedSurveyData = {
      ...originalSurvey, // id, author, createdAt, totalRespondents 등 기존 정보 유지
      title: surveyTitle.trim(),
      description: surveyDescription.trim(),
      questions: questions.map(q => ({
        qId: q.qId, // 기존 qId 유지
        qText: q.qText.trim(),
        qType: q.qType,
        isRequired: q.isRequired,
        ...((q.qType === 'singleChoice' || q.qType === 'multipleChoice') && {
          options: q.options.map(opt => ({
            optId: opt.optId, // 기존 optId 유지
            text: opt.text.trim(),
            votes: opt.votes || 0 // 기존 votes 값 유지
          }))
        })
      })),
      // totalRespondents는 설문 응답 시 변경되므로, 수정 시에는 보통 변경하지 않음.
      // 필요하다면 updatedAt 필드를 추가할 수 있음 (서버에서 처리)
    };

    try {
      await axios.put(`http://localhost:8888/api/surveys/${surveyId}`, updatedSurveyData);
      toast.success('설문이 성공적으로 수정되었습니다!');
      navigate(`/surveys/${surveyId}`);
    } catch (error) {
      toast.error('설문 수정 중 오류가 발생했습니다.');
      console.error("Failed to update survey:", error);
    }
  };

  if (isLoading) {
    return <PageWrapper><PageInner><Container><p>설문 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }
  
  if (!originalSurvey) {
    return <PageWrapper><PageInner><Container><p>설문 정보를 표시할 수 없습니다. 권한이 없거나 잘못된 접근일 수 있습니다.</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <form onSubmit={handleUpdateSurvey}>
            <SurveyFormTitle>설문 수정</SurveyFormTitle>
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
              <QuestionCard key={q.qId || qIndex}> {/* qId가 없을 수도 있는 새 질문 고려 */}
                <QuestionHeader>
                  <strong>질문 {qIndex + 1}</strong>
                  {questions.length > 1 && (
                     <RemoveButton type="button" onClick={() => handleRemoveQuestion(qIndex)}>질문 삭제</RemoveButton>
                  )}
                </QuestionHeader>
                <QuestionTextarea
                  placeholder="질문 내용을 입력하세요"
                  value={q.qText}
                  onChange={(e) => handleQuestionChange(qIndex, 'qText', e.target.value)}
                  required
                />
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <div>
                    <label htmlFor={`qType-${q.qId || qIndex}`} style={{ marginRight: '10px', fontSize: '0.9rem' }}>질문 유형:</label>
                    <QuestionTypeSelect
                      id={`qType-${q.qId || qIndex}`}
                      value={q.qType}
                      onChange={(e) => handleQuestionChange(qIndex, 'qType', e.target.value)}
                    >
                      <option value="singleChoice">객관식 (단일 선택)</option>
                      <option value="multipleChoice">객관식 (다중 선택)</option>
                      <option value="textShort">주관식 (단답형)</option>
                      <option value="textLong">주관식 (장문형)</option>
                    </QuestionTypeSelect>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id={`isRequired-${q.qId || qIndex}`}
                      checked={q.isRequired}
                      onChange={(e) => handleQuestionChange(qIndex, 'isRequired', e.target.checked)}
                    />
                    <label htmlFor={`isRequired-${q.qId || qIndex}`} style={{ marginLeft: '0.5rem', fontWeight:'normal', fontSize: '0.9rem' }}>필수 응답</label>
                  </div>
                </div>

                {(q.qType === 'singleChoice' || q.qType === 'multipleChoice') && q.options && (
                  <div>
                    <strong style={{fontSize: '0.9rem', display:'block', marginBottom:'0.5rem'}}>선택 옵션:</strong>
                    {q.options.map((opt, optIndex) => (
                      <OptionInputGroup key={opt.optId || optIndex}> {/* optId가 없을 수도 있는 새 옵션 고려 */}
                        <Input
                          type="text"
                          placeholder={`옵션 ${optIndex + 1}`}
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                          required
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
                {/* 주관식 질문 유형에 대한 별도 UI는 생성 시와 동일하게 없음 (필요시 추가) */}
              </QuestionCard>
            ))}

            <div style={{textAlign: 'center', marginTop: '1rem' }}>
              <AddButton type="button" onClick={handleAddQuestion} style={{marginBottom: '2rem'}}>질문 추가</AddButton>
            </div>

            <FormActions>
              <PrimaryButton type="submit">수정 완료</PrimaryButton>
              <DangerButton type="button" onClick={() => navigate(`/surveys/${surveyId}`)}>취소</DangerButton>
            </FormActions>
          </form>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default SurveyEdit;