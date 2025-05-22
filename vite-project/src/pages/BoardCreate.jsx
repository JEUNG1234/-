import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Container, Input, Textarea, PrimaryButton } from '../components/CommonStyles';
import { PageWrapper, PageInner } from '../components/PageLayout';
import useUserStore from '../store/useUserStore';
import { toast } from 'react-toastify';

const BoardCreate = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [form, setForm] = useState({
    title: '',
    body: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.warning('제목과 내용을 입력하세요.');
      return;
    }

    const newPost = {
      ...form,
      author: user?.name || '익명',
      createdAt: new Date().toISOString(),
    };

    await axios.post('http://localhost:8888/api/boards', newPost);
    toast.success('작성 완료!');
    navigate('/board');
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
          />
          <Textarea
            name="body"
            placeholder="내용을 입력하세요"
            value={form.body}
            onChange={handleChange}
          />
          <PrimaryButton onClick={handleSubmit}>작성 완료</PrimaryButton>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default BoardCreate;
