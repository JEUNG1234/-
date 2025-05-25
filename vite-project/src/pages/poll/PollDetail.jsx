// src/pages/poll/PollDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { format } from 'date-fns';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton, DangerButton } from '../../components/CommonStyles';

const PollTitle = styled.h2`
  font-size: 1.8rem;
  color: ${props => props.theme.colors.text || '#333'};
  margin-bottom: 0.75rem;
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight || '#eee'};
`;

const PollMeta = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary || '#666'};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const PollTypeInfo = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary || '#555'};
  margin-bottom: 2rem;
  font-style: italic;
  font-size: 0.9em;
`;

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
`;

const OptionResultItem = styled.li`
  background: ${props => props.theme.colors.surfaceLight || '#f9f9f9'};
  border: 1px solid ${props => props.theme.colors.borderLight || '#eee'};
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.small};
`;

const OptionTextWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
`;

const OptionText = styled.span`
  font-size: 1rem;
  color: ${props => props.theme.colors.text || '#333'};
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
  color: ${props => props.theme.colors.textSecondary || '#555'};
  margin-left: 0.5rem;
  white-space: nowrap;
`;

const ResultBarBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.colors.borderLight || '#e9ecef'};
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  z-index: 0;
`;

const ResultBarForeground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${props => props.theme.colors.primary || 'royalblue'};
  opacity: 0.6;
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  transition: width 0.5s ease-in-out;
  z-index: 1;
  width: ${props => props.$percentage}%;
`;

const OptionSelectableLabel = styled.label`
  background: ${props => props.theme.colors.surface || '#fff'};
  border: 1px solid ${props => props.theme.colors.border || '#ccc'};
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${props => props.theme.colors.surfaceLight || '#f0f0f0'};
    border-color: ${props => props.theme.colors.primary || 'royalblue'};
  }

  input[type="radio"], input[type="checkbox"] {
    margin-right: 0.8rem;
    transform: scale(1.1);
    accent-color: ${props => props.theme.colors.primary || 'royalblue'};
  }
  &.selected {
    border-color: ${props => props.theme.colors.primary || 'royalblue'};
    background-color: #e6f0ff;
  }
`;

const TotalVotesText = styled.p` // Renamed from TotalVotes to avoid conflict
  text-align: right;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.text || '#333'};
`;

const AuthorActionsGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const UserActionsGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight || '#eee'};
  min-height: 38px;
`;

