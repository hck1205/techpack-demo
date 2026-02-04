import { DummyShell } from "./DummyBlock.styled";
import type { DummyBlockProps } from "./DummyBlock.types";

export function DummyBlock({ config }: DummyBlockProps) {
  void config;
  return <DummyShell aria-label="Dummy layout helper" />;
}
