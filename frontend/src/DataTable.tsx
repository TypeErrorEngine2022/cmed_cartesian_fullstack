import { useState } from "react";
import { TableData } from "./types";
import { api } from "./api";

interface DataTableProps {
  data: TableData;
  onDataChange: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, onDataChange }) => {
  const [newColumnName, setNewColumnName] = useState("");
  const [newRowName, setNewRowName] = useState("");
  const [newRowAnnotation, setNewRowAnnotation] = useState("");
  const [editCellInfo, setEditCellInfo] = useState<{
    rowName: string;
    columnName: string;
    value: string;
  } | null>(null);

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    try {
      await api.addColumn(newColumnName);
      setNewColumnName("");
      onDataChange();
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleAddRow = async () => {
    if (!newRowName.trim()) return;
    try {
      await api.addRow(newRowName, newRowAnnotation);
      setNewRowName("");
      setNewRowAnnotation("");
      onDataChange();
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  const handleCellClick = (
    rowName: string,
    columnName: string,
    value: string
  ) => {
    setEditCellInfo({ rowName, columnName, value });
  };

  const handleCellUpdate = async () => {
    if (!editCellInfo) return;

    try {
      await api.updateCell(
        editCellInfo.rowName,
        editCellInfo.columnName,
        editCellInfo.value
      );
      setEditCellInfo(null);
      onDataChange();
    } catch (error) {
      console.error("Error updating cell:", error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Data Table</h2>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="New column name"
            className="p-2 border rounded w-full"
          />
        </div>
        <button
          onClick={handleAddColumn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Column
        </button>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={newRowName}
            onChange={(e) => setNewRowName(e.target.value)}
            placeholder="New row name"
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="text"
            value={newRowAnnotation}
            onChange={(e) => setNewRowAnnotation(e.target.value)}
            placeholder="Annotation (optional)"
            className="p-2 border rounded w-full"
          />
        </div>
        <button
          onClick={handleAddRow}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 self-start"
        >
          Add Row
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Annotation</th>
            {data.columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.annotation}</td>
              {data.columns.map((column) => (
                <td
                  key={`${row.name}-${column}`}
                  onClick={() =>
                    handleCellClick(
                      row.name,
                      column,
                      row.attributes[column] || "NA"
                    )
                  }
                  className="cursor-pointer"
                >
                  {editCellInfo &&
                  editCellInfo.rowName === row.name &&
                  editCellInfo.columnName === column ? (
                    <div className="flex">
                      <input
                        type="text"
                        value={editCellInfo.value}
                        onChange={(e) =>
                          setEditCellInfo({
                            ...editCellInfo,
                            value: e.target.value,
                          })
                        }
                        autoFocus
                        className="p-1 border rounded flex-1"
                        onBlur={handleCellUpdate}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCellUpdate();
                          }
                        }}
                      />
                    </div>
                  ) : (
                    row.attributes[column] || "NA"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
