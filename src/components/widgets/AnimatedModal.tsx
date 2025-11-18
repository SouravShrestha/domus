import React, { useEffect } from "react";
import { Modal, TouchableOpacity, View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  enableBackdrop?: boolean;
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  children,
  enableBackdrop = true,
}) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(1000);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(1000, {
        damping: 20,
        stiffness: 90,
      });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {enableBackdrop && (
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={onClose}
            />
          </Animated.View>
        )}
        <Animated.View
          style={[
            styles.content,
            contentStyle,
            {
              backgroundColor: themedColors.modal,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    width: "100%",
  },
});

export default AnimatedModal;

