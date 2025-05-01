import React from 'react';
import Router from './routes/Router';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = {
  background: '#f4f4f4',
  text: '#333',
};

const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <Router />
    <ToastContainer />
  </ThemeProvider>
);

export default App;
