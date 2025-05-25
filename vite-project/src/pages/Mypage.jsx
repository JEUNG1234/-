// src/pages/Mypage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import useUserStore from '../store/useUserStore';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

// PageLayout 컴포넌트 import
import { PageWrapper, PageInner } from '../components/PageLayout';
// CommonStyles 컴포넌트 import
import { Container, Input, PrimaryButton } from '../components/CommonStyles';

const Title = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
  color: ${props => props.theme.colors.text};
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
  background: ${props => props.theme.colors.surfaceLight || '#f8f9fa'};
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
  border-radius: ${props => props.theme.borderRadius.medium || '8px'};
  box-shadow: ${props => props.theme.shadows.small};
  
  a {
    color: ${props => props.theme.colors.primary || 'royalblue'};
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PostTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
`;

const PostBody = styled.p`
  margin: 0.6rem 0 0.4rem;
  font-size: 0.95rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const PostDate = styled.small`
  color: #888;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 0.5rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid ${props => props.theme.colors.border || '#ccc'};
    background-color: ${props => props.theme.colors.surface || '#fff'};
    color: ${props => props.theme.colors.primary || 'royalblue'};
    cursor: pointer;
    border-radius: ${props => props.theme.borderRadius.small || '4px'};

    &:disabled {
      color: #aaa;
      cursor: not-allowed;
      background-color: #f0f0f0;
    }
    &:hover:not(:disabled) {
      background-color: #e9ecef;
    }
  }
  span {
    padding: 0.5rem;
    font-weight: bold;
  }
`;


const Mypage = () => {
  // const { user, setUser } = useUserStore(); // setUser 제거
  const { user } = useUserStore(); // setUser 사용하지 않으므로 제거
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const [userPostsPage, setUserPostsPage] = useState({
    content: [],
    currentPage: 0,
    totalPage: 0,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [currentPostPageNumber, setCurrentPostPageNumber] = useState(0);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);


  useEffect(() => {
    if (!user) {
      toast.info('마이페이지를 보려면 로그인이 필요합니다.');
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchUserPosts = useCallback(async (page) => {
    if (!user || !user.name) return;
    setIsLoadingPosts(true);
    try {
      const res = await axios.get(`http://localhost:8888/api/boards?author=${encodeURIComponent(user.name)}&page=${page}&size=3&sort=createDate,desc`);
      setUserPostsPage(res.data);
    } catch (error) {
      toast.error('내가 쓴 글을 불러오지 못했습니다.');
      console.error("Error fetching user posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserPosts(currentPostPageNumber);
    }
  }, [user, fetchUserPosts, currentPostPageNumber]);


  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async () => {
    if (!user || !user.id) {
      toast.error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        toast.warn('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
        return;
    }
    if (passwordForm.newPassword.length < 6) {
        toast.warn('새 비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }

    setIsUpdatingPassword(true);
    try {
      const updateData = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };
      // 비밀번호 변경 API는 일반적으로 수정된 사용자 정보를 반환하지 않거나,
      // 반환하더라도 비밀번호 필드는 제외된 형태로 반환합니다.
      // 따라서 현재 userStore의 user 객체를 명시적으로 업데이트할 필요는 없습니다.
      // (토큰을 재발급 받는다면 그때 user 정보가 갱신될 수 있습니다.)
      await axios.put(`http://localhost:8888/api/members/${user.id}`, updateData, {
        headers: {
            'X-USER-ID': user.id
        }
      });
      toast.success('비밀번호가 성공적으로 변경되었습니다.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
      // setUser(updatedUserInfoFromResponse); // 백엔드에서 업데이트된 사용자 정보를 반환한다면 여기서 사용 가능
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePostPageChange = (newPageNumber) => {
    setCurrentPostPageNumber(newPageNumber);
  };


  if (!user) {
    return null;
  }

  return (
    <PageWrapper>
      <PageInner>
        <Container>
          <Title>내 정보</Title>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              이름
            </label>
            <Input
              id="name"
              name="name"
              value={user.name}
              readOnly
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              이메일 (ID)
            </label>
            <Input
              id="email"
              name="email"
              value={user.id}
              readOnly
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
            />
          </div>

          <Divider />
          <Title style={{fontSize: '1.5rem', textAlign: 'left', marginBottom: '1rem'}}>비밀번호 변경</Title>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="currentPassword" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              현재 비밀번호
            </label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="현재 사용 중인 비밀번호"
              disabled={isUpdatingPassword}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="newPassword" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              새 비밀번호
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="새로운 비밀번호 (최소 6자 이상)"
              disabled={isUpdatingPassword}
            />
          </div>
          <PrimaryButton onClick={handlePasswordUpdate} style={{ marginTop: '1rem' }} disabled={isUpdatingPassword}>
            {isUpdatingPassword ? '변경 중...' : '비밀번호 변경'}
          </PrimaryButton>

          <Divider />

          <Title style={{textAlign: 'left'}}>내가 쓴 글 ({userPostsPage.totalCount})</Title>
          {isLoadingPosts ? <p>게시글을 불러오는 중...</p> :
            userPostsPage.content.length > 0 ? (
              <PostList>
                {userPostsPage.content.map((item) => (
                  <PostItem key={item.id}>
                    <PostTitle>
                      <Link to={`/board/${item.id}`}>{item.title}</Link>
                    </PostTitle>
                    <PostBody>{item.body?.substring(0,100)}{item.body?.length > 100 && "..."}</PostBody>
                    <PostDate>
                      {item.createdAt && !isNaN(Date.parse(item.createdAt))
                        ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')
                        : '날짜 없음'}
                      &nbsp;|&nbsp; 조회수: {item.viewCount}
                    </PostDate>
                  </PostItem>
                ))}
              </PostList>
            ) : (
              <p>작성한 글이 없습니다.</p>
            )
          }
          {userPostsPage.totalPage > 1 && (
            <PaginationContainer>
              <button
                onClick={() => handlePostPageChange(currentPostPageNumber - 1)}
                disabled={!userPostsPage.hasPrevious}
              >
                이전
              </button>
              <span>{userPostsPage.currentPage + 1} / {userPostsPage.totalPage}</span>
              <button
                onClick={() => handlePostPageChange(currentPostPageNumber + 1)}
                disabled={!userPostsPage.hasNext}
              >
                다음
              </button>
            </PaginationContainer>
          )}
        </Container>
      </PageInner>
    </PageWrapper>
  );
};

export default Mypage;