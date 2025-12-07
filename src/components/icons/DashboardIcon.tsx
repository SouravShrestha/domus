import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

const DashboardIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth={2} />
    <Rect x="14" y="3" width="7" height="4" rx="1" stroke={color} strokeWidth={2} />
    <Rect x="14" y="10" width="7" height="11" rx="1" stroke={color} strokeWidth={2} />
    <Rect x="3" y="13" width="7" height="8" rx="1" stroke={color} strokeWidth={2} />
  </Svg>
);

export default DashboardIcon;

