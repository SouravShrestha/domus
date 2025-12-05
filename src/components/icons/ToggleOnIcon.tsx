import React from "react";
import Svg, { Path } from "react-native-svg";

const ToggleOnIcon: React.FC<{
    width?: number;
    height?: number;
    color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            d="M16 6H8a6 6 0 0 0 0 12h8a6 6 0 0 0 0-12zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
            fill={color}
        />
    </Svg>
);

export default ToggleOnIcon;
