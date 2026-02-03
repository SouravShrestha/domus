import React from "react";
import Svg, { Path } from "react-native-svg";

const DriverIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M.327,12c.029-.093.042-.19.075-.282L3.1,4.291A5.012,5.012,0,0,1,7.8,1h8.4a5.011,5.011,0,0,1,4.7,3.292l2.7,7.426c.033.092.046.189.075.282ZM20,14v2a1,1,0,0,1-2,0V14H6v2a1,1,0,0,1-2,0V14H0v2a5,5,0,0,0,3,4.576V22a2,2,0,0,0,4,0V21H17v1a2,2,0,0,0,4,0V20.576A5,5,0,0,0,24,16V14Z" fill={color} />
  </Svg>
);

export default DriverIcon;
