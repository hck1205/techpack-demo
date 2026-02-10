import { useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { activeSlideIdAtom, addSlideAtom, slidesAtom } from "../../../state";
import {
  AddSlideButton,
  PanelTitle,
  SlideItem,
  SlideList,
  SlidesPanelContainer,
} from "./SlidesPanel.styled";

export function SlidesPanel() {
  const slides = useAtomValue(slidesAtom);
  const activeSlideId = useAtomValue(activeSlideIdAtom);
  const setActiveSlideId = useSetAtom(activeSlideIdAtom);
  const addSlide = useSetAtom(addSlideAtom);
  const [panelWidth, setPanelWidth] = useState(68);
  const [resizeHotzone, setResizeHotzone] = useState(false);
  const startRef = useRef<{ x: number; width: number } | null>(null);
  const isCompact = panelWidth <= 130;

  const beginResize = (clientX: number) => {
    startRef.current = { x: clientX, width: panelWidth };
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (moveEvent: MouseEvent) => {
      const start = startRef.current;
      if (!start) return;
      const nextWidth = Math.max(68, Math.min(320, start.width + (moveEvent.clientX - start.x)));
      setPanelWidth(nextWidth);
    };

    const onMouseUp = () => {
      startRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <SlidesPanelContainer
      width={panelWidth}
      compact={isCompact}
      resizeHotzone={resizeHotzone}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setResizeHotzone(rect.right - event.clientX <= 10);
      }}
      onMouseLeave={() => setResizeHotzone(false)}
      onMouseDown={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (rect.right - event.clientX > 10) return;
        event.preventDefault();
        beginResize(event.clientX);
      }}
    >
      <PanelTitle compact={isCompact} title="Slides">
        <span className="icon">🗂️</span>
        {!isCompact ? <span>Slides</span> : null}
      </PanelTitle>
      <SlideList>
        {slides.map((slide) => (
          <SlideItem
            key={slide.id}
            active={slide.id === activeSlideId}
            compact={isCompact}
            onClick={() => setActiveSlideId(slide.id)}
            title={`${slide.title} (${slide.items.length} blocks)`}
          >
            <span className="icon">🗒️</span>
            {!isCompact ? <span>{slide.title}</span> : null}
            {!isCompact ? <small>{slide.items.length} blocks</small> : null}
          </SlideItem>
        ))}
      </SlideList>
      <AddSlideButton onClick={() => addSlide()} compact={isCompact} title="Add page" aria-label="Add page">
        {isCompact ? "+" : "+ Add Page"}
      </AddSlideButton>
    </SlidesPanelContainer>
  );
}
