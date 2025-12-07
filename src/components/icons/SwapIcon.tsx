import React from "react";
import Svg, { Path } from "react-native-svg";

const SwapIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 16L3 12M3 12L7 8M3 12H15M17 8L21 12M21 12L17 16M21 12H9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SwapIcon;

