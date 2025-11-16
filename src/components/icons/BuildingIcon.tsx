import React from "react";
import Svg, { Path } from "react-native-svg";

const BuildingIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 14a1 1 0 0 1-1 1H5a1 1 0 0 1 0-2h1a1 1 0 0 1 1 1zm4-1h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm-5 4H5a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm5 0h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm-5-12H5a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm5 0h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm-5 4H5a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm5 0h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm13 1v9a5.006 5.006 0 0 1-5 5H5a5.006 5.006 0 0 1-5-5V5a5.006 5.006 0 0 1 5-5h6a5.006 5.006 0 0 1 5 5h3a5.006 5.006 0 0 1 5 5zm-19 12h9V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3zm17-12a3 3 0 0 0-3-3h-3v15h3a3 3 0 0 0 3-3zm-3 3a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm0 4a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm0-8a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"
      fill={color}
    />
  </Svg>
);

export default BuildingIcon;