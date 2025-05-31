import axios from "axios";
import { TableData } from "./types";

const API_URL = "http://localhost:3001";

export const api = {
  getTableData: async (): Promise<TableData> => {
    const response = await axios.get(`${API_URL}/table`);
    return response.data;
  },

  addColumn: async (column_name: string): Promise<void> => {
    await axios.post(`${API_URL}/column`, { column_name });
  },

  addRow: async (name: string, annotation: string): Promise<void> => {
    await axios.post(`${API_URL}/add_row`, { name, annotation });
  },

  updateCell: async (
    row_id: string,
    column_name: string,
    value: string
  ): Promise<void> => {
    await axios.put(`${API_URL}/cell`, { row_id, column_name, value });
  },
};
