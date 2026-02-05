import styled from "@emotion/styled";

export const DummyShell = styled.div`
  width: 100%;
  height: 100%;
  display: block;
  border: none;
  border-radius: 8px;
  background: #ffffff;
  position: relative;
  overflow: hidden;

  &::before {
    content: "DUMMY";
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: rgba(71, 85, 105, 0.7);
    background: repeating-linear-gradient(
      -45deg,
      rgba(148, 163, 184, 0.16) 0,
      rgba(148, 163, 184, 0.16) 10px,
      rgba(148, 163, 184, 0.04) 10px,
      rgba(148, 163, 184, 0.04) 20px
    );
    opacity: 0;
    transition: opacity 0.16s ease;
    pointer-events: none;
  }

  &:hover::before,
  .block-card:hover &::before {
    opacity: 1;
  }
`;
