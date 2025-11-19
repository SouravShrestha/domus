import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import colorMapping from "@themes/colors";
import ExclamationIcon from "@/components/icons/ExclamationIcon";
import InfoIcon from "@/components/icons/InfoIcon";
import CheckCircleIcon from "@/components/icons/CheckCircleIcon";

export const toastConfig = {
  success: ({ text1, text2 }: any) => {
    const { themedColors } = useTheme();
    const color = colorMapping.brightGreen;
    return (
      <View
        style={{
          backgroundColor: themedColors.background,
        }}
        className="rounded-full mx-4"
      >
        <View
          className="rounded-full py-2 px-5 flex-row flex items-center justify-start space-x-3" 
          style={{ backgroundColor: color + "30" }}
        >
          <View>
            <CheckCircleIcon
              width={16}
              height={16}
              color={color}
            />
          </View>
          <View>
            <Text
              style={{
                color: color,
              }}
              className="font-uber-move-medium tracking-wider text-base"
            >
              {text1}
            </Text>
            {text2 ? (
              <Text
                style={{
                  color: colorMapping.white,
                }}
                className="font-lato-regular tracking-wide text-sm"
              >
                {text2}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  },

  error: ({ text1, text2 }: any) => {
    const { themedColors } = useTheme();
    const color = colorMapping.red;
    return (
      <View
        style={{
          backgroundColor: themedColors.background,
        }}
        className="rounded-full mx-4"
      >
        <View
          className="rounded-full py-2 px-5 flex-row flex items-center justify-start space-x-3"
          style={{ backgroundColor: color + "30" }}
        >
          <View>
            <ExclamationIcon
              width={16}
              height={16}
              color={color}
            />
          </View>
          <View>
            <Text
              style={{
                color: color,
              }}
              className="font-uber-move-medium tracking-wider text-base"
            >
              {text1}
            </Text>
            {text2 ? (
              <Text
                style={{
                  color: colorMapping.white,
                }}
                className="font-lato-regular tracking-wide text-sm"
              >
                {text2}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  },

  info: ({ text1, text2 }: any) => {
    const { themedColors } = useTheme();
    const color = colorMapping.paleBlue;
    return (
      <View
        style={{
          backgroundColor: themedColors.background,
        }}
        className="rounded-full mx-4"
      >
        <View
          className="rounded-full py-2 px-5 flex-row flex items-center justify-start space-x-3"
          style={{ backgroundColor: color + "30" }}
        >
          <View>
            <InfoIcon
              width={16}
              height={16}
              color={color}
            />
          </View>
          <View>
            <Text
              style={{
                color: color,
              }}
              className="font-uber-move-medium tracking-wider text-base"
            >
              {text1}
            </Text>
            {text2 ? (
              <Text
                style={{
                  color: colorMapping.white,
                }}
                className="font-lato-regular tracking-wide text-sm"
              >
                {text2}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  },
  
  warning: ({ text1, text2 }: any) => {
    const { themedColors } = useTheme();
    const color = colorMapping.gold;
    return (
      <View
        style={{
          backgroundColor: themedColors.background,
        }}
        className="rounded-full mx-4"
      >
        <View
          className="rounded-full py-2 px-5 flex-row flex items-center justify-start space-x-3"
          style={{ backgroundColor: color + "30" }}
        >
          <View>
            <InfoIcon
              width={16}
              height={16}
              color={color}
            />
          </View>
          <View>
            <Text
              style={{
                color: color,
              }}
              className="font-uber-move-medium tracking-wider text-base"
            >
              {text1}
            </Text>
            {text2 ? (
              <Text
                style={{
                  color: colorMapping.white,
                }}
                className="font-lato-regular tracking-wide text-sm"
              >
                {text2}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  },
};
