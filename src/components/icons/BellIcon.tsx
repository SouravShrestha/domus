import basicColors from "@/themes/colors";
import React from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

const BellIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
  notificationCount?: number;
}> = ({ width = 24, height = 24, color = "black", notificationCount }) => (
  <View style={{ position: "relative" }}>
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.555,13.662l-1.9-6.836A9.321,9.321,0,0,0,2.576,7.3L1.105,13.915A5,5,0,0,0,5.986,20H7.1a5,5,0,0,0,9.8,0h.838a5,5,0,0,0,4.818-6.338ZM12,22a3,3,0,0,1-2.816-2h5.632A3,3,0,0,1,12,22Zm8.126-5.185A2.977,2.977,0,0,1,17.737,18H5.986a3,3,0,0,1-2.928-3.651l1.47-6.616a7.321,7.321,0,0,1,14.2-.372l1.9,6.836A2.977,2.977,0,0,1,20.126,16.815Z"
        fill={color}
      />
    </Svg>
    {notificationCount !== undefined && notificationCount > 0 && (
      <View
        style={{
          position: "absolute",
          top: notificationCount > 99 ? -16 : notificationCount > 9 ? -8 : -4,
          right: notificationCount > 99 ? -16 : notificationCount > 9 ? -8 : -4,
          backgroundColor: basicColors.red,
          borderRadius: 32,
          width: notificationCount > 99 ? 28 : notificationCount > 9 ? 20 : 14,
          height: notificationCount > 99 ? 28 : notificationCount > 9 ? 20 : 14,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 4,
          paddingVertical: notificationCount > 99 ? 8 : notificationCount > 9 ? 4 : 0,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 10,
            fontWeight: "bold",
          }}
        >
          {notificationCount > 99 ? "99+" : notificationCount}
        </Text>
      </View>
    )}
  </View>
);

export default BellIcon;

