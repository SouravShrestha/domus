import React from "react";
import Svg, { Path, G } from "react-native-svg";

const CircleIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <G id="_01_align_center" data-name="01 align center">
      <Path
        d="M12,24A12,12,0,1,1,24,12,12.013,12.013,0,0,1,12,24Z"
        fill={color}
      />
    </G>
  </Svg>
);

export default CircleIcon;