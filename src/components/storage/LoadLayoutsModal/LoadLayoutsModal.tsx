import { useAtomValue, useSetAtom } from "jotai";
import {
  closeLoadModalAtom,
  deleteSnapshotByIdAtom,
  isLoadModalOpenAtom,
  isLoadingSnapshotsAtom,
  loadSnapshotByIdAtom,
  refreshSnapshotsAtom,
  savedSnapshotsAtom,
  snapshotErrorAtom,
} from "../../../state";
import {
  Body,
  DeleteButton,
  Empty,
  ErrorMessage,
  Header,
  HeaderActions,
  HeaderButton,
  List,
  Overlay,
  Panel,
  Row,
  RowContent,
  RowMeta,
  RowTitle,
  Title,
} from "./LoadLayoutsModal.styled";

export function LoadLayoutsModal() {
  const open = useAtomValue(isLoadModalOpenAtom);
  const items = useAtomValue(savedSnapshotsAtom);
  const loading = useAtomValue(isLoadingSnapshotsAtom);
  const error = useAtomValue(snapshotErrorAtom);
  const closeModal = useSetAtom(closeLoadModalAtom);
  const refreshSnapshots = useSetAtom(refreshSnapshotsAtom);
  const loadSnapshotById = useSetAtom(loadSnapshotByIdAtom);
  const deleteSnapshotById = useSetAtom(deleteSnapshotByIdAtom);

  if (!open) return null;

  return (
    <Overlay onClick={() => closeModal()}>
      <Panel onClick={(event) => event.stopPropagation()}>
        <Header>
          <Title>Load Snapshot</Title>
          <HeaderActions>
            <HeaderButton onClick={() => refreshSnapshots()}>Refresh</HeaderButton>
            <HeaderButton onClick={() => closeModal()}>Close</HeaderButton>
          </HeaderActions>
        </Header>

        <Body>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          <List>
            {loading ? <Empty>Loading snapshots...</Empty> : null}
            {!loading && items.length === 0 ? <Empty>No saved snapshots</Empty> : null}
            {!loading &&
              items.map((item) => (
                <Row key={item.id}>
                  <RowContent onClick={() => loadSnapshotById(item.id)}>
                    <RowTitle>{item.name}</RowTitle>
                    <RowMeta>{new Date(item.createdAt).toLocaleString()}</RowMeta>
                  </RowContent>
                  <DeleteButton
                    onClick={() => {
                      const ok = window.confirm(`Delete "${item.name}" snapshot?`);
                      if (ok) {
                        deleteSnapshotById(item.id);
                      }
                    }}
                  >
                    Delete
                  </DeleteButton>
                </Row>
              ))}
          </List>
        </Body>
      </Panel>
    </Overlay>
  );
}
