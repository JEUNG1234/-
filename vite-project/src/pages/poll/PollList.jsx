// src/pages/poll/PollList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify'; // toast import 추가
import { PageWrapper, PageInner } from '../../components/PageLayout';
import { Container, PrimaryButton } from '../../components/CommonStyles';
import useUserStore from '../../store/useUserStore';

// --- Styled Components ---
const PollItem = styled.li`
  background: #fff;
  border: 1px solid #eee;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  a {
    font-size: 1.2rem;
    color: #337ab7;
    font-weight: bold;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  small {
    display: block;
    margin-top: 0.5rem;
    color: #777;
  }
`;

const HeaderGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const MainTitle = styled.h2`
  font-size: 2rem;
  color: #222;
  text-align: center;
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.6rem;
  color: #333;
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
`;

const HotPollItem = styled(PollItem)`
  border-left: 5px solid #ffc107;
  background-color: #fffaf0;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NoPollsMessage = styled.p`
  color: #777;
  text-align: center;
  padding: 2rem 0;
`;
// --- 여기까지 Styled Components ---


const PollList = () => {
  const [allPolls, setAllPolls] = useState([]);
  const [hotPolls, setHotPolls] = useState([]);
  const { user } = useUserStore();

  const NUMBER_OF_HOT_POLLS = 3;

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get('http://localhost:3001/polls');
        const pollsData = res.data;

        const sortedAllPolls = [...pollsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllPolls(sortedAllPolls);

        const sortedByVotes = [...pollsData].sort((a, b) => b.totalVotes - a.totalVotes);
        setHotPolls(sortedByVotes.slice(0, NUMBER_OF_HOT_POLLS));

      } catch (error) {
        console.error("Failed to fetch polls:", error);
        toast.error("투표 목록을 불러오는데 실패했습니다."); // toast 사용
      }
    };
    fetchPolls();
  }, []);

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <MainTitle>투표 광장</MainTitle>

          {hotPolls.length > 0 && (
            <section>
              <HeaderGroup>
                <SectionTitle>지금 HOT한 투표!</SectionTitle>
              </HeaderGroup>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {hotPolls.map((poll) => (
                  <HotPollItem key={`hot-${poll.id}`}>
                    <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
                    <small>
                      작성자: {poll.author} · 총 {poll.totalVotes}표
                    </small>
                  </HotPollItem>
                ))}
              </ul>
            </section>
          )}

          <section>
            <HeaderGroup style={{ marginTop: hotPolls.length > 0 ? '3rem' : '0' }}>
              <SectionTitle>전체 투표 목록</SectionTitle>
              {user && (
                <PrimaryButton as={Link} to="/polls/new">
                  새 투표 만들기
                </PrimaryButton>
              )}
            </HeaderGroup>

            {allPolls.length === 0 && hotPolls.length === 0 ? ( // HOT 투표도 없고 전체 투표도 없을 때만
              <NoPollsMessage>진행중인 투표가 없습니다. 첫 번째 투표를 만들어보세요!</NoPollsMessage>
            ) : allPolls.length === 0 && hotPolls.length > 0 ? ( // HOT 투표는 있지만, 추가적인 전체 투표는 없을 때 (사실상 이 경우는 드물거나, allPolls가 hotPolls를 포함하므로 다르게 처리 가능)
              <NoPollsMessage>더 많은 투표를 기다리고 있습니다!</NoPollsMessage>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {allPolls.map((poll) => (
                  <PollItem key={poll.id}>
                    <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
                    <small>
                      작성자: {poll.author} · 총 {poll.totalVotes}표
                    </small>
                  </PollItem>
                ))}
              </ul>
            )}
          </section>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default PollList;