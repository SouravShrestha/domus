import React from "react";
import Svg, { Path } from "react-native-svg";

const NoticeBoardIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 0h-8C5.243 0 3 2.243 3 5v14c0 2.757 2.243 5 5 5h8c2.757 0 5-2.243 5-5V5c0-2.757-2.243-5-5-5Zm3 19c0 1.654-1.346 3-3 3h-8c-1.654 0-3-1.346-3-3V5c0-1.654 1.346-3 3-3h8c1.654 0 3 1.346 3 3v14Zm-2-13c0 .553-.447 1-1 1h-8c-.553 0-1-.447-1-1s.447-1 1-1h8c.553 0 1 .447 1 1Zm0 5c0 .553-.447 1-1 1h-8c-.553 0-1-.447-1-1s.447-1 1-1h8c.553 0 1 .447 1 1Zm-4 5c0 .553-.447 1-1 1h-4c-.553 0-1-.447-1-1s.447-1 1-1h4c.553 0 1 .447 1 1Z"
      fill={color}
    />
  </Svg>
);

export default NoticeBoardIcon;