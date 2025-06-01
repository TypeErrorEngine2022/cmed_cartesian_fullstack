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
  const [editCellInfo, setEditCellInfo] = useState<{
    rowName: string;
    columnName: string;
    value: string;
  } | null>(null);
  const [editAnnotationInfo, setEditAnnotationInfo] = useState<{
    rowName: string;
    value: string;
  } | null>(null);
  const [deleteColumnConfirm, setDeleteColumnConfirm] = useState<string | null>(
    null
  );

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
      await api.addRow(newRowName);
      setNewRowName("");
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
    setEditAnnotationInfo(null); // Close any open annotation editor
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

  const handleAnnotationClick = (rowName: string, value: string) => {
    setEditAnnotationInfo({ rowName, value });
    setEditCellInfo(null); // Close any open cell editor
  };

  const handleAnnotationUpdate = async () => {
    if (!editAnnotationInfo) return;

    try {
      await api.updateAnnotation(
        editAnnotationInfo.rowName,
        editAnnotationInfo.value
      );
      setEditAnnotationInfo(null);
      onDataChange();
    } catch (error) {
      console.error("Error updating annotation:", error);
    }
  };

  const handleDeleteColumnClick = (columnName: string) => {
    setDeleteColumnConfirm(columnName);
  };

  const handleDeleteColumnCancel = () => {
    setDeleteColumnConfirm(null);
  };

  const handleDeleteColumnConfirm = async () => {
    if (!deleteColumnConfirm) return;

    try {
      await api.deleteColumn(deleteColumnConfirm);
      setDeleteColumnConfirm(null);
      onDataChange();
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Data Table</h2>

      {deleteColumnConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete the column "{deleteColumnConfirm}
              "? This action cannot be undone and will remove all data in this
              column.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteColumnCancel}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteColumnConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
              <th key={column} className="relative group">
                {column}
                <button
                  onClick={() => handleDeleteColumnClick(column)}
                  className="absolute top-0 right-0 text-xs text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete column"
                >
                  ×
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td
                onClick={() => handleAnnotationClick(row.name, row.annotation)}
                className="cursor-pointer"
              >
                {editAnnotationInfo &&
                editAnnotationInfo.rowName === row.name ? (
                  <div className="flex">
                    <input
                      type="text"
                      value={editAnnotationInfo.value}
                      onChange={(e) =>
                        setEditAnnotationInfo({
                          ...editAnnotationInfo,
                          value: e.target.value,
                        })
                      }
                      autoFocus
                      className="p-1 border rounded flex-1"
                      onBlur={handleAnnotationUpdate}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAnnotationUpdate();
                        }
                      }}
                    />
                  </div>
                ) : (
                  row.annotation || "—"
                )}
              </td>
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
