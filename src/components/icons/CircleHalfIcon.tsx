import React from "react";
import Svg, { Path } from "react-native-svg";

const CircleHalfIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2v20c0 .552-.448 1-1 1-7.71 0-11-3.29-11-11s3.29-11 11-11c.552 0 1 .448 1 1z"
      fill={color}
    />
  </Svg>
);

export default CircleHalfIcon;