import React from "react";
import Svg, { Path } from "react-native-svg";

const FastIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M24,13a11.914,11.914,0,0,1-3.508,8.47,3.037,3.037,0,0,1-4.12.174l-1.026-.887a1,1,0,0,1,1.308-1.514l1.027.888a1.014,1.014,0,0,0,1.395-.075,10.044,10.044,0,0,0-.414-14.513,9.9,9.9,0,0,0-7.823-2.478A9.992,9.992,0,0,0,4.962,20.094a1,1,0,0,0,1.357.038l1.027-.889a1,1,0,0,1,1.308,1.514l-1.026.888a3.016,3.016,0,0,1-4.073-.129A12,12,0,1,1,24,13ZM17.707,8.707a1,1,0,0,0-1.414-1.414l-3.775,3.775a2,2,0,1,0,1.414,1.414Z"
      fill={color}
    />
  </Svg>
);

export default FastIcon;