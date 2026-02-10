import styled from "@emotion/styled";

export const Container = styled.div<{ selected: boolean }>`
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: ${({ selected }) => `1px solid ${selected ? "#2563eb" : "#cbd5e1"}`};
  position: relative;
  overflow: auto;
  z-index: 1;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-shadow: ${({ selected }) => (selected ? "0 0 0 2px rgba(37, 99, 235, 0.2)" : "none")};
`;

export const DragHandle = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-radius: 0 6px 0 6px;
  background: rgba(248, 250, 252, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 9999;
`;

export const Content = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  border-radius: inherit;
`;
