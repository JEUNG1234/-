// src/pages/poll/PollDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton, DangerButton } from '../../components/CommonStyles';

// --- Styled Components ---
const PollTitle = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
`;

const PollTypeInfo = styled.p`
  text-align: center;
  color: #555;
  margin-bottom: 2rem;
  font-style: italic;
`;

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
`;

const OptionResultItem = styled.li`
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
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
  font-size: 1.1rem;
  color: #333;
  word-break: break-word;
`;

const VoteCount = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: #007bff;
  margin-left: 0.5rem;
  white-space: nowrap;
`;

const PercentageText = styled.span`
  font-size: 0.9rem;
  color: #555;
  margin-left: 0.5rem;
  white-space: nowrap;
`;

const ResultBarBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #e9ecef;
  border-radius: 6px;
  z-index: 0;
`;

// "percentage" prop을 transient prop "$percentage"로 변경
const ResultBarForeground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #007bff;
  border-radius: 6px;
  transition: width 0.5s ease-in-out;
  z-index: 1;
  width: ${props => props.$percentage}%;
`;

const OptionSelectableLabel = styled.label`
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f0f0f0;
  }

  input[type="radio"], input[type="checkbox"] {
    margin-right: 0.8rem;
    transform: scale(1.2);
    accent-color: #007bff;
  }
`;

const TotalVotes = styled.p`
  text-align: right;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
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
  margin-top: 1.5rem;
  min-height: 38px;
`;
// --- 여기까지 Styled Components ---


const PollDetail = () => {
  const { id: pollId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [poll, setPoll] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!pollId) return;
      try {
        const res = await axios.get(`http://localhost:3001/polls/${pollId}`);
        setPoll(res.data);
        const votedPollsData = JSON.parse(localStorage.getItem('votedPolls')) || {};
        if (votedPollsData[pollId]) {
          setHasVoted(true);
          const previousSelection = votedPollsData[pollId];
          setSelectedOptions(Array.isArray(previousSelection) ? previousSelection : (previousSelection ? [previousSelection] : []));
        }
      } catch (error) {
        toast.error('투표 정보를 불러오지 못했습니다.');
        console.error("Failed to fetch poll:", error);
        navigate('/');
      }
    };
    fetchPoll();
  }, [pollId, navigate]);

  const handleOptionSelect = (optionId) => {
    if (!poll || hasVoted || (user && poll.author === user.name)) return;

    if (poll.pollType === 'multipleChoice') {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (!user) {
      toast.warn('투표하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (user.name === poll?.author) {
      toast.info('자신이 만든 투표에는 투표할 수 없습니다.');
      return;
    }
    if (selectedOptions.length === 0) {
      toast.warn('투표할 항목을 선택해주세요.');
      return;
    }
    if (hasVoted) {
      toast.info('이미 이 투표에 참여하셨습니다.');
      return;
    }

    try {
      const updatedOptions = poll.options.map(opt => {
        if (selectedOptions.includes(opt.id)) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });

      const finalUpdatedPoll = {
        ...poll,
        options: updatedOptions,
        totalVotes: poll.totalVotes + 1,
      };

      await axios.put(`http://localhost:3001/polls/${pollId}`, finalUpdatedPoll);
      setPoll(finalUpdatedPoll);
      setHasVoted(true);

      const votedPolls = JSON.parse(localStorage.getItem('votedPolls')) || {};
      votedPolls[pollId] = selectedOptions;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));

      toast.success('투표가 완료되었습니다!');
    } catch (error) {
      toast.error('투표 처리 중 오류가 발생했습니다.');
      console.error("Failed to vote:", error);
    }
  };

  const handleDeletePoll = async () => {
    if (!user || user.name !== poll?.author) {
        toast.error('삭제 권한이 없습니다.');
        return;
    }
    if (window.confirm('정말로 이 투표를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await axios.delete(`http://localhost:3001/polls/${pollId}`);
        toast.success('투표가 삭제되었습니다.');
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls')) || {};
        delete votedPolls[pollId];
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
        navigate('/');
      } catch (error) {
        toast.error('투표 삭제 중 오류가 발생했습니다.'); // toast 추가
        console.error("Failed to delete poll:", error);
      }
    }
  };

  if (!poll) {
    return <PageWrapper><PageInner><Container><p>투표 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  const isAuthor = user && user.name === poll.author;
  const pollTypeDescription = poll.pollType === 'multipleChoice' ? '객관식 (다중 선택 가능)' : '객관식 (단일 선택)';

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <PollTitle>{poll.title}</PollTitle>
          <PollTypeInfo>{pollTypeDescription}</PollTypeInfo>

          {isAuthor && (
            <AuthorActionsGroup>
              <PrimaryButton
                as={Link}
                to={`/polls/edit/${pollId}`}
                style={{backgroundColor: '#ffc107', borderColor: '#ffc107', color: '#212529'}}
              >
                수정
              </PrimaryButton>
              <DangerButton onClick={handleDeletePoll}>
                삭제
              </DangerButton>
            </AuthorActionsGroup>
          )}

          <OptionList>
            {poll.options.map((option) => {
              const percentageValue = poll.totalVotes > 0 && option.votes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
              if (hasVoted || isAuthor) {
                const isSelectedByCurrentUser = selectedOptions.includes(option.id);
                return (
                  <OptionResultItem key={option.id}>
                    <ResultBarBackground />
                    {/* ResultBarForeground에 전달하는 prop을 $percentage로 변경 */}
                    <ResultBarForeground $percentage={percentageValue} />
                    <OptionTextWrapper>
                      <OptionText>
                        {option.text}
                        {hasVoted && isSelectedByCurrentUser && user && !isAuthor && (
                          <span style={{color: 'green', marginLeft: '8px', fontWeight:'bold'}}> (내 선택)</span>
                        )}
                      </OptionText>
                      <div>
                        <VoteCount>{option.votes} 표</VoteCount>
                        <PercentageText>({percentageValue.toFixed(1)}%)</PercentageText>
                      </div>
                    </OptionTextWrapper>
                  </OptionResultItem>
                );
              } else {
                return (
                  <OptionSelectableLabel key={option.id} htmlFor={`option-${option.id}`}>
                    <input
                      type={poll.pollType === 'multipleChoice' ? 'checkbox' : 'radio'}
                      id={`option-${option.id}`}
                      name={poll.pollType === 'singleChoice' ? `poll-${pollId}` : `poll-option-${option.id}-${pollId}`}
                      value={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionSelect(option.id)}
                      disabled={hasVoted || isAuthor}
                    />
                    <OptionText>{option.text}</OptionText>
                  </OptionSelectableLabel>
                );
              }
            })}
          </OptionList>

          {poll.totalVotes > 0 && <TotalVotes>총 {poll.totalVotes} 표</TotalVotes>}

          <UserActionsGroup>
            {!isAuthor && !hasVoted && (
              <PrimaryButton onClick={handleVote} disabled={selectedOptions.length === 0}>
                투표하기
              </PrimaryButton>
            )}
            {!isAuthor && hasVoted && user && (
              <p style={{color: 'green', fontWeight: 'bold'}}>투표에 참여해주셔서 감사합니다!</p>
            )}
            {isAuthor && (
                 <p style={{color: '#555', fontWeight: 'bold'}}>내가 만든 투표입니다.</p>
            )}
            <PrimaryButton onClick={() => navigate('/')} style={{marginLeft: !isAuthor && !hasVoted ? '0' : 'auto'}}>목록으로</PrimaryButton>
          </UserActionsGroup>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollDetail;