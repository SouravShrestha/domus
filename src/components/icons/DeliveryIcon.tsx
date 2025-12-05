import React from "react";
import Svg, { Path } from "react-native-svg";

const DeliveryIcon: React.FC<{
    width?: number;
    height?: number;
    color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21.5 9.5h-2.086l-3.207-3.207A4.973 4.973 0 0 0 12.672 5H8V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8H1.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h2.793a3 3 0 1 0 5.414 0h4.586a3 3 0 1 0 5.414 0H22.5a.5.5 0 0 0 .5-.5v-9.5a.5.5 0 0 0-.5-.5zM5 4h1v1H5V4zm1 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm12 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3-2h-1.354a3 3 0 0 0-4.292 0h-5.708a3 3 0 0 0-4.292 0H3v-6h18v6zm0-8H8V7h4.672a2.981 2.981 0 0 1 2.121.879L17.586 11H21z"
            fill={color}
        />
    </Svg>
);

export default DeliveryIcon;
