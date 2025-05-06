// src/pages/poll/PollDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import useUserStore from '../../store/useUserStore';
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton, DangerButton } from '../../components/CommonStyles'; // DangerButton은 나중에 "투표 삭제"에 사용 가능

const PollTitle = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
`;

const OptionItem = styled.li`
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: #f0f0f0;
  }

  &.selected {
    background-color: #e0eafc; /* Light blue for selected */
    border-color: #337ab7;
  }
`;

const OptionText = styled.span`
  font-size: 1.1rem;
`;

const VoteCount = styled.span`
  font-size: 0.9rem;
  color: #555;
  background-color: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const TotalVotes = styled.p`
  text-align: right;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;


const PollDetail = () => {
  const { id: pollId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [poll, setPoll] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false); // 간단한 중복 투표 방지 (로컬 상태)

  const fetchPoll = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/polls/${pollId}`);
      setPoll(res.data);
      // 사용자가 이미 투표했는지 로컬스토리지 등에서 확인하는 로직 (선택 사항)
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls')) || {};
      if (votedPolls[pollId]) {
        setHasVoted(true);
        setSelectedOptionId(votedPolls[pollId]); // 이전에 선택한 옵션 표시
      }
    } catch (error) {
      toast.error('투표 정보를 불러오지 못했습니다.');
      console.error("Failed to fetch poll:", error);
      navigate('/'); // 또는 PollList 페이지로
    }
  };

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const handleOptionSelect = (optionId) => {
    if (!hasVoted) {
      setSelectedOptionId(optionId);
    }
  };

  const handleVote = async () => {
    if (!user) {
      toast.warn('투표하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!selectedOptionId) {
      toast.warn('투표할 항목을 선택해주세요.');
      return;
    }
    if (hasVoted) {
      toast.info('이미 이 투표에 참여하셨습니다.');
      return;
    }

    try {
      const updatedOptions = poll.options.map(opt =>
        opt.id === selectedOptionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      const updatedPoll = {
        ...poll,
        options: updatedOptions,
        totalVotes: poll.totalVotes + 1,
      };

      await axios.put(`http://localhost:3001/polls/${pollId}`, updatedPoll);
      setPoll(updatedPoll);
      setHasVoted(true); // 투표 완료 상태로 변경

      // 로컬스토리지에 투표 기록 저장 (간단한 중복 방지)
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls')) || {};
      votedPolls[pollId] = selectedOptionId;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));

      toast.success('투표가 완료되었습니다!');
    } catch (error) {
      toast.error('투표 처리 중 오류가 발생했습니다.');
      console.error("Failed to vote:", error);
    }
  };

  if (!poll) return <PageWrapper><PageInner><Container><p>투표 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <PollTitle>{poll.title}</PollTitle>
          <OptionList>
            {poll.options.map((option) => (
              <OptionItem
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={selectedOptionId === option.id && !hasVoted ? 'selected' : ''}
                style={{ cursor: hasVoted ? 'default' : 'pointer' }}
              >
                <OptionText>{option.text}</OptionText>
                { (hasVoted || selectedOptionId === option.id) && <VoteCount>{option.votes} 표</VoteCount> }
              </OptionItem>
            ))}
          </OptionList>
          <TotalVotes>총 {poll.totalVotes} 표</TotalVotes>
          <ButtonGroup>
            {!hasVoted && (
              <PrimaryButton onClick={handleVote} disabled={!selectedOptionId || hasVoted}>
                투표하기
              </PrimaryButton>
            )}
            {hasVoted && (
              <p style={{color: 'green', fontWeight: 'bold'}}>투표 완료!</p>
            )}
            <PrimaryButton onClick={() => navigate('/')}>목록으로</PrimaryButton>
          </ButtonGroup>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollDetail;