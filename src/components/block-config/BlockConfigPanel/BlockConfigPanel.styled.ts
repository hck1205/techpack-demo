import styled from "@emotion/styled";

export const ConfigPanel = styled.section`
  width: 100%;
  margin: 0;
  flex: 1;
  background: #ffffff;
  border: 1px solid #d8dee8;
  border-radius: 14px;
  padding: 14px;
  box-sizing: border-box;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
`;

export const PanelTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

export const ConfigEmpty = styled.div`
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 14px;
  color: #64748b;
  font-size: 13px;
`;

export const ConfigFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: auto;
`;

export const ConfigField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #334155;

  input,
  select,
  button {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 6px 8px;
    font-size: 13px;
  }

  button {
    cursor: pointer;
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
    font-weight: 600;
  }

  &.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .radio-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .radio-option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #334155;
  }

  .radio-option input {
    margin: 0;
  }

  .inline-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

export const DeleteButton = styled.button`
  margin-top: auto;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff1f2;
  color: #be123c;
  font-weight: 700;
  font-size: 12px;
  padding: 8px 10px;
  cursor: pointer;
`;
