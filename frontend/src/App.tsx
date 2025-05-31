import { useState, useEffect } from "react";
import { DataTable } from "./DataTable";
import { CartesianPlot } from "./CartesianPlot";
import { AxisSelector } from "./AxisSelector";
import { api } from "./api";
import { TableData, CartesianSettings } from "./types";

function App() {
  const [tableData, setTableData] = useState<TableData>({
    columns: [],
    rows: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plotSettings, setPlotSettings] = useState<CartesianSettings>({
    xPositive: "",
    xNegative: "",
    yPositive: "",
    yNegative: "",
  });

  // Load table data from the backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getTableData();
      setTableData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data from the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle plot settings change
  const handlePlotSettingsChange = (settings: CartesianSettings) => {
    setPlotSettings(settings);
    // Store settings in localStorage for persistence
    localStorage.setItem("cartesianPlotSettings", JSON.stringify(settings));
  };

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("cartesianPlotSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setPlotSettings(parsedSettings);
      } catch (err) {
        console.error("Error parsing saved plot settings:", err);
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Cartesian Coordinate Analysis Tool
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
          <button
            onClick={fetchData}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <DataTable data={tableData} onDataChange={fetchData} />
          </div>

          <div>
            <AxisSelector
              columns={tableData.columns}
              onSettingsChange={handlePlotSettingsChange}
            />

            {tableData.columns.length >= 4 && (
              <CartesianPlot data={tableData} settings={plotSettings} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
