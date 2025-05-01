import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;

const FormButton = ({ text }) => {
  return <Button type="submit">{text}</Button>;
};

export default FormButton;
