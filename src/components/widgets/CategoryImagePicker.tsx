import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { View, TouchableOpacity, FlatList } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { SocietyContactType } from "@/types";
import { getCategoryImages, CategoryImage } from "@/utils/categoryImages";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CategoryImagePickerProps {
  contactType: SocietyContactType;
  onSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
}

export interface CategoryImagePickerRef {
  open: () => void;
  close: () => void;
}

const CategoryImagePicker = forwardRef<CategoryImagePickerRef, CategoryImagePickerProps>(
  ({ contactType, onSelect, currentImageUrl }, ref) => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [images, setImages] = useState<CategoryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(
      currentImageUrl || null,
    );

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    useEffect(() => {
      const fetchImages = async () => {
        try {
          setLoading(true);
          const categoryImages = await getCategoryImages(contactType);
          setImages(categoryImages);
        } catch (error) {
          console.error("Failed to fetch category images:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchImages();
    }, [contactType]);

    useEffect(() => {
      setSelectedImage(currentImageUrl || null);
    }, [currentImageUrl]);

    const handleSelect = (imageUrl: string) => {
      setSelectedImage(imageUrl);
      onSelect(imageUrl);
      bottomSheetRef.current?.close();
    };

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    );

    const renderImageItem = ({ item }: { item: CategoryImage }) => {
      const isSelected = selectedImage === item.url;
      return (
        <TouchableOpacity
          onPress={() => handleSelect(item.url)}
          className="items-center justify-center"
          style={{
            width: "30%",
            aspectRatio: 1,
            margin: "1.5%",
            borderRadius: 8,
            borderWidth: isSelected ? 3 : 1,
            borderColor: isSelected ? themedColors.accent : themedColors.lightBorder,
            overflow: "hidden",
            backgroundColor: themedColors.cardBackground,
          }}
        >
          <Image
            source={{ uri: item.url }}
            style={{
              width: "70%",
              height: "70%",
            }}
            contentFit="cover"
            transition={300}
          />
        </TouchableOpacity>
      );
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: themedColors.modal,
        }}
        handleIndicatorStyle={{
          backgroundColor: themedColors.accent,
        }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView
          className="flex-1"
          style={{ backgroundColor: themedColors.modal }}
        >
          <View className="px-5" style={{ paddingBottom: insets.bottom + 24 }}>
            <View className="flex-row justify-start items-center mb-5 mt-4 px-2">
              <ThemedText className="text-xl font-uber-move-medium tracking-wide">
                Select an image
              </ThemedText>
            </View>

            {loading ? (
              <View className="items-center justify-center py-10">
                <ThemedText className="text-base">Loading images...</ThemedText>
              </View>
            ) : images.length === 0 ? (
              <View className="items-center justify-center py-10">
                <ThemedText className="text-base">
                  No images available for this category
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={{
                  paddingBottom: 32,
                }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

CategoryImagePicker.displayName = "CategoryImagePicker";

export default CategoryImagePicker;
