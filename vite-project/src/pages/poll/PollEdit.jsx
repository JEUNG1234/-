// src/pages/poll/PollEdit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
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

const PollEdit = () => {
  const { id: pollId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  // options 상태: { id (DB ID 또는 임시 ID 'new_xxx'), text, votes (기존 값) }
  const [options, setOptions] = useState([]);
  const [pollType, setPollType] = useState('singleChoice');
  const [originalAuthorId, setOriginalAuthorId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPollData = useCallback(async () => {
    if (!pollId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/polls/${pollId}`);
      const pollData = res.data;

      if (!user || user.id !== pollData.authorId) {
        toast.error('투표 수정 권한이 없습니다.');
        navigate(`/polls/${pollId}`);
        return;
      }
      setOriginalAuthorId(pollData.authorId);
      setTitle(pollData.title);
      setPollType(pollData.pollType || 'singleChoice');
      setOptions(pollData.options.map(opt => ({ id: opt.id, text: opt.text, votes: opt.votes || 0 })));
    } catch (error) {
      toast.error('투표 정보를 불러오는데 실패했습니다.');
      console.error("Failed to fetch poll data for edit:", error);
      if (error.response && error.response.status === 404) {
        navigate('/404');
      } else {
        navigate('/polls');
      }
    } finally {
      setIsLoading(false);
    }
  }, [pollId, user, navigate]);

  useEffect(() => {
    if (!user) {
      toast.info('수정하려면 로그인이 필요합니다.');
      navigate('/login', { replace: true });
      return;
    }
    fetchPollData();
  }, [user, navigate, fetchPollData]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: `new_${uuidv4()}`, text: '', votes: 0 }]);
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
    if (!user || user.id !== originalAuthorId) {
        toast.error('투표 수정 권한이 없습니다.');
        return;
    }
    if (!title.trim()) {
      toast.warn('투표 제목을 입력해주세요.');
      return;
    }
    // 백엔드 PollDto.Update의 options는 List<CreateOption> (text만 포함)
    // 하지만, 실제 votes를 보존하려면 백엔드 DTO와 서비스 로직 수정이 필요.
    // 여기서는 프론트에서 text만 보내고, 백엔드에서 기존 옵션과 매칭하여 votes를 보존하거나
    // 혹은 백엔드에서 votes를 초기화하는 정책을 따름 (현재 백엔드 코드는 votes 초기화 가능성 있음)
    const optionsToSend = options
        .map(opt => ({ text: opt.text.trim() })) // id와 votes 정보는 백엔드에서 기존것과 매칭하여 처리하도록 기대 (또는 백엔드 수정)
        .filter(opt => opt.text !== '');


    if (optionsToSend.length < 2) {
      toast.warn('최소 2개 이상의 유효한 옵션을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const updatedPollData = {
      title: title.trim(),
      pollType: pollType,
      options: optionsToSend,
    };

    try {
      await axios.put(`http://localhost:8888/api/polls/${pollId}`, updatedPollData, {
        headers: {
          'X-USER-ID': user.id
        }
      });
      toast.success('투표가 성공적으로 수정되었습니다!');
      navigate(`/polls/${pollId}`);
    } catch (error) {
      console.error("투표 수정 중 오류 발생:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error('투표 수정 권한이 없습니다.');
      } else {
        toast.error(error.response?.data?.message || '투표 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageWrapper><PageInner><Container><p>투표 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }
  if (!user || user.id !== originalAuthorId) {
    return <PageWrapper><PageInner><Container><p>접근 권한이 없습니다.</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <Title>투표 수정</Title>
          <form onSubmit={handleSubmit}>
            <FormField>
              <Label htmlFor="poll-edit-title">제목</Label>
              <Input
                id="poll-edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="투표 제목을 입력하세요"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField>
              <Label htmlFor="poll-edit-type">투표 유형</Label>
              <Select
                id="poll-edit-type"
                value={pollType}
                onChange={(e) => setPollType(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="singleChoice">객관식 (단일 선택)</option>
                <option value="multipleChoice">객관식 (다중 선택)</option>
              </Select>
            </FormField>

            <FormField>
              <Label>선택 옵션</Label>
              {options.map((option, index) => (
                <OptionInputGroup key={option.id || `edit-temp-${index}`}>
                  <Input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`옵션 ${index + 1}`}
                    disabled={isSubmitting}
                  />
                  {options.length > 2 && (
                    <RemoveOptionButton type="button" onClick={() => handleRemoveOption(index)} disabled={isSubmitting}>
                      삭제
                    </RemoveOptionButton>
                  )}
                </OptionInputGroup>
              ))}
            </FormField>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                {options.length < 10 && (
                    <AddOptionButton type="button" onClick={handleAddOption} disabled={isSubmitting}>
                    옵션 추가
                    </AddOptionButton>
                )}
            </div>

            <ActionButtons>
              <DangerButton type="button" onClick={() => navigate(`/polls/${pollId}`)} disabled={isSubmitting}>취소</DangerButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? '수정 중...' : '수정 완료'}
              </PrimaryButton>
            </ActionButtons>
          </form>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollEdit;