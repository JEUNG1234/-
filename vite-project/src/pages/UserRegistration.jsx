import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Background = styled.div`
  background: linear-gradient(to bottom right, #c3e7ff, #ffffff);
  width: 100%;
  min-height: 100vh;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: black;
`

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 550px;
  gap: 1rem;
`

const InputText = styled.input`
  width: 500px;
  padding: 10px;
  margin-top: 5px;
  background: white;
  border-radius: 5px;
  border-style: none;
  font-size: 1rem;
  color: black;
  color: #333;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  transition: border 0.3s, box-shadow 0.3s;

  &:focus {
    border-color: #0f62fe;
    box-shadow: 0 0 0 3px rgba(15, 98, 254, 0.2);
    outline: none;
  }

  &::placeholder {
    color: #aaa;
  }
`

const SubmitBtn = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: white;
  color: #0f62fe;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: background 0.3s ease, color 0.3s ease;
  margin: 50px;

  &:hover {
    background: #f0f4ff;
    color: #0353e9;
  }
`

const Title = styled.h2`
  font-size: 30px;
  color: #2d3436;
  
`
const UserRegistration = ({ setUserList }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [job, setJob] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (ev) => {
    ev.preventDefault();

    const newUser = {
      name: name,
      age: age,
      job: job,
      email: email,
      gender: gender,
    }

    alert(`${name}님 성공적으로 등록 완료되었습니다.`);

    setUserList(prevUsers => [...prevUsers, newUser]); // 부모에서 받은 setUserList로 업데이트
  }

  const navigate = useNavigate();

  const backToList = () => {
    navigate("/UserList");
  }

  return (
    <Background>
      <Title>유저 등록</Title>
      <StyledForm onSubmit={handleSubmit}>
        <InputText type="text" placeholder='이름 입력'
          value={name}
          onChange={(ev) => setName(ev.target.value)} />
        <InputText type="text" placeholder='나이 입력'
          value={age}
          onChange={(ev) => setAge(ev.target.value)} />
        <InputText type="text" placeholder='직업 입력'
          value={job}
          onChange={(ev) => setJob(ev.target.value)} />
        <InputText type="email" placeholder='이메일 입력'
          value={email}
          onChange={(ev) => setEmail(ev.target.value)} />
        <InputText type="text" placeholder='성별 입력'
          value={gender}
          onChange={(ev) => setGender(ev.target.value)} />

        <SubmitBtn type='submit' onClick={backToList}>등록</SubmitBtn>
      </StyledForm>
    </Background>
  )
}

export default UserRegistration