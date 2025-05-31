import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  LabelList,
} from "recharts";
import { TableData, CartesianSettings } from "./types";

interface CartesianPlotProps {
  data: TableData;
  settings: CartesianSettings;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="tooltip">
        <p className="font-bold">{data.name}</p>
        <p>
          Coordinates: ({data.x.toFixed(2)}, {data.y.toFixed(2)})
        </p>
        {data.annotation && (
          <p>
            <span className="font-semibold">Annotation:</span> {data.annotation}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const CartesianPlot: React.FC<CartesianPlotProps> = ({
  data,
  settings,
}) => {
  const { xPositive, xNegative, yPositive, yNegative } = settings;

  // Convert table data to plot points
  const chartData = useMemo(() => {
    return data.rows.map((row) => {
      // Calculate X coordinate based on xPositive and xNegative values
      // We'll use a scale from -10 to 10 for the visualization
      const xPosValue = parseFloat(row.attributes[xPositive] || "0");
      const xNegValue = parseFloat(row.attributes[xNegative] || "0");
      const xCoord = xPosValue - xNegValue;

      // Calculate Y coordinate based on yPositive and yNegative values
      const yPosValue = parseFloat(row.attributes[yPositive] || "0");
      const yNegValue = parseFloat(row.attributes[yNegative] || "0");
      const yCoord = yPosValue - yNegValue;

      return {
        x: xCoord,
        y: yCoord,
        name: row.name,
        annotation: row.annotation,
      };
    });
  }, [data, xPositive, xNegative, yPositive, yNegative]);

  return (
    <div className="cartesian-plot-container">
      <h2 className="text-2xl font-bold mb-4">Cartesian Plot</h2>

      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p>
          <span className="font-semibold">X+ (Right):</span> {xPositive}
        </p>
        <p>
          <span className="font-semibold">X- (Left):</span> {xNegative}
        </p>
        <p>
          <span className="font-semibold">Y+ (Up):</span> {yPositive}
        </p>
        <p>
          <span className="font-semibold">Y- (Down):</span> {yNegative}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name="X"
            domain={[-10, 10]}
            tickCount={21}
          >
            <Label value={`${xPositive} — ${xNegative}`} position="bottom" />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            name="Y"
            domain={[-10, 10]}
            tickCount={21}
          >
            <Label
              value={`${yPositive} — ${yNegative}`}
              position="left"
              angle={-90}
              style={{ textAnchor: "middle" }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Scatter
            name="Data Points"
            data={chartData}
            fill="#8884d8"
            shape="circle"
            isAnimationActive={false}
          >
            <LabelList
              dataKey="annotation"
              content={(props) => {
                // Only show the label if the annotation is short (less than 15 characters)
                const { value, cx, cy } = props;
                if (value && value.toString().length < 15) {
                  return (
                    <text
                      x={cx ?? 0 + 5}
                      y={cy}
                      textAnchor="start"
                      fill="#333"
                      fontSize={10}
                    >
                      {value}
                    </text>
                  );
                }
                return null;
              }}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
