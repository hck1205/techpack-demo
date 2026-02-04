import styled from "@emotion/styled";

export const EditorShell = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

export const EditorToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

export const ToolbarGroup = styled.div`
  display: inline-flex;
  gap: 4px;
`;

export const ToolbarButton = styled.button<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid ${({ active }) => (active ? "#0f766e" : "#cbd5e1")};
  background: ${({ active }) => (active ? "#ccfbf1" : "#fff")};
  color: #334155;
  border-radius: 6px;
  height: 28px;
  min-width: 30px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
`;

export const ToolbarMiniAlignGlyph = styled.span<{ mode: "left" | "right" | "center" }>`
  width: 12px;
  display: inline-flex;
  flex-direction: column;
  gap: 2px;

  span {
    display: block;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
  }

  span:nth-of-type(1) {
    width: 100%;
  }

  span:nth-of-type(2) {
    width: 75%;
    margin-left: ${({ mode }) => (mode === "left" ? "0" : mode === "center" ? "12.5%" : "25%")};
  }

  span:nth-of-type(3) {
    width: 58%;
    margin-left: ${({ mode }) => (mode === "left" ? "0" : mode === "center" ? "21%" : "42%")};
  }
`;

export const EditorContentWrap = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px;

  .tiptap {
    min-height: 100%;
    outline: none;
    color: #0f172a;
  }

  .tiptap p {
    margin: 0 0 8px;
  }

  .tiptap::after {
    content: "";
    display: block;
    clear: both;
  }

  .tiptap img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
  }

  .tiptap [data-resize-wrapper] {
    position: relative;
    display: inline-block;
    max-width: 100%;
    vertical-align: top;
  }

  .tiptap [data-resize-wrapper] > img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  .tiptap [data-resize-wrapper]:has(> img.image-float-left) {
    float: left;
    margin: 4px 12px 8px 0;
  }

  .tiptap [data-resize-wrapper]:has(> img.image-float-right) {
    float: right;
    margin: 4px 0 8px 12px;
  }

  .tiptap [data-resize-wrapper]:has(> img.image-line-only) {
    float: none;
    display: block;
    margin: 8px auto;
  }

  .tiptap img.ProseMirror-selectednode {
    outline: 2px solid #0f766e;
    outline-offset: 2px;
  }

  .tiptap [data-resize-wrapper].ProseMirror-selectednode > img {
    outline: 2px solid #0f766e;
    outline-offset: 2px;
  }

  .tiptap [data-resize-handle] {
    z-index: 40;
    background: transparent;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.12s ease;
  }

  .tiptap [data-resize-wrapper]:hover [data-resize-handle],
  .tiptap [data-resize-wrapper].ProseMirror-selectednode [data-resize-handle] {
    opacity: 1;
    pointer-events: auto;
  }

  .tiptap [data-resize-handle="left"],
  .tiptap [data-resize-handle="right"] {
    width: 2px;
    top: 0;
    bottom: 0;
    cursor: ew-resize;
  }

  .tiptap [data-resize-handle="left"] {
    left: -1px;
  }

  .tiptap [data-resize-handle="right"] {
    right: -1px;
  }

  .tiptap [data-resize-handle="bottom-right"] {
    width: 8px;
    height: 8px;
    right: 3px;
    bottom: 3px;
    border-radius: 2px;
    border: 1px solid #0f766e;
    background: #ffffff;
    box-shadow: 0 0 0 1px rgba(15, 118, 110, 0.2);
    cursor: nwse-resize;
  }

  .tiptap img.image-float-left {
    float: none;
    margin: 0;
  }

  .tiptap img.image-float-right {
    float: none;
    margin: 0;
  }

  .tiptap img.image-line-only {
    float: none;
    margin: 0;
  }

  .tiptap ul,
  .tiptap ol {
    margin: 0 0 8px 18px;
    padding: 0;
  }

  .tiptap h1,
  .tiptap h2 {
    margin: 0 0 8px;
    line-height: 1.2;
  }

  .tiptap h1 {
    font-size: 18px;
  }

  .tiptap h2 {
    font-size: 16px;
  }
`;

export const HoverResizeHandle = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: #0f766e;
  border: 1px solid #0f766e;
  pointer-events: none;
  transform: translate(-100%, -100%);
  opacity: 0;
  transition: opacity 0.1s ease;

  &[data-visible="true"] {
    opacity: 1;
  }
`;
