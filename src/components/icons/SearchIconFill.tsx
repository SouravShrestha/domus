import React from "react";
import Svg, { Path } from "react-native-svg";

const SearchIconFill: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 511.786 511.786" fill="none">
    <Path
      d="M213.382,426.694c49.214,0.064,96.923-16.963,134.976-48.171l127.275,127.253c8.475,8.185,21.98,7.95,30.165-0.525   c7.984-8.267,7.984-21.373,0-29.641L378.545,348.337c74.545-91.24,61.011-225.636-30.229-300.181S122.68-12.855,48.135,78.385   S-12.876,304.02,78.364,378.566C116.472,409.701,164.172,426.704,213.382,426.694z"
      fill={color}
    />
  </Svg>
);

export default SearchIconFill;