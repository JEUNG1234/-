import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns'; // 날짜 포맷팅

import { Container, PrimaryButton } from '../components/CommonStyles';
import { PageWrapper, PageInner } from "../components/PageLayout";
import useUserStore from '../store/useUserStore'; // 로그인 상태 확인용
import { toast } from 'react-toastify';

const PostItem = styled.li`
  border-bottom: 1px solid #ddd;
  padding: 1rem 0;

  a {
    font-size: 1.1rem;
    color: ${props => props.theme.colors.primary || '#0070f3'};
    font-weight: bold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  small {
    display: block;
    margin-top: 0.3rem;
    color: #888;
  }
`;

const HeaderGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  color: ${props => props.theme.colors.text ||'#333'};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 0.5rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid ${props => props.theme.colors.border || '#ccc'};
    background-color: ${props => props.theme.colors.surface || '#fff'};
    color: ${props => props.theme.colors.primary || 'royalblue'};
    cursor: pointer;
    border-radius: ${props => props.theme.borderRadius.small || '4px'};

    &:disabled {
      color: #aaa;
      cursor: not-allowed;
      background-color: #f0f0f0;
    }
    &:hover:not(:disabled) {
      background-color: #e9ecef;
    }
  }
  span {
    padding: 0.5rem;
    font-weight: bold;
  }
`;


const BoardList = () => {
  const { user } = useUserStore(); // 글쓰기 버튼 표시 여부 결정용
  const [pageData, setPageData] = useState({
    content: [],
    currentPage: 0,
    totalPage: 0,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPageNumber, setCurrentPageNumber] = useState(0); // 0-based index

  const fetchPosts = useCallback(async (page) => {
    setIsLoading(true);
    try {
      // 백엔드에서 PageResponse<BoardDto.Response>를 반환
      const res = await axios.get(`http://localhost:8888/api/boards?page=${page}&size=5&sort=createDate,desc`);
      setPageData({
        content: res.data.content,
        currentPage: res.data.currentPage,
        totalPage: res.data.totalPage,
        totalCount: res.data.totalCount,
        hasNext: res.data.hasNext,
        hasPrevious: res.data.hasPrevious,
      });
    } catch (error) {
      console.error("게시글 목록 조회 오류:", error);
      toast.error(error.response?.data?.message || "게시글을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPageNumber);
  }, [fetchPosts, currentPageNumber]);

  const handlePageChange = (newPageNumber) => {
    setCurrentPageNumber(newPageNumber);
  };

  if (isLoading) {
    return <PageWrapper><PageInner><Container><p>목록을 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <HeaderGroup>
            <Title>게시판</Title>
            {user && ( // 로그인한 사용자만 글쓰기 버튼 표시
              <PrimaryButton as={Link} to="/board/new">
                글쓰기
              </PrimaryButton>
            )}
          </HeaderGroup>

          {pageData.content.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {pageData.content.map((post) => (
                <PostItem key={post.id}>
                  <Link to={`/board/${post.id}`}>{post.title}</Link>
                  <small>
                    작성자: {post.authorName} &nbsp;&nbsp;|&nbsp;&nbsp;
                    조회수: {post.viewCount} &nbsp;&nbsp;|&nbsp;&nbsp;
                    작성일: {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm')}
                  </small>
                </PostItem>
              ))}
            </ul>
          ) : (
            <p>게시글이 없습니다.</p>
          )}

          {pageData.totalPage > 1 && (
            <PaginationContainer>
              <button
                onClick={() => handlePageChange(currentPageNumber - 1)}
                disabled={!pageData.hasPrevious}
              >
                이전
              </button>
              <span>{pageData.currentPage + 1} / {pageData.totalPage}</span>
              <button
                onClick={() => handlePageChange(currentPageNumber + 1)}
                disabled={!pageData.hasNext}
              >
                다음
              </button>
            </PaginationContainer>
          )}
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default BoardList;