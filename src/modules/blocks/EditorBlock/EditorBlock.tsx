import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { ResizableNodeView } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { createBlockShellStyle } from "../shared/blockShell";
import {
  EditorContentWrap,
  EditorShell,
  EditorToolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarMiniAlignGlyph,
} from "./EditorBlock.styled";
import type { EditorBlockProps } from "./EditorBlock.types";

const RichImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "image-float-left",
      },
    };
  },
  addNodeView() {
    if (!this.options.resize || !this.options.resize.enabled || typeof document === "undefined") {
      return null;
    }

    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize;

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement("img");

      const applyWrapperAlign = (wrapper: HTMLElement, className?: string | null) => {
        if (className === "image-float-right") {
          wrapper.style.float = "right";
          wrapper.style.display = "inline-block";
          wrapper.style.margin = "4px 0 8px 12px";
          return;
        }
        if (className === "image-line-only") {
          wrapper.style.float = "none";
          wrapper.style.display = "block";
          wrapper.style.margin = "8px auto";
          return;
        }
        wrapper.style.float = "left";
        wrapper.style.display = "inline-block";
        wrapper.style.margin = "4px 12px 8px 0";
      };

      const applyImageAttrs = (attrs: Record<string, unknown>) => {
        const className = typeof attrs.class === "string" ? attrs.class : "";
        if (className) el.setAttribute("class", className);
        else el.removeAttribute("class");

        const src = typeof attrs.src === "string" ? attrs.src : "";
        if (src) el.setAttribute("src", src);

        const alt = typeof attrs.alt === "string" ? attrs.alt : "";
        if (alt) el.setAttribute("alt", alt);
        else el.removeAttribute("alt");

        const title = typeof attrs.title === "string" ? attrs.title : "";
        if (title) el.setAttribute("title", title);
        else el.removeAttribute("title");

        const width = typeof attrs.width === "number" ? attrs.width : null;
        const height = typeof attrs.height === "number" ? attrs.height : null;
        if (width) el.style.width = `${width}px`;
        else el.style.removeProperty("width");
        if (height) el.style.height = `${height}px`;
        else el.style.removeProperty("height");
      };

      applyImageAttrs(HTMLAttributes as Record<string, unknown>);

      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === undefined) return;

          this.editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, {
              width,
              height,
            })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          applyImageAttrs(updatedNode.attrs as Record<string, unknown>);
          applyWrapperAlign(nodeView.dom as HTMLElement, updatedNode.attrs?.class as string | undefined);
          return true;
        },
        options: {
          directions,
          min: {
            width: minWidth,
            height: minHeight,
          },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      });

      const dom = nodeView.dom as HTMLElement;
      dom.style.visibility = "hidden";
      dom.style.pointerEvents = "none";
      el.onload = () => {
        dom.style.visibility = "";
        dom.style.pointerEvents = "";
      };

      applyWrapperAlign(dom, (HTMLAttributes as Record<string, unknown>).class as string | undefined);

      return nodeView;
    };
  },
});

