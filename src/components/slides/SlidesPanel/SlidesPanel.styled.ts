import styled from "@emotion/styled";

export const SlidesPanelContainer = styled.aside<{ width: number; compact: boolean; resizeHotzone: boolean }>`
  width: ${({ width }) => `${width}px`};
  min-width: ${({ width }) => `${width}px`};
  flex: 0 0 ${({ width }) => `${width}px`};
  padding: 18px 14px;
  border-right: 1px solid #d8dee8;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  cursor: ${({ resizeHotzone }) => (resizeHotzone ? "ew-resize" : "default")};
`;

export const PanelTitle = styled.div<{ compact: boolean }>`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: ${({ compact }) => (compact ? "center" : "flex-start")};
  gap: 6px;

  .icon {
    font-size: 14px;
    line-height: 1;
  }
`;

export const SlideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SlideItem = styled.button<{ active: boolean; compact: boolean }>`
  border: 1px solid ${({ active }) => (active ? "#0f766e" : "#d8dee8")};
  border-radius: 10px;
  padding: ${({ compact }) => (compact ? "9px 0" : "10px")};
  background: ${({ active }) => (active ? "#ecfeff" : "#f8fafc")};
  text-align: ${({ compact }) => (compact ? "center" : "left")};
  cursor: pointer;
  display: flex;
  flex-direction: ${({ compact }) => (compact ? "row" : "column")};
  justify-content: ${({ compact }) => (compact ? "center" : "flex-start")};
  align-items: ${({ compact }) => (compact ? "center" : "stretch")};
  gap: 4px;

  .icon {
    font-size: 13px;
    line-height: 1;
  }

  small {
    color: #64748b;
  }
`;

export const AddSlideButton = styled.button<{ compact: boolean }>`
  margin-top: auto;
  border: none;
  border-radius: 10px;
  background: #0f766e;
  color: #ffffff;
  padding: ${({ compact }) => (compact ? "10px 0" : "10px 12px")};
  min-width: ${({ compact }) => (compact ? "0" : "auto")};
  cursor: pointer;
`;
