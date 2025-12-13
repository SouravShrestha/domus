import React from "react";
import Svg, { Path } from "react-native-svg";

const ThumbsUpIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}> = ({ width = 24, height = 24, color = "black", filled = false }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    {filled ? (
      <Path
        d="M21.3 10.08A3 3 0 0 0 19 9h-4.56L15 7.57A4.13 4.13 0 0 0 11.11 2a1 1 0 0 0-.91.59L7.35 9H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12.73a3 3 0 0 0 2.95-2.46l1.27-7a3 3 0 0 0-.65-2.46Z"
        fill={color}
      />
    ) : (
      <Path
        d="M21.3 10.08A3 3 0 0 0 19 9h-4.56L15 7.57A4.13 4.13 0 0 0 11.11 2a1 1 0 0 0-.91.59L7.35 9H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12.73a3 3 0 0 0 2.95-2.46l1.27-7a3 3 0 0 0-.65-2.46ZM7 20H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h2v9Zm13-7.82-1.27 7a1 1 0 0 1-1 .82H9v-9.79l2.72-6.12a2.11 2.11 0 0 1 1.38 2.78l-.53 1.43a2 2 0 0 0 1.87 2.7H19a1 1 0 0 1 .77.36 1 1 0 0 1 .23.82Z"
        fill={color}
      />
    )}
  </Svg>
);

export default ThumbsUpIcon;
