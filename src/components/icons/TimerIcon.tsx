import React from "react";
import Svg, { Circle, Line } from "react-native-svg";

interface TimerIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}

const TimerIcon: React.FC<TimerIconProps> = ({
  width = 24,
  height = 24,
  stroke = "black",
  fill = "none",
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
    <Circle
      cx={12}
      cy={12}
      r={10}
      stroke={stroke}
      strokeWidth={2}
      fill={fill}
    />
    <Line
      x1={12}
      y1={6}
      x2={12}
      y2={12}
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Line
      x1={12}
      y1={12}
      x2={16}
      y2={14}
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default TimerIcon;
