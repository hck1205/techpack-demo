import type { CSSProperties } from "react";

export type BlockShellProps = {
  className?: string;
  style?: CSSProperties;
};

export const createBlockShellStyle = (style?: CSSProperties) => ({
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  ...style,
});
