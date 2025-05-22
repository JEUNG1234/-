import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useUserStore from '../store/useUserStore';
// 'Button' import를 제거하고, 'PrimaryButton'을 다른 컴포넌트들과 함께 한 줄로 import
import { Container, Input, Textarea, PrimaryButton } from '../components/CommonStyles';

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
`;

const BoardEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [form, setForm] = useState({ title: '', body: '', author: '' });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:8888/api/boards/${id}`);
        if (user?.name !== res.data.author) {
          toast.error('수정 권한이 없습니다.');
          navigate('/board');
          return;
        }
        setForm(res.data);
      } catch (error) {
        console.error(error);
        toast.error('게시글 불러오기 실패');
        navigate('/board');
      }
    };

    if (!user) {
      toast.info('로그인이 필요합니다.');
      navigate('/login');
    } else {
      fetchPost();
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8888/api/boards/${id}`, form);
      toast.success('수정 완료!');
      navigate(`/board/${id}`);
    } catch (error) {
      toast.error('수정 실패');
      console.error(error);
    }
  };

  return (
    <Container>
      <Title>게시글 수정</Title>
      <Input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="제목을 입력하세요"
      />
      <Textarea
        name="body"
        value={form.body}
        onChange={handleChange}
        placeholder="내용을 입력하세요"
      />
      <PrimaryButton onClick={handleUpdate}>수정 완료</PrimaryButton>
    </Container>
  );
};

export default BoardEdit;