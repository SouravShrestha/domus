import React from "react";
import Svg, { Path } from "react-native-svg";

const DoorOpenIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M23,22h-3V6c0-2.206-1.794-4-4-4h-.535c-.238-.411-.55-.782-.929-1.092C13.606,.146,12.396-.157,11.216,.079l-3.197,.639c-2.329,.466-4.019,2.528-4.019,4.903V22H1c-.552,0-1,.447-1,1s.448,1,1,1H23c.552,0,1-.447,1-1s-.448-1-1-1ZM16,4c1.103,0,2,.897,2,2V22h-2V4h0Zm-10,1.621c0-1.426,1.014-2.663,2.411-2.942l3.196-.639c.59-.119,1.195,.033,1.661,.415,.465,.381,.731,.944,.731,1.546V22H6V5.621Zm6,6.879c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5,.672-1.5,1.5-1.5,1.5,.672,1.5,1.5Z" fill={color} />
  </Svg>
);

export default DoorOpenIcon;
