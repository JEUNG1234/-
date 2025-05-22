// src/pages/BoardDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Link 추가
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

import useUserStore from '../store/useUserStore';
import {
  Container,
  Textarea,
  PrimaryButton,
  DangerButton,
  SuccessButton,
} from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout';

import styled from 'styled-components';

const PostTitle = styled.h2`
  font-size: 1.8rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${props => props.theme.colors.borderLight || '#eee'};
`;

const PostMeta = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  span {
    margin-right: 0.75rem;
  }
`;

const PostBody = styled.p`
  line-height: 1.8;
  margin-bottom: 2rem;
  font-size: 1.05rem;
  white-space: pre-wrap;
`;

const CommentSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight || '#eee'};
`;

const CommentSectionTitle = styled.h3`
  font-size: 1.4rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
`;

const CommentList = styled.ul`
  list-style: none;
  padding: 0;
`;

const CommentItem = styled.li`
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: ${props => props.theme.colors.surfaceLight || '#f8f9fa'};
  border: 1px solid ${props => props.theme.colors.borderLight || '#e9ecef'};
  border-radius: ${props => props.theme.borderRadius.medium || '6px'};
  position: relative;
  box-shadow: ${props => props.theme.shadows.small};
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const CommentContent = styled.div`
  margin-top: 0.5rem;
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const CommentTime = styled.small`
  display: block;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.75rem;
  font-size: 0.8rem;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const CommentForm = styled.form`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BoardDetail = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingComment, setIsUpdatingComment] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(null);

  const fetchPost = useCallback(async () => {
    setIsLoadingPost(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/boards/${postId}`);
      setPost(res.data);
    } catch (err) {
      toast.error('게시글을 불러오지 못했습니다.');
      console.error("Failed to fetch post:", err);
      navigate('/board');
    } finally {
      setIsLoadingPost(false);
    }
  }, [postId, navigate]);

  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/comments?postId=${postId}`);
// 또는 백엔드 설계에 따라:
// const res = await axios.get(`http://localhost:8888/api/boards/${postId}/comments`);
      setComments(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) { // 여기가 BoardDetail.jsx:145 (이전 오류 로그 기준)
      toast.error('댓글을 불러오지 못했습니다.');
      console.error("Failed to fetch comments:", err); // AxiosError가 여기서 출력됨
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleDeletePost = async () => {
    if (!user || user.name !== post?.author) {
        toast.error('삭제 권한이 없습니다.');
        return;
    }
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`http://localhost:8888/api/boards/${postId}`);
        toast.success('게시글이 삭제되었습니다.');
        navigate('/board');
      } catch (error) {
        toast.error('게시글 삭제 중 오류가 발생했습니다.');
        console.error("Failed to delete post:", error);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warn('댓글을 작성하려면 로그인이 필요합니다.');
      navigate('/login', { state: { from: `/board/${postId}` } });
      return;
    }
    if (!newComment.trim()) {
      toast.warn('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const commentData = {
        postId: postId, // postId를 문자열 그대로 사용 (db.json의 posts id가 문자열이므로)
        author: user.name,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      };
      await axios.post('http://localhost:8888/api/comments', commentData);
// 또는 백엔드 설계에 따라:
// await axios.post(`http://localhost:8888/api/boards/${postId}/comments`, commentData);
      setNewComment('');
      toast.success('댓글이 등록되었습니다.');
      fetchComments();
    } catch (error) { // 여기가 BoardDetail.jsx:202 (이전 오류 로그 기준)
      toast.error('댓글 등록 중 오류가 발생했습니다.');
      console.error("Failed to submit comment:", error); // AxiosError가 여기서 출력됨
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!user || user.name !== commentToDelete?.author) {
        toast.error('삭제 권한이 없습니다.');
        return;
    }

    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      setIsDeletingComment(commentId);
      try {
        await axios.delete(`http://localhost:8888/api/comments/${commentId}`);
        toast.success('댓글이 삭제되었습니다.');
        fetchComments();
      } catch (error) {
        toast.error('댓글 삭제 중 오류가 발생했습니다.');
        console.error("Failed to delete comment:", error);
      } finally {
        setIsDeletingComment(null);
      }
    }
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
    if (!editContent.trim()) {
      toast.warn('수정할 댓글 내용을 입력해주세요.');
      return;
    }
    const originalComment = comments.find((c) => c.id === commentId);
    if (!originalComment) return;

    setIsUpdatingComment(commentId);
    try {
      const updatedCommentData = {
        ...originalComment,
        content: editContent.trim(),
      };
      await axios.put(`http://localhost:8888/api/comments/${commentId}`, updatedCommentData);
      toast.success('댓글이 수정되었습니다.');
      setEditCommentId(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      toast.error('댓글 수정 중 오류가 발생했습니다.');
      console.error("Failed to update comment:", error);
    } finally {
      setIsUpdatingComment(null);
    }
  };

  if (isLoadingPost || !post) {
    return <PageWrapper><PageInner><Container><p>게시글을 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <PostTitle>{post.title}</PostTitle>
          <PostMeta>
            <span>작성자: {post.author}</span>
            <span>작성일: {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm')}</span>
          </PostMeta>
          <PostBody>{post.body}</PostBody>

          {user?.name === post.author && (
            <ActionGroup style={{ justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <PrimaryButton onClick={() => navigate(`/board/edit/${postId}`)} style={{backgroundColor: '#ffc107', color: '#212529'}}>수정</PrimaryButton>
              <DangerButton onClick={handleDeletePost}>삭제</DangerButton>
            </ActionGroup>
          )}

          <PrimaryButton onClick={() => navigate('/board')} style={{ marginTop: '1rem' }}>
            목록으로
          </PrimaryButton>

          <CommentSection>
            <CommentSectionTitle>댓글 ({comments.length})</CommentSectionTitle>
            {user && (
              <CommentForm onSubmit={handleCommentSubmit}>
                <Textarea
                  placeholder="따뜻한 댓글을 남겨주세요 :)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={isSubmittingComment}
                />
                <SuccessButton type="submit" disabled={isSubmittingComment} style={{alignSelf: 'flex-end'}}>
                  {isSubmittingComment ? '등록 중...' : '댓글 등록'}
                </SuccessButton>
              </CommentForm>
            )}
            {!user && ( // 여기가 BoardDetail.jsx:313 (이전 오류 로그 기준)
                <p style={{fontSize: '0.9em', color: '#777', textAlign: 'center', padding: '1rem', background: '#f9f9f9', borderRadius: '4px'}}>
                    댓글을 작성하려면 <Link to={`/login?from=/board/${postId}`} style={{color: 'royalblue', fontWeight: 'bold'}}>로그인</Link>해주세요.
                </p>
            )}


            {isLoadingComments ? (
              <p>댓글을 불러오는 중...</p>
            ) : comments.length > 0 ? (
              <CommentList style={{marginTop: "2rem"}}>
                {comments.map((c) => (
                  <CommentItem key={c.id}>
                    <CommentAuthor>{c.author}</CommentAuthor>

                    {editCommentId === c.id ? (
                      <>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
                          disabled={isUpdatingComment === c.id}
                        />
                        <ActionGroup>
                          <SuccessButton onClick={() => handleEditSave(c.id)} disabled={isUpdatingComment === c.id}>
                            {isUpdatingComment === c.id ? '저장 중...' : '저장'}
                          </SuccessButton>
                          <DangerButton onClick={handleEditCancel} disabled={isUpdatingComment === c.id}>취소</DangerButton>
                        </ActionGroup>
                      </>
                    ) : (
                      <>
                        <CommentContent>{c.content}</CommentContent>
                        <CommentTime>
                          {c.createdAt && !isNaN(Date.parse(c.createdAt))
                            ? format(new Date(c.createdAt), 'yyyy-MM-dd HH:mm')
                            : '날짜 정보 없음'}
                        </CommentTime>
                        {user?.name === c.author && (
                          <ActionGroup>
                            <PrimaryButton
                                onClick={() => handleEditStart(c)}
                                disabled={isDeletingComment === c.id || !!isUpdatingComment} // 수정: 다른 댓글 수정 중에도 비활성화
                            >
                                수정
                            </PrimaryButton>
                            <DangerButton
                                onClick={() => handleCommentDelete(c.id)}
                                disabled={isDeletingComment === c.id || !!isUpdatingComment} // 수정: 다른 댓글 수정 중에도 비활성화
                            >
                                {isDeletingComment === c.id ? '삭제 중...' : '삭제'}
                            </DangerButton>
                          </ActionGroup>
                        )}
                      </>
                    )}
                  </CommentItem>
                ))}
              </CommentList>
            ) : (
              <p style={{textAlign: 'center', color: '#888', marginTop: '2rem'}}>등록된 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
            )}
          </CommentSection>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default BoardDetail;