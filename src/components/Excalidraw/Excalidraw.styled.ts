import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const EditorWrapper = styled.div<{ disableDrawing: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 2;
  ${({ disableDrawing }) =>
    disableDrawing &&
    css`
      pointer-events: none;
    `}
`;
