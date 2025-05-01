import React from 'react';
import styled from 'styled-components';

const FieldWrapper = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Error = styled.p`
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const InputField = ({ label, name, register, type = 'text', error }) => {
  return (
    <FieldWrapper>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} {...register(name)} />
      {error && <Error>{error.message}</Error>}
    </FieldWrapper>
  );
};

export default InputField;
