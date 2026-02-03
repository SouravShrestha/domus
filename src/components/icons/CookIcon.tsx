import React from "react";
import Svg, { Path } from "react-native-svg";

const CookIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M.164,4.705C.928,1.592,5.211-.055,7.84,1.621a6.16,6.16,0,0,1,8.32,0c6.436-3.279,11.424,6.113,4.514,9.092a.934.934,0,0,0-.674.851V17H4V11.564a.934.934,0,0,0-.674-.851A5.017,5.017,0,0,1,.164,4.705ZM4,19a4.559,4.559,0,0,0,4.5,5h7A4.559,4.559,0,0,0,20,19Z" fill={color} />
  </Svg>
);

export default CookIcon;
