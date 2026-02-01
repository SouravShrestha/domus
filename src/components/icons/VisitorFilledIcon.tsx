import React from "react";
import Svg, { Path } from "react-native-svg";

const VisitorFilledIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M7 0C4.243 0 2 2.243 2 5V19C2 21.757 4.243 24 7 24H17C19.757 24 22 21.757 22 19V5C22 2.243 19.757 0 17 0H7ZM16 18C16.553 18 17 18.448 17 19C17 19.552 16.553 20 16 20H8C7.447 20 7 19.552 7 19C7 18.448 7.447 18 8 18H16Z" fill={color} />
  </Svg>
);

export default VisitorFilledIcon;
