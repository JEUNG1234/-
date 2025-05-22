import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Container, PrimaryButton } from '../components/CommonStyles';
import { PageWrapper, PageInner } from "../components/PageLayout"; // 수정

const PostItem = styled.li`
  border-bottom: 1px solid #ddd;
  padding: 1rem 0;

  a {
    font-size: 1.1rem;
    color: #0070f3;
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
  color: #333;
`;

const BoardList = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await axios.get('http://localhost:8888/api/boards');
    setPosts(res.data.reverse());
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <PageWrapper> {/* 수정 */}
      <PageInner>   {/* 수정 */}
        <Container>
          <HeaderGroup>
            <Title>게시판</Title>
            <PrimaryButton as={Link} to="/board/new">
              글쓰기
            </PrimaryButton>
          </HeaderGroup>

          <ul>
            {posts.map((post) => (
              <PostItem key={post.id}>
                <Link to={`/board/${post.id}`}>{post.title}</Link>
                <small>{post.author} · {new Date(post.createdAt).toLocaleString()}</small>
              </PostItem>
            ))}
          </ul>
        </Container>
      </PageInner>  
    </PageWrapper>
  );
};

export default BoardList;