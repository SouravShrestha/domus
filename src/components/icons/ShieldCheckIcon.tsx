import React from "react";
import Svg, { Path } from "react-native-svg";

const ShieldCheckIcon: React.FC<{
    width?: number;
    height?: number;
    color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            d="M20.062 2.624a2.018 2.018 0 0 0-1.854-.17L12 5.198 5.792 2.455a2.02 2.02 0 0 0-2.693 1.212A2.007 2.007 0 0 0 3 4.5V12c0 4.237 3.516 8.062 8.383 9.836a2.017 2.017 0 0 0 1.234 0C17.484 20.062 21 16.237 21 12V4.5a2 2 0 0 0-.938-1.876zM19 12c0 3.224-2.721 6.33-6.5 7.852V5.5l6.5-2.889V12z"
            fill={color}
        />
    </Svg>
);

export default ShieldCheckIcon;
