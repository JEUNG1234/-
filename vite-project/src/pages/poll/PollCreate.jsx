// src/pages/poll/PollCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, Input, PrimaryButton, DangerButton } from '../../components/CommonStyles';

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: ${props => props.theme.colors.text || '#333'};
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.textSecondary || '#555'};
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
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border || '#eee'};
`;

const AddOptionButton = styled(PrimaryButton)`
  background-color: ${props => props.theme.colors.success || '#5cb85c'};
  &:hover {
    background-color: #4cae4c;
  }
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
`;

const RemoveOptionButton = styled(DangerButton)`
  font-size: 0.85rem;
  line-height: 1.2;
  padding: 0.4rem 0.7rem;
  min-width: auto;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 0;
  border: 1px solid ${props => props.theme.colors.border || '#ccc'};
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  font-size: 1rem;
  background-color: ${props => props.theme.colors.surface || 'white'};
  color: ${props => props.theme.colors.text || '#333'};
  height: auto;
`;

const PollCreate = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
  const [pollType, setPollType] = useState('singleChoice');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    toast.info('투표를 만들려면 로그인이 필요합니다.');
    navigate('/login', { replace: true });
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
    if (!user || !user.id) {
        toast.error('사용자 정보를 찾을 수 없습니다. 다시 로그인 해주세요.');
        navigate('/login');
        return;
    }
    if (!title.trim()) {
      toast.warn('투표 제목을 입력해주세요.');
      return;
    }
    const validOptions = options
        .map(opt => ({ text: opt.text.trim() }))
        .filter(opt => opt.text !== '');

    if (validOptions.length < 2) {
      toast.warn('최소 2개 이상의 유효한 옵션을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const newPollData = {
      title: title.trim(),
      pollType: pollType,
      options: validOptions, // 백엔드 PollDto.Create.CreateOption 은 text만 가짐
    };

    try {
      const response = await axios.post('http://localhost:8888/api/polls', newPollData, {
        headers: {
          'X-USER-ID': user.id
        }
      });
      toast.success('새로운 투표가 생성되었습니다!');
      navigate(`/polls/${response.data.id}`);
    } catch (error) {
      console.error("투표 생성 중 오류 발생:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403) ) {
        toast.error('투표 생성 권한이 없습니다.');
      } else {
        toast.error(error.response?.data?.message || '투표 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <Title>새 투표 만들기</Title>
          <form onSubmit={handleSubmit}>
            <FormField>
              <Label htmlFor="poll-title">제목</Label>
              <Input
                id="poll-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="투표 제목을 입력하세요"
                disabled={isLoading}
              />
            </FormField>

            <FormField>
              <Label htmlFor="poll-type">투표 유형</Label>
              <Select
                id="poll-type"
                value={pollType}
                onChange={(e) => setPollType(e.target.value)}
                disabled={isLoading}
              >
                <option value="singleChoice">객관식 (단일 선택)</option>
                <option value="multipleChoice">객관식 (다중 선택)</option>
              </Select>
            </FormField>

            <FormField>
              <Label>선택 옵션</Label>
              {options.map((option, index) => (
                <OptionInputGroup key={`option-create-${index}`}> {/* 고유한 key */}
                  <Input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`옵션 ${index + 1}`}
                    disabled={isLoading}
                  />
                  {options.length > 2 && (
                    <RemoveOptionButton type="button" onClick={() => handleRemoveOption(index)} disabled={isLoading}>
                      삭제
                    </RemoveOptionButton>
                  )}
                </OptionInputGroup>
              ))}
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              {options.length < 10 && (
                <AddOptionButton type="button" onClick={handleAddOption} disabled={isLoading}>
                  옵션 추가
                </AddOptionButton>
              )}
            </div>

            <ActionButtons>
              <DangerButton type="button" onClick={() => navigate('/polls')} disabled={isLoading}>취소</DangerButton> {/* 목록 페이지로 이동 */}
              <PrimaryButton type="submit" disabled={isLoading}>
                {isLoading ? '생성 중...' : '생성하기'}
              </PrimaryButton>
            </ActionButtons>
          </form>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollCreate;