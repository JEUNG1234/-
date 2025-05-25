import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Header from './pages/Header'
import UserList from './pages/UserList'
import UserRegistration from './pages/UserRegistration'
import NotFound from './pages/NotFound'


function App() {
  const [userList, setUserList] = useState([]); 

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home user = {userList}/>} />
        <Route path="/UserList" element={<UserList user={userList} setUser={setUserList} />} /> 
        <Route path="/UserRegistration" element={<UserRegistration setUserList={setUserList} />} /> 
        <Route path='*' element={<NotFound />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App