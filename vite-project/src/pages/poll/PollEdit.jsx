// src/pages/poll/PollEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, Input, PrimaryButton, DangerButton } from '../../components/CommonStyles';

// --- Styled-components 정의 (PollCreate.jsx와 동일하게 또는 공통 파일에서 import) ---
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
  align-items: center;
  margin-bottom: 0.75rem;

  input {
    flex-grow: 1;
    margin-right: 0.5rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const AddOptionButton = styled(PrimaryButton)`
  background-color: #5cb85c;
  &:hover {
    background-color: #4cae4c;
  }
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
`;

const RemoveOptionButton = styled(DangerButton)`
  font-size: 0.85rem;
  line-height: 1;
  padding: 0 0.7rem;
  min-width: auto;
  white-space: nowrap;
  height: 38px; // 실제 Input 높이에 맞춰야 합니다.
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 투표 유형 선택을 위한 Select 스타일 (PollCreate.jsx와 동일)
const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 0px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  height: auto;
`;
// --- 여기까지 Styled-components 정의 ---


const PollEdit = () => {
  const { id: pollId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  const [options, setOptions] = useState([]); // { id, text, votes } 형태
  const [pollType, setPollType] = useState('singleChoice'); // 투표 유형 상태 추가
  const [originalPollData, setOriginalPollData] = useState(null);

  useEffect(() => {
    const fetchPollData = async () => {
      if (!pollId) return;
      try {
        const res = await axios.get(`http://localhost:3001/polls/${pollId}`);
        const pollData = res.data;

        if (!user || user.name !== pollData.author) {
          toast.error('수정 권한이 없습니다.');
          navigate(`/polls/${pollId}`);
          return;
        }
        setOriginalPollData(pollData);
        setTitle(pollData.title);
        setPollType(pollData.pollType || 'singleChoice'); // pollType 불러오기, 없으면 기본값
        setOptions(pollData.options.map(opt => ({ ...opt })));
      } catch (error) {
        toast.error('투표 정보를 불러오는데 실패했습니다.');
        console.error("Failed to fetch poll data for edit:", error);
        navigate('/');
      }
    };

    if (!user) {
      toast.info('수정하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    fetchPollData();
  }, [pollId, user, navigate]);


  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: `new_opt_${Date.now()}_${options.length}`, text: '', votes: 0 }]);
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
    const validOptionsFromForm = options.filter(opt => opt.text.trim() !== '');
    if (validOptionsFromForm.length < 2) {
      toast.warn('최소 2개 이상의 유효한 옵션을 입력해주세요.');
      return;
    }

    const updatedPollData = {
      ...originalPollData,
      title: title.trim(),
      pollType: pollType, // 수정된 pollType 저장
      options: validOptionsFromForm.map(formOpt => {
        const originalOptionMatch = originalPollData.options.find(origOpt => origOpt.id === formOpt.id);
        return {
          id: formOpt.id,
          text: formOpt.text.trim(),
          votes: originalOptionMatch ? originalOptionMatch.votes : (formOpt.votes !== undefined ? formOpt.votes : 0),
        };
      }),
    };
    updatedPollData.totalVotes = updatedPollData.options.reduce((sum, opt) => sum + opt.votes, 0);

    try {
      await axios.put(`http://localhost:3001/polls/${pollId}`, updatedPollData);
      toast.success('투표가 수정되었습니다!');
      navigate(`/polls/${pollId}`);
    } catch (error) {
      toast.error('투표 수정 중 오류가 발생했습니다.');
      console.error("Failed to update poll:", error);
    }
  };

  if (!originalPollData || !user || (originalPollData && user.name !== originalPollData.author)) {
    return <PageWrapper><PageInner><Container><p>Loading or checking permissions...</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <Title>투표 수정</Title>
          <form onSubmit={handleSubmit}>
            <FormField>
              <Label htmlFor="poll-title">제목</Label>
              <Input
                id="poll-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="투표 제목을 입력하세요"
              />
            </FormField>

            {/* --- 투표 유형 선택 필드 추가 --- */}
            <FormField>
              <Label htmlFor="poll-type">질문 유형</Label>
              <Select
                id="poll-type"
                value={pollType}
                onChange={(e) => setPollType(e.target.value)}
              >
                <option value="singleChoice">객관식 (단일 선택)</option>
                <option value="multipleChoice">객관식 (다중 선택)</option>
              </Select>
            </FormField>
            {/* --- 여기까지 투표 유형 선택 --- */}

            <FormField>
              <Label>선택 옵션</Label>
              {options.map((option, index) => (
                <OptionInputGroup key={option.id || `temp-${index}`}>
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
              <PrimaryButton type="submit">
                수정 완료
              </PrimaryButton>
              <DangerButton type="button" onClick={() => navigate(`/polls/${pollId}`)}>
                취소
              </DangerButton>
            </ActionButtons>
          </form>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollEdit;