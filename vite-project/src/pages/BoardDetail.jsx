// src/pages/BoardDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

// --- Styled Components (기존과 동일) ---
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
// --- Styled Components 끝 ---

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
  const [isDeletingPost, setIsDeletingPost] = useState(false);


  const fetchPost = useCallback(async () => {
    setIsLoadingPost(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/boards/${postId}`);
      setPost(res.data);
    } catch (err) {
      toast.error('게시글을 불러오지 못했습니다.');
      console.error("Failed to fetch post:", err);
      if (err.response && err.response.status === 404) {
        navigate('/404');
      } else {
        navigate('/board');
      }
    } finally {
      setIsLoadingPost(false);
    }
  }, [postId, navigate]);

  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      // 댓글 목록 조회 API 경로 변경
      const res = await axios.get(`http://localhost:8888/api/boards/${postId}/replies`);
      // 백엔드에서 이미 정렬해서 오므로 클라이언트 정렬은 선택사항
      setComments(res.data); // res.data가 List<ReplyDto.Response>라고 가정
    } catch (err) {
      toast.error('댓글을 불러오지 못했습니다.');
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleDeletePost = async () => {
    if (!user || !user.id) {
        toast.error('삭제 권한이 없습니다. 로그인이 필요합니다.');
        navigate('/login');
        return;
    }
    if (user.id !== post?.authorId) {
        toast.error('게시글 삭제 권한이 없습니다.');
        return;
    }

    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      setIsDeletingPost(true);
      try {
        await axios.delete(`http://localhost:8888/api/boards/${postId}`, {
          headers: {
            'X-USER-ID': user.id
          }
        });
        toast.success('게시글이 삭제되었습니다.');
        navigate('/board');
      } catch (error) {
        console.error("Failed to delete post:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            toast.error('게시글 삭제 권한이 없습니다.');
        } else {
            toast.error(error.response?.data?.message || '게시글 삭제 중 오류가 발생했습니다.');
        }
      } finally {
        setIsDeletingPost(false);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      toast.warn('댓글을 작성하려면 로그인이 필요합니다.');
      navigate('/login', { state: { from: `/board/${postId}` } });
      return;
    }
    if (!newComment.trim()) {
      toast.warn('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmittingComment(true);
    // 백엔드 ReplyDto.Create DTO에 맞게 content만 전송
    const commentData = {
      content: newComment.trim(),
    };

    try {
      // 댓글 생성 API 경로 및 헤더 추가
      await axios.post(`http://localhost:8888/api/boards/${postId}/replies`, commentData, {
        headers: {
          'X-USER-ID': user.id
        }
      });
      setNewComment('');
      toast.success('댓글이 등록되었습니다.');
      fetchComments();
    } catch (error) {
      console.error("Failed to submit comment:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error('댓글 작성 권한이 없습니다. 다시 로그인해주세요.');
      } else {
        toast.error(error.response?.data?.message || '댓글 등록 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!user || !user.id || user.id !== commentToDelete?.authorId) {
        toast.error('댓글 삭제 권한이 없습니다.');
        return;
    }

    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      setIsDeletingComment(commentId);
      try {
        // 댓글 삭제 API 경로 및 헤더 추가
        await axios.delete(`http://localhost:8888/api/replies/${commentId}`, {
          headers: {
            'X-USER-ID': user.id
          }
        });
        toast.success('댓글이 삭제되었습니다.');
        fetchComments();
      } catch (error) {
        console.error("Failed to delete comment:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            toast.error('댓글 삭제 권한이 없습니다.');
        } else {
            toast.error(error.response?.data?.message ||'댓글 삭제 중 오류가 발생했습니다.');
        }
      } finally {
        setIsDeletingComment(null);
      }
    }
  };

  const handleEditStart = (comment) => {
    if (!user || !user.id || user.id !== comment?.authorId) {
        toast.error('댓글 수정 권한이 없습니다.');
        return;
    }
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

    if (!user || !user.id || user.id !== originalComment?.authorId) {
        toast.error('댓글 수정 권한이 없습니다.');
        return;
    }

    setIsUpdatingComment(commentId);
    // 백엔드 ReplyDto.Update DTO에 맞게 content만 전송
    const updatedCommentData = {
      content: editContent.trim(),
    };

    try {
      // 댓글 수정 API 경로 및 헤더 추가
      await axios.put(`http://localhost:8888/api/replies/${commentId}`, updatedCommentData, {
        headers: {
          'X-USER-ID': user.id
        }
      });
      toast.success('댓글이 수정되었습니다.');
      setEditCommentId(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      console.error("Failed to update comment:", error);
       if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            toast.error('댓글 수정 권한이 없습니다.');
        } else {
            toast.error(error.response?.data?.message || '댓글 수정 중 오류가 발생했습니다.');
        }
    } finally {
      setIsUpdatingComment(null);
    }
  };

  if (isLoadingPost || !post) {
    return <PageWrapper><PageInner><Container><p>게시글을 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  const isAuthor = user && post && user.id === post.authorId;


  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <PostTitle>{post.title}</PostTitle>
          <PostMeta>
            <span>작성자: {post.authorName}</span>
            <span>작성일: {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm')}</span>
            <span>조회수: {post.viewCount}</span>
          </PostMeta>
          <PostBody>{post.body}</PostBody>

          {isAuthor && (
            <ActionGroup style={{ justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <PrimaryButton
                onClick={() => navigate(`/board/edit/${postId}`)}
                style={{backgroundColor: '#ffc107', color: '#212529'}}
                disabled={isDeletingPost || isSubmittingComment || !!isUpdatingComment || !!isDeletingComment}
              >
                수정
              </PrimaryButton>
              <DangerButton onClick={handleDeletePost} disabled={isDeletingPost || isSubmittingComment || !!isUpdatingComment || !!isDeletingComment}>
                {isDeletingPost ? "삭제 중..." : "삭제"}
              </DangerButton>
            </ActionGroup>
          )}

          <PrimaryButton onClick={() => navigate('/board')} style={{ marginTop: '1rem' }}>
            목록으로
          </PrimaryButton>

          <CommentSection>
            <CommentSectionTitle>댓글 ({comments.length})</CommentSectionTitle>
            {user ? (
              <CommentForm onSubmit={handleCommentSubmit}>
                <Textarea
                  placeholder="따뜻한 댓글을 남겨주세요 :)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={isSubmittingComment || isDeletingPost || !!isUpdatingComment || !!isDeletingComment}
                />
                <SuccessButton type="submit" disabled={isSubmittingComment || isDeletingPost || !!isUpdatingComment || !!isDeletingComment} style={{alignSelf: 'flex-end'}}>
                  {isSubmittingComment ? '등록 중...' : '댓글 등록'}
                </SuccessButton>
              </CommentForm>
            ) : (
                <p style={{fontSize: '0.9em', color: '#777', textAlign: 'center', padding: '1rem', background: '#f9f9f9', borderRadius: '4px'}}>
                    댓글을 작성하려면 <Link to={`/login?state=${encodeURIComponent(JSON.stringify({ from: `/board/${postId}` }))}`} style={{color: 'royalblue', fontWeight: 'bold'}}>로그인</Link>해주세요.
                </p>
            )}


            {isLoadingComments ? (
              <p>댓글을 불러오는 중...</p>
            ) : comments.length > 0 ? (
              <CommentList style={{marginTop: "2rem"}}>
                {comments.map((c) => {
                  const isCommentAuthor = user && c.authorId === user.id;
                  return (
                    <CommentItem key={c.id}>
                      <CommentAuthor>{c.authorName}</CommentAuthor>

                      {editCommentId === c.id ? (
                        <>
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
                            disabled={isUpdatingComment === c.id || isDeletingPost}
                          />
                          <ActionGroup>
                            <SuccessButton onClick={() => handleEditSave(c.id)} disabled={isUpdatingComment === c.id || isDeletingPost}>
                              {isUpdatingComment === c.id ? '저장 중...' : '저장'}
                            </SuccessButton>
                            <DangerButton onClick={handleEditCancel} disabled={isUpdatingComment === c.id || isDeletingPost}>취소</DangerButton>
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
                          {isCommentAuthor && (
                            <ActionGroup>
                              <PrimaryButton
                                  onClick={() => handleEditStart(c)}
                                  disabled={isDeletingPost || isSubmittingComment || !!isUpdatingComment || !!isDeletingComment}
                              >
                                  수정
                              </PrimaryButton>
                              <DangerButton
                                  onClick={() => handleCommentDelete(c.id)}
                                  disabled={isDeletingPost || isSubmittingComment || !!isUpdatingComment || isDeletingComment === c.id}
                              >
                                  {isDeletingComment === c.id ? '삭제 중...' : '삭제'}
                              </DangerButton>
                            </ActionGroup>
                          )}
                        </>
                      )}
                    </CommentItem>
                  );
                })}
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