import { useState, useEffect } from "react";
import { CartesianSettings } from "./types";

interface AxisSelectorProps {
  columns: string[];
  onSettingsChange: (settings: CartesianSettings) => void;
}

export const AxisSelector: React.FC<AxisSelectorProps> = ({
  columns,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<CartesianSettings>({
    xPositive: columns[0] || "",
    xNegative: columns[1] || "",
    yPositive: columns[2] || "",
    yNegative: columns[3] || "",
  });

  useEffect(() => {
    // Update default selections when columns change
    if (columns.length >= 4) {
      setSettings({
        xPositive: columns[0],
        xNegative: columns[1],
        yPositive: columns[2],
        yNegative: columns[3],
      });
    }
  }, [columns]);

  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const handleSettingChange = (
    axis: keyof CartesianSettings,
    value: string
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [axis]: value };
      return newSettings;
    });
  };

  if (columns.length < 4) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded">
        Please add at least 4 columns to use the Cartesian plot.
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 border rounded">
      <h3 className="text-xl font-semibold mb-3">Axis Settings</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">X+ (Right) Axis</label>
          <select
            className="w-full p-2 border rounded"
            value={settings.xPositive}
            onChange={(e) => handleSettingChange("xPositive", e.target.value)}
          >
            {columns.map((column) => (
              <option key={`xPos-${column}`} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">X- (Left) Axis</label>
          <select
            className="w-full p-2 border rounded"
            value={settings.xNegative}
            onChange={(e) => handleSettingChange("xNegative", e.target.value)}
          >
            {columns.map((column) => (
              <option key={`xNeg-${column}`} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Y+ (Up) Axis</label>
          <select
            className="w-full p-2 border rounded"
            value={settings.yPositive}
            onChange={(e) => handleSettingChange("yPositive", e.target.value)}
          >
            {columns.map((column) => (
              <option key={`yPos-${column}`} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Y- (Down) Axis</label>
          <select
            className="w-full p-2 border rounded"
            value={settings.yNegative}
            onChange={(e) => handleSettingChange("yNegative", e.target.value)}
          >
            {columns.map((column) => (
              <option key={`yNeg-${column}`} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
