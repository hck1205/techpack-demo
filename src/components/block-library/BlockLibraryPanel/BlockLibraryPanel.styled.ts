import styled from "@emotion/styled";

export const BlockBar = styled.section`
  width: 100%;
  margin: 0;
  background: #ffffff;
  border: 1px solid #d8dee8;
  border-radius: 14px;
  padding: 14px;
  box-sizing: border-box;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const PanelTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

export const BlockList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const BlockItemButton = styled.button`
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #f8fafc;
  padding: 8px 12px;
  cursor: grab;
`;
