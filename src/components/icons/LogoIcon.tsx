import React from "react";
import Svg, { Path } from "react-native-svg";

const LogoIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 26, height = 26, color = "white" }) => (
  <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
    <Path
      d="M50 0C22.386 0 0 22.386 0 50s22.386 50 50 50 50-22.386 50-50S77.614 0 50 0Zm0 90.909C27.273 90.909 9.091 72.727 9.091 50S27.273 9.091 50 9.091 90.909 27.273 90.909 50 72.727 90.909 50 90.909Z"
      fill={color}
    />
  </Svg>
);

export default LogoIcon;