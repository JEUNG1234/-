import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

const Container = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  padding: 1rem;
`;

const PostCard = styled.div`
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.06);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const Body = styled.p`
  color: #555;
`;

const Author = styled.span`
  display: block;
  text-align: right;
  font-size: 0.9rem;
  color: #888;
`;

const BoardList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('게시글 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <Container style={{ textAlign: 'center' }}>
        <ClipLoader color="#36d7b7" />
      </Container>
    );
  }

  return (
    <Container>
      <h2>📋 게시글 목록</h2>
      {posts.map((post) => (
        <PostCard key={post.id}>
          <Title>{post.title}</Title>
          <Body>{post.body}</Body>
          <Author>작성자: {post.author}</Author>
        </PostCard>
      ))}
    </Container>
  );
};

export default BoardList;
