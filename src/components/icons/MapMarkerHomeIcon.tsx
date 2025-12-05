import React from "react";
import Svg, { Path } from "react-native-svg";

const MapMarkerHomeIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.071,2.936A10,10,0,1,0,4.937,17.085L12,23.994l7.071-6.917a10,10,0,0,0,0-14.141ZM17,14H7V9.409a2.513,2.513,0,0,1,.983-1.986l2.5-1.91a2.507,2.507,0,0,1,3.035,0l2.5,1.91A2.515,2.515,0,0,1,17,9.409Zm-2.2-4.987a.5.5,0,0,1,.2.4V12H13V10H11v2H9V9.409a.5.5,0,0,1,.2-.4L11.7,7.1a.5.5,0,0,1,.608,0Z"
      fill={color}
    />
  </Svg>
);

export default MapMarkerHomeIcon;
