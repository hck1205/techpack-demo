import styled from "@emotion/styled";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const Panel = styled.section`
  width: min(560px, 100%);
  max-height: min(70vh, 680px);
  min-height: 320px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #d8dee8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Header = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const HeaderButton = styled.button`
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  padding: 6px 10px;
  cursor: pointer;
`;

export const Body = styled.div`
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
`;

export const List = styled.div`
  flex: 1;
  min-height: 0;
  padding: 10px 12px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-sizing: border-box;
  scrollbar-gutter: stable both-edges;
`;

export const Row = styled.div`
  width: 100%;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  background: #ffffff;
  padding: 8px 10px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
`;

export const RowContent = styled.button`
  width: 100%;
  min-width: 0;
  border: 0;
  border-radius: 8px;
  background: #ffffff;
  padding: 10px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
`;

export const DeleteButton = styled.button`
  width: 72px;
  height: 32px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff1f2;
  color: #be123c;
  padding: 0 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background: #ffe4e6;
  }
`;

export const RowTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RowMeta = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
`;

export const Empty = styled.div`
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 16px;
  font-size: 13px;
  color: #64748b;
  text-align: center;
`;

export const ErrorMessage = styled.div`
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 10px;
  padding: 10px;
  font-size: 12px;
`;
