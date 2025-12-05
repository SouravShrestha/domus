import React from "react";
import Svg, { Path } from "react-native-svg";

const ShareIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18,14a4,4,0,0,0-3.08,1.48L9.57,12.41a4.14,4.14,0,0,0,0-0.82l5.35-3.07A4,4,0,1,0,14,6a4.14,4.14,0,0,0,.09.82L8.74,9.89a4,4,0,1,0,0,4.22l5.35,3.07A4.14,4.14,0,0,0,14,18a4,4,0,1,0,4-4Z"
      fill={color}
    />
  </Svg>
);

export default ShareIcon;
