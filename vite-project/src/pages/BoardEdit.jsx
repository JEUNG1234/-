import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useUserStore from '../store/useUserStore';
import { Container, Input, Textarea, PrimaryButton } from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout'; // PageLayout import

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: ${props => props.theme.colors.text ||'#333'};
`;

const BoardEdit = () => {
  const { id: postId } = useParams(); // id를 postId로 명확히 함
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [form, setForm] = useState({ title: '', body: '' }); // author는 form에서 제거
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !user.id) {
      toast.info('게시글을 수정하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:8888/api/boards/${postId}`);
        // 백엔드에서 authorId를 보내준다고 가정
        if (user.id !== res.data.authorId) {
          toast.error('게시글 수정 권한이 없습니다.');
          navigate(`/board/${postId}`); // 상세 페이지로 리다이렉션
          return;
        }
        setForm({ title: res.data.title, body: res.data.body });
      } catch (error) {
        console.error("게시글 불러오기 오류:", error);
        toast.error(error.response?.data?.message || '게시글을 불러오는데 실패했습니다.');
        if (error.response && error.response.status === 404) {
          navigate('/404');
        } else {
          navigate('/board');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.warning('제목과 내용을 모두 입력해주세요.');
      return;
    }
    if (!user || !user.id) { // 더블 체크
      toast.error('세션이 만료되었거나 로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    const updateData = { // 백엔드 BoardDto.Update에 정의된 필드만 전송
      title: form.title.trim(),
      body: form.body.trim(),
    };

    try {
      await axios.put(`http://localhost:8888/api/boards/${postId}`, updateData, {
        headers: {
          'X-USER-ID': user.id // 요청 헤더에 사용자 ID(이메일) 추가
        }
      });
      toast.success('게시글이 성공적으로 수정되었습니다!');
      navigate(`/board/${postId}`);
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      if (error.response && error.response.status === 401) {
        toast.error('수정 권한이 없습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else if (error.response && error.response.status === 403) {
        toast.error('게시글 수정 권한이 없습니다.');
      } else {
        toast.error(error.response?.data?.message || '게시글 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageWrapper><PageInner><Container><p>게시글 정보를 불러오는 중...</p></Container></PageInner></PageWrapper>;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <Title>게시글 수정</Title>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="title" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>제목</label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
              disabled={isSubmitting}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="body" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>내용</label>
            <Textarea
              id="body"
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder="내용을 입력하세요"
              rows={10}
              disabled={isSubmitting}
            />
          </div>
          <PrimaryButton onClick={handleUpdate} disabled={isSubmitting} style={{ marginTop: '1rem' }}>
            {isSubmitting ? '수정 중...' : '수정 완료'}
          </PrimaryButton>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default BoardEdit;