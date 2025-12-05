import React from "react";
import Svg, { Path } from "react-native-svg";

const MarkerFilledIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12,.042a9.992,9.992,0,0,0-9.981,9.98c0,2.57,1.99,6.592,5.915,11.954a5.034,5.034,0,0,0,8.132,0c3.925-5.362,5.915-9.384,5.915-11.954A9.992,9.992,0,0,0,12,.042ZM12,14a4,4,0,1,1,4-4A4,4,0,0,1,12,14Z"
      fill={color}
    />
  </Svg>
);

export default MarkerFilledIcon;
