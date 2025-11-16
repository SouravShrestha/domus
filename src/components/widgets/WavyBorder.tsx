import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { generateWavePath } from "@/paths/wavePath";

interface WavyBorderProps {
  width: number;
  amplitude?: number;
  frequency?: number;
  fillColor: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const WavyBorder: React.FC<WavyBorderProps> = ({
  width,
  amplitude = 3,
  frequency = 0.1,
  fillColor,
  style,
  containerStyle,
}) => {
  const waveHeight = amplitude * 2;

  return (
    <View
      className="absolute"
      style={[
        {
          bottom: 0,
          left: 0,
          height: waveHeight,
          width: width,
          zIndex: 1,
        },
        containerStyle,
      ]}
    >
      <Svg
        width={width}
        height={waveHeight}
        viewBox={`0 0 ${width} ${waveHeight}`}
        style={style}
      >
        <Path
          d={generateWavePath(width, amplitude, frequency)}
          fill={fillColor}
        />
      </Svg>
    </View>
  );
};

export default WavyBorder;

