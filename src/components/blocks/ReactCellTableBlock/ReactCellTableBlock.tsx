import { useState } from "react";
import type { ReactCellTableBlockProps } from "./ReactCellTableBlock.types";

type ReactRow = {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  status: "Todo" | "In Progress" | "Done";
  notify: boolean;
  imageUrl: string;
};

export function ReactCellTableBlock({ config }: ReactCellTableBlockProps) {
  const imagePool = [
    "https://picsum.photos/id/1015/220/120",
    "https://picsum.photos/id/1025/220/120",
    "https://picsum.photos/id/1035/220/120",
    "https://picsum.photos/id/1043/220/120",
    "https://picsum.photos/id/1059/220/120",
    "https://picsum.photos/id/1069/220/120",
  ] as const;

  const [rows, setRows] = useState<ReactRow[]>([
    {
      id: "T-01",
      task: "Landing QA",
      owner: "Alice",
      dueDate: "2026-02-12",
      status: "Todo",
      notify: true,
      imageUrl: imagePool[0],
    },
    {
      id: "T-02",
      task: "API Connect",
      owner: "Brian",
      dueDate: "2026-02-15",
      status: "In Progress",
      notify: false,
      imageUrl: imagePool[2],
    },
    {
      id: "T-03",
      task: "Chart Review",
      owner: "Chris",
      dueDate: "2026-02-20",
      status: "Done",
      notify: true,
      imageUrl: imagePool[4],
    },
  ]);

  const updateRow = <K extends keyof ReactRow>(id: string, key: K, value: ReactRow[K]) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  return (
    <div className="react-table-shell">
      <table className="react-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Task</th>
            <th>Owner Dropdown</th>
            <th>Calendar</th>
            <th>Status Dropdown</th>
            <th>Image</th>
            <th>Notify</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, Math.max(1, config.rowLimit)).map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.task}</td>
              <td>
                <select value={row.owner} onChange={(event) => updateRow(row.id, "owner", event.target.value)}>
                  <option>Alice</option>
                  <option>Brian</option>
                  <option>Chris</option>
                  <option>Dana</option>
                </select>
              </td>
              <td>
                <input
                  type="date"
                  value={row.dueDate}
                  onChange={(event) => updateRow(row.id, "dueDate", event.target.value)}
                />
              </td>
              <td>
                <select
                  value={row.status}
                  onChange={(event) => updateRow(row.id, "status", event.target.value as ReactRow["status"])}
                >
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </td>
              <td>
                <img className="react-table-thumb" src={row.imageUrl} alt={`random-${row.id}`} />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={row.notify}
                  onChange={(event) => updateRow(row.id, "notify", event.target.checked)}
                />
              </td>
              <td>
                <button className="row-action-btn">Open</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
