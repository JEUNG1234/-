import React from 'react'
import styled from 'styled-components'

const Mainpage = styled.div`
  background: linear-gradient(to bottom right, #c3e7ff, #ffffff);
  width: 100%;
  min-height: 100vh;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2d3436;
  margin-bottom: 1rem;
`

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #636e72;
  margin-bottom: 3rem;
`

const SummaryContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 3rem;
`

const SummaryCard = styled.div`
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  text-align: center;
`

const SummaryTitle = styled.div`
  font-weight: bold;
  color: #0984e3;
  margin-bottom: 0.5rem;
`

const SummaryValue = styled.div`
  font-size: 1.8rem;
  color: #2d3436;
`

const Table = styled.table`
  width: 90%;
  max-width: 800px;
  border-collapse: collapse;
  margin-top: 2rem;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  overflow: hidden;
`

const TableHeader = styled.th`
  background: #74b9ff;
  color: white;
  padding: 1rem;
`

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f1f2f6;
  }
`

const TableCell = styled.td`
  padding: 1rem;
  text-align: center;
  color: #2d3436;
`

const Home = ({ user }) => {



  return (
    <Mainpage>
      <Title>유저관리 페이지에 오신 것을 환영합니다.</Title>
      <Subtitle>
        유저를 새롭게 등록하거나 유저 목록을 확인해보세요! <br />
        유저 정보가 없다면 바로 등록해보세요!
      </Subtitle>


      <SummaryContainer>
        <SummaryCard>
          <SummaryTitle>총 유저 수</SummaryTitle>
          <SummaryValue>{user.length}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryTitle>남성 유저</SummaryTitle>
          <SummaryValue>{user.filter(u => u.gender === '남자').length}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryTitle>여성 유저</SummaryTitle>
          <SummaryValue>{user.filter(u => u.gender === '여자').length}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryTitle>신규 등록 유저</SummaryTitle>
          <SummaryValue>{user.slice(-3).length}</SummaryValue>
        </SummaryCard>
      </SummaryContainer>

      <Subtitle>최근 가입한 유저</Subtitle>
      <Table>
        <thead>
          <tr>
            <TableHeader>이름</TableHeader>
            <TableHeader>나이</TableHeader>
            <TableHeader>직업</TableHeader>
            <TableHeader>이메일</TableHeader>
            <TableHeader>성별</TableHeader>
          </tr>
        </thead>
        <tbody>
          {user.slice(-3).reverse().map((u, idx) => (
            <TableRow key={idx}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.age}</TableCell>
              <TableCell>{u.job}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.gender}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Mainpage>
  )
}

export default Home
