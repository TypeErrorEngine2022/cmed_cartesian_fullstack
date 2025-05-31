import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  LabelList,
  ReferenceLine,
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

  // Calculate dynamic domains based on data points
  const domains = useMemo(() => {
    if (chartData.length === 0) {
      return { x: [-10, 10], y: [-10, 10] }; // Default domain if no data
    }

    // Find min and max for x and y coordinates
    const xValues = chartData.map((point) => point.x);
    const yValues = chartData.map((point) => point.y);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // for symmetry, we want to ensure the domain is centered around zero
    const maxX = Math.max(Math.abs(xMin), Math.abs(xMax));
    const maxY = Math.max(Math.abs(yMin), Math.abs(yMax));

    // Add some padding (20%) to the domain for better visualization
    const xPadding = Math.max(1, (xMax - xMin) * 0.2);
    const yPadding = Math.max(1, (yMax - yMin) * 0.2);

    return {
      x: [Math.floor(-maxX - xPadding), Math.ceil(maxX + xPadding)],
      y: [Math.floor(-maxY - yPadding), Math.ceil(maxY + yPadding)],
    };
  }, [chartData]);

  return (
    <div className="cartesian-plot-container">
      <h2 className="text-2xl font-bold mb-4">Cartesian Plot</h2>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />

          {/* Reference lines for axes */}
          <ReferenceLine x={0} stroke="#000" strokeWidth={1.5} />
          <ReferenceLine y={0} stroke="#000" strokeWidth={1.5} />

          <XAxis
            type="number"
            dataKey="x"
            name="X"
            domain={domains.x}
            tickCount={11}
            axisLine={false}
          >
            <Label
              value={`${xPositive} — ${xNegative}`}
              position="bottom"
              offset={20}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            name="Y"
            domain={domains.y}
            tickCount={11}
            axisLine={false}
          >
            <Label
              value={`${yPositive} — ${yNegative}`}
              position="left"
              angle={-90}
              offset={25}
              style={{ textAnchor: "middle" }}
            />
          </YAxis>

          <Tooltip content={<CustomTooltip />} />
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
                      x={typeof cx === "number" ? cx + 5 : 5}
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
