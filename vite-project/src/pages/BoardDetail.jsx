import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

import useUserStore from '../store/useUserStore';
import {
  Container,
  Input,
  Textarea,
  PrimaryButton,
  DangerButton,
  SuccessButton,
} from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout';

import styled from 'styled-components';

const CommentSection = styled.div`
  margin-top: 2rem;
`;

const CommentList = styled.ul`
  list-style: none;
  padding: 0;
`;

const CommentItem = styled.li`
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f4f4f4;
  border-radius: 6px;
  position: relative;
`;

const CommentAuthor = styled.div`
  font-weight: bold;
`;

const CommentContent = styled.div`
  margin-top: 0.4rem;
`;

const CommentTime = styled.small`
  display: block;
  color: #888;
  margin-top: 0.4rem;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchPost = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/posts/${id}`);
      setPost(res.data);
    } catch {
      toast.error('게시글을 불러오지 못했습니다.');
      navigate('/board');
    }
  };

  const fetchComments = async () => {
    const res = await axios.get(`http://localhost:3001/comments?postId=${id}`);
    setComments(res.data);
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const handleDelete = async () => {
    await axios.delete(`http://localhost:3001/posts/${id}`);
    toast.success('삭제되었습니다.');
    navigate('/board');
  };

  const handleCommentSubmit = async () => {
    if (!user) return toast.warning('로그인이 필요합니다.');
    if (!newComment.trim()) return toast.warning('댓글을 입력하세요.');

    await axios.post('http://localhost:3001/comments', {
      postId: parseInt(id),
      author: user.name,
      content: newComment,
      createdAt: new Date().toISOString(),
    });

    setNewComment('');
    fetchComments();
  };

  const handleCommentDelete = async (commentId) => {
    await axios.delete(`http://localhost:3001/comments/${commentId}`);
    fetchComments();
  };

  const handleEditStart = (comment) => {
    setEditCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditCommentId(null);
    setEditContent('');
  };

  const handleEditSave = async (commentId) => {
    await axios.put(`http://localhost:3001/comments/${commentId}`, {
      ...comments.find((c) => c.id === commentId),
      content: editContent,
    });
    setEditCommentId(null);
    setEditContent('');
    fetchComments();
  };

  if (!post) return null;

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <h2>{post.title}</h2>
          <p style={{ lineHeight: '1.7', marginBottom: '2rem' }}>{post.body}</p>

          {user?.name === post.author && (
            <ActionGroup>
              <PrimaryButton onClick={() => navigate(`/board/edit/${id}`)}>수정</PrimaryButton>
              <DangerButton onClick={handleDelete}>삭제</DangerButton>
            </ActionGroup>
          )}

          <PrimaryButton onClick={() => navigate('/board')} style={{ marginTop: '1rem' }}>
            목록으로
          </PrimaryButton>

          <CommentSection>
            <h3>댓글 ({comments.length})</h3>
            <CommentList>
              {comments.map((c) => (
                <CommentItem key={c.id}>
                  <CommentAuthor>{c.author}</CommentAuthor>

                  {editCommentId === c.id ? (
                    <>
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <ActionGroup>
                        <SuccessButton onClick={() => handleEditSave(c.id)}>저장</SuccessButton>
                        <DangerButton onClick={handleEditCancel}>취소</DangerButton>
                      </ActionGroup>
                    </>
                  ) : (
                    <>
                      <CommentContent>{c.content}</CommentContent>
                      <CommentTime>
                        {c.createdAt && !isNaN(Date.parse(c.createdAt))
                          ? format(new Date(c.createdAt), 'yyyy-MM-dd HH:mm')
                          : '날짜 없음'}
                      </CommentTime>
                      {user?.name === c.author && (
                        <ActionGroup>
                          <DangerButton onClick={() => handleCommentDelete(c.id)}>삭제</DangerButton>
                          <PrimaryButton onClick={() => handleEditStart(c)}>수정</PrimaryButton>
                        </ActionGroup>
                      )}
                    </>
                  )}
                </CommentItem>
              ))}
            </CommentList>

            <Textarea
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <SuccessButton onClick={handleCommentSubmit}>댓글 등록</SuccessButton>
          </CommentSection>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default BoardDetail;
