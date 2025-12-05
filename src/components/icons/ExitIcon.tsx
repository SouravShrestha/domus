import React from "react";
import Svg, { Path } from "react-native-svg";

const ExitIcon: React.FC<{
    width?: number;
    height?: number;
    color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            d="M22.829 9.172l-4.244-4.243a1 1 0 1 0-1.414 1.414L20.506 9.7H11a1 1 0 0 0 0 2h9.586l-3.414 3.415a1 1 0 1 0 1.415 1.414l4.242-4.243a3 3 0 0 0 0-4.243z"
            fill={color}
        />
        <Path
            d="M7 22H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h2a1 1 0 0 0 0-2H5a5.006 5.006 0 0 0-5 5v14a5.006 5.006 0 0 0 5 5h2a1 1 0 0 0 0-2z"
            fill={color}
        />
    </Svg>
);

export default ExitIcon;
