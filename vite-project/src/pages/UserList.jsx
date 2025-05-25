import React from 'react'
import styled from 'styled-components'
import { useState } from 'react'

const UserCard = styled.div`
  width: 100%;
  max-width: 720px;
  background-color: #fdfdfd;
  color: #2d3436;
  border: 1px solid #dfe6e9;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  margin: 1.5rem 0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  font-size: 1.1rem;
  line-height: 1.6;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    background-color: #f8f9fa;
  }

  span {
    font-weight: 600;
    color: #0984e3;
    margin-right: 0.5rem;
  }
  
  p {
    margin: 0;
    display: flex;
    align-items: center;
  }
`


const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 0 10px rgba(0,0,0,0.25);
  text-align: left;
`

const CloseBtn = styled.button`
  float: right;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #888;

  &:hover {
    color: #333;
  }
`

const Title = styled.h2`
  font-size: 30px;
  color: #2d3436;
  
`
const Background = styled.div`
   min-height: 100vh;
  background: linear-gradient(to bottom right, #c3e7ff, #ffffff);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: black;
`
const DeleteBtn = styled.button`
  background-color:rgb(255, 0, 0);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #ff4d4d;
  }

  &:active {
    background-color: #e63946;
  }
`

// 유저 목록 페이지
const UserList = ({ user, setUser }) => {

  const [selectedUser, setSelectedUser] = useState(null);

  const openModal = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const deleteUser = (email) => {
    const updatedUsers = user.filter(u => u.email !== email);
    alert(`${selectedUser.name} 님이 정상적으로 삭제되셨습니다.`);
    setUser(updatedUsers);
    setSelectedUser(null);
  }

  return (
    <Background>
      <Title>유저 목록</Title>
      {user.map((u, index) => {
        return (
          <UserCard key={index} onClick={() => openModal(u)}>
            <p><span>이름:</span> {u.name}</p>
            <p><span>나이:</span> {u.age}</p>
            <p><span>직업:</span> {u.job}</p>
            <p><span>이메일:</span> {u.email}</p>
            <p><span>성별:</span> {u.gender}</p>
          </UserCard>
        )
      })}

      {/* 모달 창 */}
      {selectedUser && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={closeModal}>&times;</CloseBtn>
            <h2>{selectedUser.name}님의 정보</h2>
            <p><strong>나이:</strong> {selectedUser.age}</p>
            <p><strong>직업:</strong> {selectedUser.job}</p>
            <p><strong>이메일:</strong> {selectedUser.email}</p>
            <p><strong>성별:</strong> {selectedUser.gender}</p>
            <DeleteBtn onClick={() => deleteUser(selectedUser.email)}>삭제</DeleteBtn>
          </ModalContent>
        </ModalOverlay>
      )}
    </Background>

  )
}

export default UserList