const PollDetail = () => {
  const { id: pollId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [poll, setPoll] = useState(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isDeletingPoll, setIsDeletingPoll] = useState(false);

  const fetchPoll = useCallback(async () => {
    if (!pollId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/polls/${pollId}`);
      setPoll(res.data);
      const votedPollsData = JSON.parse(localStorage.getItem('votedPolls')) || {};
      if (user && votedPollsData[pollId] && votedPollsData[pollId].userId === user.id) {
        setHasVoted(true);
        setSelectedOptionIds(Array.isArray(votedPollsData[pollId].selected) ? votedPollsData[pollId].selected : [votedPollsData[pollId].selected].filter(Boolean));
      } else {
        setHasVoted(false);
        setSelectedOptionIds([]);
      }
    } catch (error) {
      toast.error('투표 정보를 불러오지 못했습니다.');
      console.error("Failed to fetch poll:", error);
      if (error.response && error.response.status === 404) {
        navigate('/404');
      } else {
        navigate('/polls'); // 목록으로 이동
      }
    } finally {
      setIsLoading(false);
    }
  }, [pollId, navigate, user]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  const handleOptionSelect = (optionId) => {
    if (!poll || hasVoted || (user && poll.authorId === user?.id)) return;

    if (poll.pollType === 'multipleChoice') {
      setSelectedOptionIds(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptionIds([optionId]);
    }
  };

  const handleVote = async () => {
    if (!user || !user.id) {
      toast.warn('투표하려면 로그인이 필요합니다.');
      navigate('/login', { state: { from: `/polls/${pollId}` } });
      return;
    }
    if (user.id === poll?.authorId) {
      toast.info('자신이 만든 투표에는 투표할 수 없습니다.');
      return;
    }
    if (selectedOptionIds.length === 0) {
      toast.warn('투표할 항목을 선택해주세요.');
      return;
    }
    if (hasVoted) {
      toast.info('이미 이 투표에 참여하셨습니다.');
      return;
    }

    setIsSubmittingVote(true);
    const voteData = {
      selectedOptionIds: selectedOptionIds,
    };

    try {
      const response = await axios.post(`http://localhost:8888/api/polls/${pollId}/vote`, voteData, {
        headers: {
          'X-USER-ID': user.id
        }
      });
      setPoll(response.data);
      setHasVoted(true);

      const votedPolls = JSON.parse(localStorage.getItem('votedPolls')) || {};
      votedPolls[pollId] = { userId: user.id, selected: selectedOptionIds };
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));

      toast.success('투표가 완료되었습니다!');
    } catch (error) {
      console.error("투표 처리 중 오류 발생:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          toast.error('투표 권한이 없습니다.');
      } else {
          toast.error(error.response?.data?.message || '투표 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleDeletePoll = async () => {
    if (!user || !user.id || user.id !== poll?.authorId) {
        toast.error('투표 삭제 권한이 없습니다.');
        return;
    }
    if (window.confirm('정말로 이 투표를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setIsDeletingPoll(true);
      try {
        await axios.delete(`http://localhost:8888/api/polls/${pollId}`, {
          headers: {
            'X-USER-ID': user.id
          }
        });
        toast.success('투표가 삭제되었습니다.');
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls')) || {};
        delete votedPolls[pollId];
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
        navigate('/polls');
      } catch (error) {
        console.error("투표 삭제 중 오류 발생:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            toast.error('투표 삭제 권한이 없습니다.');
        } else {
            toast.error(error.response?.data?.message || '투표 삭제 중 오류가 발생했습니다.');
        }
      } finally {
        setIsDeletingPoll(false);
      }
    }
  };

  if (isLoading || !poll) {
    return <PageWrapper><PageInner><Container><p>투표 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  const isAuthor = user && poll && user.id === poll.authorId;
  const pollTypeDescription = poll.pollType === 'multipleChoice' ? '객관식 (다중 선택 가능)' : '객관식 (단일 선택)';

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <PollTitle>{poll.title}</PollTitle>
          <PollMeta>
            작성자: {poll.authorName} | 생성일: {format(new Date(poll.createdAt), 'yyyy-MM-dd HH:mm')}
          </PollMeta>
          <PollTypeInfo>{pollTypeDescription}</PollTypeInfo>

          {isAuthor && (
            <AuthorActionsGroup>
              <PrimaryButton
                as={Link}
                to={`/polls/edit/${pollId}`}
                style={{backgroundColor: '#ffc107', borderColor: '#ffc107', color: '#212529'}}
                disabled={isDeletingPoll || isSubmittingVote}
              >
                수정
              </PrimaryButton>
              <DangerButton onClick={handleDeletePoll} disabled={isDeletingPoll || isSubmittingVote}>
                {isDeletingPoll ? '삭제 중...' : '삭제'}
              </DangerButton>
            </AuthorActionsGroup>
          )}

          <OptionList>
            {poll.options.map((option) => {
              const percentageValue = poll.totalVotes > 0 && option.votes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
              const isSelectedByCurrentUserForDisplay = hasVoted && selectedOptionIds.includes(option.id); // 결과 표시 시 사용

              if (hasVoted || isAuthor) {
                return (
                  <OptionResultItem key={option.id}>
                    <ResultBarBackground />
                    <ResultBarForeground $percentage={percentageValue} />
                    <OptionTextWrapper>
                      <OptionText>
                        {option.text}
                        {isSelectedByCurrentUserForDisplay && !isAuthor && ( // 작성자가 아니고, 투표했고, 해당 옵션을 선택했다면
                          <span style={{color: 'green', marginLeft: '8px', fontWeight:'bold'}}> (내 선택)</span>
                        )}
                      </OptionText>
                      <div>
                        <VoteCount>{option.votes || 0} 표</VoteCount>
                        <PercentageText>({percentageValue.toFixed(1)}%)</PercentageText>
                      </div>
                    </OptionTextWrapper>
                  </OptionResultItem>
                );
              } else {
                return (
                  <OptionSelectableLabel key={option.id} htmlFor={`option-${option.id}`} className={selectedOptionIds.includes(option.id) ? 'selected' : ''}>
                    <input
                      type={poll.pollType === 'multipleChoice' ? 'checkbox' : 'radio'}
                      id={`option-${option.id}`}
                      name={poll.pollType === 'singleChoice' ? `poll-${pollId}` : `poll-option-${option.id}`} // 라디오 버튼 그룹명 일치
                      value={option.id} // 옵션의 DB ID
                      checked={selectedOptionIds.includes(option.id)}
                      onChange={() => handleOptionSelect(option.id)}
                      disabled={hasVoted || isAuthor || isSubmittingVote}
                    />
                    <OptionText>{option.text}</OptionText>
                  </OptionSelectableLabel>
                );
              }
            })}
          </OptionList>

          {poll.totalVotes > 0 && <TotalVotesText>총 {poll.totalVotes || 0} 표</TotalVotesText>}

          <UserActionsGroup>
            {!isAuthor && !hasVoted && (
              <PrimaryButton onClick={handleVote} disabled={selectedOptionIds.length === 0 || isSubmittingVote}>
                {isSubmittingVote ? '투표 중...' : '투표하기'}
              </PrimaryButton>
            )}
            {!isAuthor && hasVoted && user && (
              <p style={{color: 'green', fontWeight: 'bold'}}>투표에 참여해주셔서 감사합니다!</p>
            )}
            {isAuthor && (
                 <p style={{color: '#555', fontWeight: 'bold'}}>내가 만든 투표입니다.</p>
            )}
            <PrimaryButton onClick={() => navigate('/polls')} style={{marginLeft: 'auto'}}>목록으로</PrimaryButton>
          </UserActionsGroup>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollDetail;