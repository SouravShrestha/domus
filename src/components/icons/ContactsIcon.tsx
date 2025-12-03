import React from "react";
import Svg, { Path } from "react-native-svg";

const ContactsIcon = ({ size = 24, color = "currentColor" }) => (
    <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <Path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
);

export default ContactsIcon;
