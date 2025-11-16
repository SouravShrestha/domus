import React from "react";
import Svg, { Path } from "react-native-svg";

const MapPinIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6c0-3.309-2.691-6-6-6S6 2.691 6 6c0 2.968 2.166 5.439 5 5.916v11.084c0 .552.448 1 1 1s1-.448 1-1V11.916c2.834-.477 5-2.948 5-5.916z"
      fill={color}
    />
  </Svg>
);

export default MapPinIcon;