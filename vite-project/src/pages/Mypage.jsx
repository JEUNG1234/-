// src/pages/Mypage.jsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import useUserStore from '../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// PageLayout 컴포넌트 import
import { PageWrapper, PageInner } from '../components/PageLayout';
// CommonStyles 컴포넌트 import
import { Container, Input, PrimaryButton } from '../components/CommonStyles';

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
      password: user.password, // 실제 애플리케이션에서는 비밀번호를 이렇게 직접 다루는 것은 보안상 좋지 않습니다.
    });

    fetchUserPosts();
  }, [user, navigate]);

  const fetchUserPosts = async () => {
    if (!user) return; // user가 없을 경우를 대비
    try {
      const res = await axios.get(`http://localhost:8888/api/boards?author=${user.name}`);
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
      await axios.put(`http://localhost:8888/api/members/${user.id}`, form);
      toast.success('정보가 수정되었습니다.');
      setUser({ ...user, ...form });
    } catch (error) {
      toast.error('정보 수정 실패');
      console.error(error);
    }
  };

  if (!user) { // user가 없을 경우 로딩 상태나 리다이렉션 처리를 명시적으로 하는 것이 좋습니다.
    return null; // 또는 <p>Loading...</p> 등
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <Title>내 정보</Title>

          {/* 이름 입력 필드 */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              이름
            </label>
            <Input // CommonStyles에서 가져온 Input 컴포넌트 사용
              id="name"
              name="name"
              value={form.name}
              readOnly 
              onChange={handleChange}
              placeholder="이름"
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
            />
          </div>

          {/* 이메일 입력 필드 */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              이메일
            </label>
            <Input // CommonStyles에서 가져온 Input 컴포넌트 사용
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange} // 실제로는 이메일 변경을 허용하지 않을 수 있습니다.
              placeholder="이메일"
              readOnly // 이메일은 보통 수정 불가 처리
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
            />
          </div>

          {/* 새 비밀번호 입력 필드 */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              새 비밀번호
            </label>
            <Input // CommonStyles에서 가져온 Input 컴포넌트 사용
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="새 비밀번호 (변경 시에만 입력)"
            />
          </div>

          <PrimaryButton onClick={handleUpdate} style={{ marginTop: '1rem' }}>
            정보 수정
          </PrimaryButton>

          <Divider />

          <Title>내가 쓴 글</Title>
          <PostList>
            {userPosts.length > 0 ? (
              userPosts.map((item) => (
                <PostItem key={item.id}>
                  <PostTitle>{item.title}</PostTitle>
                  <PostBody>{item.body}</PostBody>
                  <PostDate>
                    {item.createdAt && !isNaN(Date.parse(item.createdAt))
                      ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')
                      : '날짜 없음'}
                  </PostDate>
                </PostItem>
              ))
            ) : (
              <p>작성한 글이 없습니다.</p>
            )}
          </PostList>
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default Mypage;