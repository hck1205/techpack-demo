import { createBlockShellStyle } from "../shared/blockShell";
import { DummyShell } from "./DummyBlock.styled";
import type { DummyBlockProps } from "./DummyBlock.types";

export function DummyBlock({ config, className, style }: DummyBlockProps) {
  void config;
  return <DummyShell aria-label="Dummy layout helper" className={className} style={createBlockShellStyle(style)} />;
}
