import React from "react";
import Svg, { Path } from "react-native-svg";

const VisitorsIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 20 24" fill="none">
    <Path
      d="M6 20H14C14.553 20 15 19.552 15 19C15 18.448 14.553 18 14 18H6C5.447 18 5 18.448 5 19C5 19.552 5.447 20 6 20ZM0 19V5C0 2.243 2.243 0 5 0H15C17.757 0 20 2.243 20 5V19C20 21.757 17.757 24 15 24H5C2.243 24 0 21.757 0 19ZM5 2C3.346 2 2 3.346 2 5V19C2 20.654 3.346 22 5 22H15C16.654 22 18 20.654 18 19V5C18 3.346 16.654 2 15 2H5Z"
      fill={color}
    />
  </Svg>
);

export default VisitorsIcon;
