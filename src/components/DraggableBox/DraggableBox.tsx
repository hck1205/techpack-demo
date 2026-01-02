import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Pos = { x: number; y: number };

const DraggableBox = ({ id, base }: { id: string; base: Pos }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  return (
    <div
      data-dnd-item={id}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        position: "absolute",
        left: base.x,
        top: base.y,
        width: 100,
        height: 60,
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "grab",
        userSelect: "none",
        transform: CSS.Translate.toString(transform), // 드래그 중만 이동
      }}
    >
      {id}
    </div>
  );
};

export default DraggableBox;
