import styled from "styled-components";

// 내용 컨테이너 (카드 스타일)
export const Container = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 100%;
  max-width: 1024px;
  margin: 0 auto; /* << 이 줄을 추가하거나 수정하세요 */
`;

// 입력 필드
export const Input = styled.input`
  width: 100%;
  padding: 0.6rem 1rem;  // 세로 패딩을 기존 0.8rem에서 0.6rem으로 조금 줄입니다.
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  line-height: 1.5;     // line-height를 적절히 설정합니다.
`;


// 텍스트영역
export const Textarea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
`;

// 공통 버튼 스타일
const BaseButton = styled.button`
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: 0.2s all;
  &:hover {
    opacity: 0.9;
  }
`;

// 주요 버튼 (파란색)
export const PrimaryButton = styled(BaseButton)`
  background-color: royalblue;
  color: white;
`;

// 삭제 버튼 (빨간색)
export const DangerButton = styled(BaseButton)`
  background-color: #e74c3c;
  color: white;
`;

// 성공 버튼 (초록색)
export const SuccessButton = styled(BaseButton)`
  background-color: #2ecc71;
  color: white;
`;