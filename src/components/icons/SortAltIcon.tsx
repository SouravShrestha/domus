import React from "react";
import Svg, { Path } from "react-native-svg";

const SortAltIcon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.707,17.707c.391,.391,.391,1.023,0,1.414l-4.293,4.293c-.39,.39-.902,.585-1.414,.585s-1.024-.195-1.414-.585L-0.707,19.121c-.391-.391-.391-1.023,0-1.414s1.023-.391,1.414,0l3.293,3.293V1c0-.553,.448-1,1-1s1,.447,1,1V21l3.293-3.293c.391-.391,1.023-.391,1.414,0ZM24.707,4.879L20.414,.586c-.779-.779-2.049-.779-2.828,0l-4.293,4.293c-.391,.391-.391,1.023,0,1.414s1.023,.391,1.414,0l3.293-3.293V23c0,.553,.447,1,1,1s1-.447,1-1V3l3.293,3.293c.195,.195,.451,.293,.707,.293s.512-.098,.707-.293c.391-.391,.391-1.023,0-1.414Z"
      fill={color}
    />
  </Svg>
);

export default SortAltIcon;
