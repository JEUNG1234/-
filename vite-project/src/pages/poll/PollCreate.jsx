// src/pages/poll/PollCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, Input, PrimaryButton, DangerButton } from '../../components/CommonStyles';

// --- Styled Components (일관성을 위해 PollEdit.jsx와 동일하게 또는 공통 파일에서 import) ---
const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const OptionInputGroup = styled.div`
  display: flex;
  align-items: center; // 버튼과 input 높이가 같다면 center가 보기 좋습니다.
  margin-bottom: 0.75rem;

  input {
    flex-grow: 1;
    margin-right: 0.5rem;
  }
`;

// ActionButtons 스타일 (버튼 오른쪽 정렬 및 간격)
const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end; // 버튼들을 오른쪽으로 정렬
  align-items: center;      // 버튼들의 수직 정렬 (옵션 추가 버튼과 높이 맞출 때 유용)
  gap: 0.75rem;             // 버튼 사이의 간격
  margin-top: 2rem;
`;

const AddOptionButton = styled(PrimaryButton)`
  background-color: #5cb85c; // Green
  &:hover {
    background-color: #4cae4c;
  }
  // 다른 버튼들과 크기 일관성을 위해 CommonStyles의 BaseButton 스타일 참조
  padding: 0.6rem 1.2rem; // BaseButton과 동일한 패딩
  font-size: 1rem;       // BaseButton과 동일한 폰트 크기
  // height: 38px; // 필요하다면 다른 버튼과 동일한 고정 높이 사용 (개발자 도구로 확인)
`;

const RemoveOptionButton = styled(DangerButton)`
  font-size: 0.85rem;
  line-height: 1;
  padding: 0 0.7rem;
  min-width: auto;
  white-space: nowrap;
  height: 38px; // 예시 값: CommonStyles.Input의 최종 높이에 맞춰야 합니다. (개발자 도구로 확인)
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 투표 유형 선택을 위한 Select 스타일
const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 0px; // FormField에서 이미 margin-bottom을 주고 있으므로 0으로 설정하거나 FormField의 margin 조정
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  height: auto; // Input과 높이를 맞추기 위해 padding 기반으로 자동 조절되도록
                 // 또는 Input과 동일한 고정 height 값을 줄 수 있음 (예: 38px + border 고려)
`;
// --- 여기까지 Styled Components ---


const PollCreate = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
  const [pollType, setPollType] = useState('singleChoice'); // 투표 유형 상태, 기본값 'singleChoice'

  if (!user) {
    toast.info('투표를 만들려면 로그인이 필요합니다.');
    navigate('/login');
    return null;
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, { text: '' }]);
    } else {
      toast.warn('옵션은 최대 10개까지 추가할 수 있습니다.');
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    } else {
      toast.warn('옵션은 최소 2개 이상이어야 합니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warn('투표 제목을 입력해주세요.');
      return;
    }
    const validOptions = options.filter(opt => opt.text.trim() !== '');
    if (validOptions.length < 2) {
      toast.warn('최소 2개 이상의 유효한 옵션을 입력해주세요.');
      return;
    }

    const newPoll = {
      title: title.trim(),
      pollType: pollType, // 선택된 투표 유형 저장
      options: validOptions.map((opt, index) => ({
        id: `opt_${Date.now()}_${index}`, // 좀 더 나은 ID 생성 방식 고려
        text: opt.text.trim(),
        votes: 0,
      })),
      author: user.name,
      createdAt: new Date().toISOString(),
      totalVotes: 0, // 초기 totalVotes
    };

    try {
      const response = await axios.post('http://localhost:8888/api/polls', newPoll);
      toast.success('새로운 투표가 생성되었습니다!');
      navigate(`/polls/${response.data.id}`);
    } catch (error) {
      toast.error('투표 생성 중 오류가 발생했습니다.');
      console.error("Failed to create poll:", error);
    }
  };

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <Title>새 설문/투표 만들기</Title>
          <form onSubmit={handleSubmit}>
            <FormField>
              <Label htmlFor="poll-title">제목</Label>
              <Input
                id="poll-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="설문/투표 제목을 입력하세요"
              />
            </FormField>

            <FormField>
              <Label htmlFor="poll-type">질문 유형</Label>
              <Select
                id="poll-type"
                value={pollType}
                onChange={(e) => setPollType(e.target.value)}
              >
                <option value="singleChoice">객관식 (단일 선택)</option>
                <option value="multipleChoice">객관식 (다중 선택)</option>
                {/* 여기에 나중에 "주관식 단답형" 등 추가 가능 */}
              </Select>
            </FormField>

            <FormField>
              <Label>선택 옵션</Label>
              {options.map((option, index) => (
                <OptionInputGroup key={`option-${index}`}> {/* key를 좀 더 안정적으로 */}
                  <Input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`옵션 ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <RemoveOptionButton type="button" onClick={() => handleRemoveOption(index)}>
                      삭제
                    </RemoveOptionButton>
                  )}
                </OptionInputGroup>
              ))}
            </FormField>

            <ActionButtons>
              {options.length < 10 && (
                <AddOptionButton type="button" onClick={handleAddOption}>
                  옵션 추가
                </AddOptionButton>
              )}
              <PrimaryButton type="submit">생성하기</PrimaryButton>
              <DangerButton type="button" onClick={() => navigate('/')}>취소</DangerButton>
            </ActionButtons>
          </form>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollCreate;