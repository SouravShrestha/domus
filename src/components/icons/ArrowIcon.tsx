import * as React from "react";
import Svg, { Path } from "react-native-svg";

const ArrowIcon = ({ width = 24, height = 24, stroke = "#000" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ArrowIcon;