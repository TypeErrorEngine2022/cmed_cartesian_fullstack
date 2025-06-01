import { useState, useEffect } from "react";
import { DataTable } from "./DataTable";
import { CartesianPlot } from "./CartesianPlot";
import { AxisSelector } from "./AxisSelector";
import { api } from "./api";
import { TableData, CartesianSettings } from "./types";
import { useAuth } from "./AuthContext";

function App() {
  const { logout } = useAuth();
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
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">CMED Cartesian Plot</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, chub</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-500 rounded text-red-700">
          {error}
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
              <div className="mb-24">
                <CartesianPlot data={tableData} settings={plotSettings} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
