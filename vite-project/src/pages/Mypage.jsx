import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import useUserStore from '../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Container, Input } from '../components/CommonStyles';
 import { PrimaryButton } from '../components/CommonStyles';

const Title = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
`;


const Divider = styled.hr`
  margin: 2.5rem 0;
  border: 0;
  border-top: 1px solid #eee;
`;

const PostList = styled.ul`
  list-style: none;
  padding: 0;
`;

const PostItem = styled.li`
  background: #f8f9fa;
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
  border-radius: 8px;
`;

const PostTitle = styled.h4`
  margin: 0;
`;

const PostBody = styled.p`
  margin: 0.6rem 0 0.4rem;
`;

const PostDate = styled.small`
  color: #888;
`;

const Mypage = () => {
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (!user) {
      toast.info('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setForm({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    fetchUserPosts();
  }, [user, navigate]);

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/posts?author=${user.name}`);
      setUserPosts(res.data);
    } catch (error) {
      toast.error('게시글을 불러오지 못했습니다.');
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/users/${user.id}`, form);
      toast.success('정보가 수정되었습니다.');
      setUser({ ...user, ...form });
    } catch (error) {
      toast.error('정보 수정 실패');
      console.error(error);
    }
  };

  return (
    <Container>
      <Title>내 정보</Title>
      <Input name="name" value={form.name} onChange={handleChange} placeholder="이름" />
      <Input name="email" value={form.email} onChange={handleChange} placeholder="이메일" />
      <Input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="비밀번호"
      />
      <PrimaryButton onClick={handleUpdate}>정보 수정</PrimaryButton>

      <Divider />

      <Title>내가 쓴 글</Title>
      <PostList>
        {userPosts.map((item) => (
          <PostItem key={item.id}>
            <PostTitle>{item.title}</PostTitle>
            <PostBody>{item.body}</PostBody>
            <PostDate>
              {item.createdAt && !isNaN(Date.parse(item.createdAt))
                ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')
                : '날짜 없음'}
            </PostDate>
          </PostItem>
        ))}
      </PostList>
    </Container>
  );
};

export default Mypage;