export function EditorBlock({ isActive, className, style }: EditorBlockProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const activeImagePosRef = useRef<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true, autolink: true, defaultProtocol: "https" }),
      RichImage.configure({
        inline: true,
        allowBase64: true,
        resize: {
          enabled: true,
          directions: ["bottom-right"],
          minWidth: 48,
          minHeight: 48,
        },
      }),
    ],
    content: "<p>Basic editor is ready.</p>",
    immediatelyRender: false,
    editorProps: {
      handleClickOn: (view, _pos, node, nodePos) => {
        if (node.type.name !== "image") return false;
        activeImagePosRef.current = nodePos;
        const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos));
        view.dispatch(tr);
        view.focus();
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const onSelectionUpdate = () => {
      const selection = editor.state.selection;
      if (selection instanceof NodeSelection && selection.node.type.name === "image") {
        activeImagePosRef.current = selection.from;
      }
    };

    editor.on("selectionUpdate", onSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  const getSelectedImagePos = (): number | null => {
    const selection = editor.state.selection;

    if (selection instanceof NodeSelection && selection.node.type.name === "image") {
      return selection.from;
    }

    const pinnedPos = activeImagePosRef.current;
    if (pinnedPos !== null) {
      const pinnedNode = editor.state.doc.nodeAt(pinnedPos);
      if (pinnedNode?.type.name === "image") return pinnedPos;
    }

    let foundPos: number | null = null;
    editor.state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      if (node.type.name === "image") {
        foundPos = pos;
        return false;
      }
      return true;
    });

    return foundPos;
  };

  const setImageClass = (className: "image-float-left" | "image-float-right" | "image-line-only") => {
    const imagePos = getSelectedImagePos();
    if (imagePos === null) return;

    const imageNode = editor.state.doc.nodeAt(imagePos);
    if (!imageNode || imageNode.type.name !== "image") return;

    const tr = editor.state.tr.setNodeMarkup(imagePos, undefined, {
      ...imageNode.attrs,
      class: className,
    });
    tr.setSelection(NodeSelection.create(tr.doc, imagePos));
    editor.view.dispatch(tr);
    editor.view.focus();
    activeImagePosRef.current = imagePos;
  };

  const onPickImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      editor.chain().focus().setImage({ src: result }).run();

      const cursorPos = editor.state.selection.from;
      const from = Math.max(0, cursorPos - 4);
      const to = Math.min(editor.state.doc.content.size, cursorPos + 4);
      let insertedImagePos: number | null = null;

      editor.state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type.name === "image") {
          insertedImagePos = pos;
        }
        return true;
      });

      if (insertedImagePos !== null) {
        const node = editor.state.doc.nodeAt(insertedImagePos);
        if (node?.type.name === "image") {
          const tr = editor.state.tr.setNodeMarkup(insertedImagePos, undefined, {
            ...node.attrs,
            class: "image-float-left",
          });
          tr.setSelection(NodeSelection.create(tr.doc, insertedImagePos));
          editor.view.dispatch(tr);
          activeImagePosRef.current = insertedImagePos;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <EditorShell className={className} style={createBlockShellStyle(style)}>
      {isActive ? (
        <EditorToolbar>
          <ToolbarGroup>
            <ToolbarButton
              type="button"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </ToolbarButton>
            <ToolbarButton
              type="button"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              I
            </ToolbarButton>
            <ToolbarButton
              type="button"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              U
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              type="button"
              active={editor.isActive("heading", { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              type="button"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </ToolbarButton>
            <ToolbarButton type="button" onClick={() => editor.chain().focus().setParagraph().run()}>
              P
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton
              type="button"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              UL
            </ToolbarButton>
            <ToolbarButton
              type="button"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              OL
            </ToolbarButton>
            <ToolbarButton type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
              Clear
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton type="button" onClick={() => imageInputRef.current?.click()}>
              IMG
            </ToolbarButton>
            <ToolbarButton
              type="button"
              active={editor.isActive("image", { class: "image-float-left" })}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setImageClass("image-float-left")}
              aria-label="Image align left"
            >
              🖼
              <ToolbarMiniAlignGlyph mode="left" aria-hidden="true">
                <span />
                <span />
                <span />
              </ToolbarMiniAlignGlyph>
            </ToolbarButton>
            <ToolbarButton
              type="button"
              active={editor.isActive("image", { class: "image-float-right" })}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setImageClass("image-float-right")}
              aria-label="Image align right"
            >
              🖼
              <ToolbarMiniAlignGlyph mode="right" aria-hidden="true">
                <span />
                <span />
                <span />
              </ToolbarMiniAlignGlyph>
            </ToolbarButton>
            <ToolbarButton
              type="button"
              active={editor.isActive("image", { class: "image-line-only" })}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setImageClass("image-line-only")}
              aria-label="Image line only"
            >
              🖼
              <ToolbarMiniAlignGlyph mode="center" aria-hidden="true">
                <span />
                <span />
                <span />
              </ToolbarMiniAlignGlyph>
            </ToolbarButton>
          </ToolbarGroup>
        </EditorToolbar>
      ) : null}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onPickImage(file);
          event.target.value = "";
        }}
      />

      <EditorContentWrap>
        <EditorContent editor={editor} />
      </EditorContentWrap>
    </EditorShell>
  );
}
