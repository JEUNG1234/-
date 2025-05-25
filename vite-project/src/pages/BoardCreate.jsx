import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Container, Input, Textarea, PrimaryButton } from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout';
import useUserStore from '../store/useUserStore';
import { toast } from 'react-toastify';

const BoardCreate = () => {
  const navigate = useNavigate();
  const { user } = useUserStore(); // 로그인한 사용자 정보 가져오기

  const [form, setForm] = useState({
    title: '',
    body: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user || !user.id) { // user.id 가 이메일(백엔드 userId)이라고 가정
      toast.error('게시글을 작성하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!form.title.trim() || !form.body.trim()) {
      toast.warning('제목과 내용을 입력하세요.');
      return;
    }

    setIsLoading(true);
    const newPostData = { // 백엔드 BoardDto.Create에 정의된 필드만 전송
      title: form.title.trim(),
      body: form.body.trim(),
    };

    try {
      await axios.post('http://localhost:8888/api/boards', newPostData, {
        headers: {
          'X-USER-ID': user.id // 로그인한 사용자의 ID(이메일)를 헤더에 추가
        }
      });
      toast.success('게시글이 성공적으로 작성되었습니다!');
      navigate('/board');
    } catch (error) {
      console.error("게시글 작성 중 오류 발생:", error);
      if (error.response && error.response.status === 401) {
        toast.error('작성 권한이 없습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || '게시글 작성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <h2>게시글 작성</h2>
          <Input
            type="text"
            name="title"
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={handleChange}
            disabled={isLoading}
          />
          <Textarea
            name="body"
            placeholder="내용을 입력하세요"
            value={form.body}
            onChange={handleChange}
            disabled={isLoading}
            rows={10}
          />
          <PrimaryButton onClick={handleSubmit} disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? '작성 중...' : '작성 완료'}
          </PrimaryButton>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default BoardCreate;