import { useSetAtom } from "jotai";
import { exportSnapshotAtom, openLoadModalAtom, saveCurrentSnapshotAtom } from "../../../state";
import { ToolButton, Toolbar } from "./StorageToolbar.styled";

export function StorageToolbar() {
  const saveSnapshot = useSetAtom(saveCurrentSnapshotAtom);
  const openLoadModal = useSetAtom(openLoadModalAtom);
  const exportSnapshot = useSetAtom(exportSnapshotAtom);

  return (
    <Toolbar>
      <ToolButton onClick={() => saveSnapshot()} title="Save to IndexedDB" aria-label="Save">
        💾
      </ToolButton>
      <ToolButton onClick={() => openLoadModal()} title="Load from IndexedDB" aria-label="Load">
        📂
      </ToolButton>
      <ToolButton onClick={() => exportSnapshot()} title="Download grid as JPG" aria-label="Download image">
        🖼️
      </ToolButton>
    </Toolbar>
  );
}
