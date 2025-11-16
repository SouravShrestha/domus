import React from "react";
import Svg, { Path, G } from "react-native-svg";

const GroupsIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 26, height = 26, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 26 26" fill="none">
    <G transform="translate(2, 2)">
      <Path
        d="M7.5 13a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5Zm0-7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0 -2.5-2.5Zm7.5 17v-.5a7.5 7.5 0 0 0 -15 0v.5a1 1 0 0 0 2 0v-.5a5.5 5.5 0 0 1 11 0v.5a1 1 0 0 0 2 0Zm9-5a7 7 0 0 0 -11.667-5.217 1 1 0 1 0 1.334 1.49 5 5 0 0 1 8.333 3.727 1 1 0 0 0 2 0Zm-6.5-9a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5Zm0-7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0 -2.5-2.5Z"
        fill={color}
      />
    </G>
  </Svg>
);

export default GroupsIcon;