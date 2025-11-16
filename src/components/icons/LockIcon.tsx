import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

interface LockIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}

const LockIcon: React.FC<LockIconProps> = ({
  width = 24,
  height = 24,
  stroke = "black",
  fill = "none",
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill={fill}
  >
    <Rect
      x={6}
      y={11}
      width={12}
      height={10}
      stroke={stroke}
      strokeWidth={2}
      rx={2}
      ry={2}
      fill={fill}
    />
    <Path
      d="M8 11V7a4 4 0 0 1 8 0v4"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default LockIcon;