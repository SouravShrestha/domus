import React from "react";
import Svg, { Path } from "react-native-svg";

const CancelIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23.707.293h0a1 1 0 0 0-1.414 0L12 10.586 1.707.293a1 1 0 0 0-1.414 0h0a1 1 0 0 0 0 1.414L10.586 12 .293 22.293a1 1 0 0 0 0 1.414h0a1 1 0 0 0 1.414 0L12 13.414l10.293 10.293a1 1 0 0 0 1.414 0h0a1 1 0 0 0 0-1.414L13.414 12 23.707 1.707A1 1 0 0 0 23.707.293z"
      fill={color}
    />
  </Svg>
);

export default CancelIcon;