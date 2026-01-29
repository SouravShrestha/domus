import React from "react";
import Svg, { Path } from "react-native-svg";

const DoorWindowIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="m9 4h2v7h-2c-.552 0-1-.448-1-1v-5c0-.552.448-1 1-1zm6 0h-2v7h2c.552 0 1-.448 1-1v-5c0-.552-.448-1-1-1zm-.5 9c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm9.5 10c0 .553-.447 1-1 1h-22c-.553 0-1-.447-1-1s.447-1 1-1h3v-17c0-2.757 2.243-5 5-5h6c2.757 0 5 2.243 5 5v17h3c.553 0 1 .447 1 1zm-18-1h12v-17c0-1.654-1.346-3-3-3h-6c-1.654 0-3 1.346-3 3z" fill={color} />
  </Svg>
);

export default DoorWindowIcon;
