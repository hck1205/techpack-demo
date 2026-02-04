import { atom } from "jotai";
import html2canvas from "html2canvas";
import type { Layout, LayoutItem } from "react-grid-layout/legacy";
import { BLOCK_SIZE, defaultBlockConfig } from "../config/blocks";
import {
  deleteSnapshot,
  listSnapshots,
  loadSnapshot,
  saveSnapshot,
  type EditorSnapshot,
  type SnapshotMeta,
} from "../services/editorSnapshots";
import type { BlockConfigMap, BlockType, GridItem, Slide } from "../types/blocks";

const INITIAL_SLIDES: Slide[] = [{ id: "slide-1", title: "Page 1", items: [] }];

type UpdateBlockConfigPayload = {
  itemId: string;
  type: BlockType;
  patch: Partial<BlockConfigMap[BlockType]>;
};

type AddDroppedBlockPayload = {
  droppedItem: LayoutItem;
  blockType: BlockType;
};

export const slidesAtom = atom<Slide[]>(INITIAL_SLIDES);
export const activeSlideIdAtom = atom<string>(INITIAL_SLIDES[0].id);
export const draggingTypeAtom = atom<BlockType | null>(null);
export const selectedBlockIdAtom = atom<string | null>(null);

export const isLoadModalOpenAtom = atom(false);
export const savedSnapshotsAtom = atom<SnapshotMeta[]>([]);
export const isLoadingSnapshotsAtom = atom(false);
export const snapshotErrorAtom = atom<string | null>(null);

export const activeSlideAtom = atom((get) => {
  const slides = get(slidesAtom);
  const activeSlideId = get(activeSlideIdAtom);
  return slides.find((slide) => slide.id === activeSlideId) ?? slides[0];
});

export const layoutAtom = atom<Layout>((get) => {
  const activeSlide = get(activeSlideAtom);
  return activeSlide.items.map((item) => ({
    i: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }));
});

export const selectedItemAtom = atom((get) => {
  const activeSlide = get(activeSlideAtom);
  const selectedBlockId = get(selectedBlockIdAtom);
  return activeSlide.items.find((item) => item.id === selectedBlockId) ?? null;
});

export const currentSnapshotAtom = atom<EditorSnapshot>((get) => ({
  slides: get(slidesAtom),
  activeSlideId: get(activeSlideIdAtom),
}));

export const addSlideAtom = atom(null, (get, set) => {
  const slides = get(slidesAtom);
  const nextNumber = slides.length + 1;
  const nextSlide: Slide = { id: `slide-${nextNumber}`, title: `Page ${nextNumber}`, items: [] };
  set(slidesAtom, [...slides, nextSlide]);
  set(activeSlideIdAtom, nextSlide.id);
  set(selectedBlockIdAtom, null);
});

export const updateLayoutAtom = atom(null, (get, set, nextLayout: Layout) => {
  const activeSlideId = get(activeSlideIdAtom);
  set(slidesAtom, (prev) =>
    prev.map((slide) => {
      if (slide.id !== activeSlideId) return slide;

      return {
        ...slide,
        items: slide.items.map((item) => {
          const found = nextLayout.find((layoutItem) => layoutItem.i === item.id);
          if (!found) return item;
          return { ...item, x: found.x, y: found.y, w: found.w, h: found.h };
        }),
      };
    })
  );
});

export const addDroppedBlockAtom = atom(null, (get, set, payload: AddDroppedBlockPayload) => {
  const { droppedItem, blockType } = payload;
  const activeSlideId = get(activeSlideIdAtom);
  const size = BLOCK_SIZE[blockType];

  const newItem: GridItem = {
    id: `${blockType}-${Date.now()}`,
    type: blockType,
    x: droppedItem.x,
    y: droppedItem.y,
    w: size.w,
    h: size.h,
    config: defaultBlockConfig(blockType),
  };

  set(slidesAtom, (prev) =>
    prev.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      return { ...slide, items: [...slide.items, newItem] };
    })
  );
  set(selectedBlockIdAtom, newItem.id);
  set(draggingTypeAtom, null);
});

