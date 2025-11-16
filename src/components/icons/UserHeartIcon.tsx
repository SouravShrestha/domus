import React from "react";
import Svg, { Path } from "react-native-svg";

const UserHeartIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 12A6 6 0 1 0 3 6a6.006 6.006 0 0 0 6 6Zm0-10a4 4 0 1 1-4 4 4 4 0 0 1 4-4Z"
      fill={color}
    />
    <Path
      d="M9 14a9.011 9.011 0 0 0-9 9 1 1 0 0 0 2 0 7 7 0 0 1 14 0 1 1 0 0 0 2 0 9.011 9.011 0 0 0-9-9Z"
      fill={color}
    />
    <Path
      d="M22 7.875a2.107 2.107 0 0 0-2 2.2 2.107 2.107 0 0 0-2-2.2 2.107 2.107 0 0 0-2 2.2c0 1.73 2.256 3.757 3.38 4.659a.992.992 0 0 0 1.24 0c1.124-.9 3.38-2.929 3.38-4.659a2.107 2.107 0 0 0-2-2.2Z"
      fill={color}
    />
  </Svg>
);

export default UserHeartIcon;
