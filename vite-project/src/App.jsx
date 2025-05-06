import React from 'react';
import Router from './routes/Router';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';

const theme = {
  colors: {
    primary: 'royalblue', // CommonStyles.js의 PrimaryButton 배경색
    secondary: '#4caf50', // FormButton.jsx의 버튼 배경색 (혹은 SuccessButton과 통일)
    danger: '#e74c3c',    // CommonStyles.js의 DangerButton 배경색
    success: '#2ecc71',   // CommonStyles.js의 SuccessButton 배경색
    background: '#f6f7f9', // GlobalStyle.js의 body 배경색
    surface: '#ffffff',   // Container 배경색
    text: '#333',         // 기본 텍스트 색상
    textSecondary: '#666',
    textLight: '#ffffff',
    border: '#ccc',       // Input 테두리 색상
    headerBackground: '#222',
  },
  fonts: {
    main: "'Pretendard', sans-serif",
    sizes: {
      small: '0.875rem', // 14px
      medium: '1rem',    // 16px
      large: '1.25rem',  // 20px
      xlarge: '1.8rem',  // Login/Register Title
      xxlarge: '2.5rem', // Home Title
    },
    weights: {
      light: 300,
      normal: 400,
      bold: 700,
    }
  },
  spacing: {
    xxsmall: '0.25rem', // 4px
    xsmall: '0.5rem',  // 8px
    small: '0.75rem',  // 12px
    medium: '1rem',    // 16px
    large: '1.5rem',   // 24px
    xlarge: '2rem',    // 32px
    xxlarge: '3rem',   // 48px
  },
  borderRadius: {
    small: '4px',
    medium: '6px',
    large: '8px',
    xlarge: '12px', // Container
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 10px rgba(0, 0, 0, 0.08)', // Container
  }
};

const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <Header />
    <Router />
    <ToastContainer />
  </ThemeProvider>
);

export default App;