export const updateBlockConfigAtom = atom(null, (get, set, payload: UpdateBlockConfigPayload) => {
  const { itemId, type, patch } = payload;
  const activeSlideId = get(activeSlideIdAtom);

  set(slidesAtom, (prev) =>
    prev.map((slide) => {
      if (slide.id !== activeSlideId) return slide;

      return {
        ...slide,
        items: slide.items.map((item) => {
          if (item.id !== itemId || item.type !== type) return item;
          return {
            ...item,
            config: {
              ...(item.config as Record<string, unknown>),
              ...(patch as Record<string, unknown>),
            } as GridItem["config"],
          };
        }),
      };
    })
  );
});

export const deleteSelectedBlockAtom = atom(null, (get, set) => {
  const activeSlideId = get(activeSlideIdAtom);
  const selectedBlockId = get(selectedBlockIdAtom);
  if (!selectedBlockId) return;

  set(slidesAtom, (prev) =>
    prev.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      return {
        ...slide,
        items: slide.items.filter((item) => item.id !== selectedBlockId),
      };
    })
  );
  set(selectedBlockIdAtom, null);
});

export const refreshSnapshotsAtom = atom(null, async (_get, set) => {
  set(isLoadingSnapshotsAtom, true);
  set(snapshotErrorAtom, null);
  try {
    const items = await listSnapshots();
    set(savedSnapshotsAtom, items);
  } catch {
    set(snapshotErrorAtom, "Failed to load saved snapshots");
  } finally {
    set(isLoadingSnapshotsAtom, false);
  }
});

export const saveCurrentSnapshotAtom = atom(null, async (get, set) => {
  set(snapshotErrorAtom, null);
  try {
    await saveSnapshot(get(currentSnapshotAtom));
    if (get(isLoadModalOpenAtom)) {
      await set(refreshSnapshotsAtom);
    }
  } catch {
    set(snapshotErrorAtom, "Failed to save snapshot");
  }
});

export const openLoadModalAtom = atom(null, async (_get, set) => {
  set(isLoadModalOpenAtom, true);
  await set(refreshSnapshotsAtom);
});

export const closeLoadModalAtom = atom(null, (_get, set) => {
  set(isLoadModalOpenAtom, false);
});

export const loadSnapshotByIdAtom = atom(null, async (_get, set, id: string) => {
  set(snapshotErrorAtom, null);
  try {
    const record = await loadSnapshot(id);
    if (!record) return;

    const loadedSlides =
      record.data.slides.length > 0 ? record.data.slides : [{ id: "slide-1", title: "Page 1", items: [] }];
    const loadedActiveId = loadedSlides.some((slide) => slide.id === record.data.activeSlideId)
      ? record.data.activeSlideId
      : loadedSlides[0].id;

    set(slidesAtom, loadedSlides);
    set(activeSlideIdAtom, loadedActiveId);
    set(selectedBlockIdAtom, null);
    set(isLoadModalOpenAtom, false);
  } catch {
    set(snapshotErrorAtom, "Failed to load selected snapshot");
  }
});

export const deleteSnapshotByIdAtom = atom(null, async (_get, set, id: string) => {
  set(snapshotErrorAtom, null);
  try {
    await deleteSnapshot(id);
    await set(refreshSnapshotsAtom);
  } catch {
    set(snapshotErrorAtom, "Failed to delete selected snapshot");
  }
});

export const exportSnapshotAtom = atom(null, async (_get, set) => {
  set(snapshotErrorAtom, null);
  try {
    const target = document.querySelector(".canvas-drop-zone");
    if (!(target instanceof HTMLElement)) {
      set(snapshotErrorAtom, "Grid layout area was not found");
      return;
    }

    const canvas = await html2canvas(target, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imageUrl = canvas.toDataURL("image/jpeg", 0.92);
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `techpack-grid-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch {
    set(snapshotErrorAtom, "Failed to export grid layout image");
  }
});
