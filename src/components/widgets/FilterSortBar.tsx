import React, { useCallback, useRef, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import {
  BarsSortIcon,
  ChevronDownIcon,
  CrossCircleIcon,
  SortAltIcon,
  TickIcon,
} from "@components/icons";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface SortOption {
  label: string;
  value: string;
  isDefault?: boolean;
  shortLabel?: string;
}

export interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
  icon?: React.FC<{ width?: number; height?: number; color?: string }>;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface QuickFilter {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
}

interface FilterSortBarProps {
  sortOptions?: SortOption[];
  selectedSort?: SortOption;
  onSortChange?: (value: string) => void;
  filterCategories?: FilterCategory[];
  selectedFilters?: Record<string, string[]>;
  onFilterChange?: (categoryId: string, values: string[]) => void;
  onClearAllFilters?: () => void;
  quickFilters?: QuickFilter[];
  selectedQuickFilter?: string;
  onQuickFilterChange?: (value: string) => void;
  portalHostName?: string;
  showResultCount?: boolean;
  resultCount?: number;
  resultLabel?: string;
}

const FilterSortBar: React.FC<FilterSortBarProps> = ({
  sortOptions = [],
  selectedSort,
  onSortChange,
  filterCategories = [],
  selectedFilters = {},
  onFilterChange,
  onClearAllFilters,
  quickFilters = [],
  selectedQuickFilter,
  onQuickFilterChange,
  portalHostName = "global",
  showResultCount = false,
  resultCount = 0,
  resultLabel = "Results",
}) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const sortSheetRef = useRef<BottomSheet>(null);
  const filterSheetRef = useRef<BottomSheet>(null);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>(
    filterCategories[0]?.id || ""
  );
  const [localFilters, setLocalFilters] =
    useState<Record<string, string[]>>(selectedFilters);

  const totalSelectedFilters = Object.values(selectedFilters).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  const hasLocalFilterChanges = React.useMemo(() => {
    const localKeys = Object.keys(localFilters);
    const selectedKeys = Object.keys(selectedFilters);
    const allKeys = new Set([...localKeys, ...selectedKeys]);

    for (const key of allKeys) {
      const localVals = localFilters[key] || [];
      const selectedVals = selectedFilters[key] || [];
      if (localVals.length !== selectedVals.length) return true;
      if (!localVals.every((v) => selectedVals.includes(v))) return true;
    }
    return false;
  }, [localFilters, selectedFilters]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    []
  );

  const handleSortSelect = useCallback(
    (value: string) => {
      onSortChange?.(value);
      sortSheetRef.current?.close();
    },
    [onSortChange]
  );

  const handleFilterToggle = useCallback(
    (categoryId: string, value: string) => {
      setLocalFilters((prev) => {
        const current = prev[categoryId] || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [categoryId]: updated };
      });
    },
    []
  );

  const handleOpenFilterSheet = useCallback(() => {
    setLocalFilters(selectedFilters);
    filterSheetRef.current?.expand();
  }, [selectedFilters]);

  const handleApplyFilters = useCallback(() => {
    Object.entries(localFilters).forEach(([categoryId, values]) => {
      onFilterChange?.(categoryId, values);
    });
    filterSheetRef.current?.close();
  }, [localFilters, onFilterChange]);

  const handleClearLocalFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  const renderQuickFilterChip = (filter: QuickFilter) => {
    const isActive = selectedQuickFilter === filter.value;
    const iconColor = isActive
      ? themedColors.textOnAccent
      : filter.color || themedColors.text;
    return (
      <TouchableOpacity
        key={filter.value}
        onPress={() => onQuickFilterChange?.(filter.value)}
        className="px-4 py-[6px] rounded-md flex-row items-center"
        style={{
          backgroundColor: isActive
            ? themedColors.accent
            : themedColors.cardBackground,
          borderWidth: 1,
          borderColor: isActive
            ? themedColors.accent
            : themedColors.lightBorder,
          gap: 6,
        }}
      >
        {filter.icon &&
          React.cloneElement(
            filter.icon as React.ReactElement<{ color?: string }>,
            {
              color: iconColor,
            }
          )}
        <ThemedText
          className="text-sm font-uber-move-medium"
          style={{
            color: isActive ? themedColors.textOnAccent : themedColors.text,
          }}
        >
          {filter.label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = () => {
    const hasFilters = totalSelectedFilters > 0;
    return (
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleOpenFilterSheet}
          className="flex-row items-center pl-4 py-[6px]"
          style={{
            backgroundColor: hasFilters
              ? themedColors.accent
              : themedColors.cardBackground,
            borderWidth: 1,
            borderRightWidth: hasFilters ? 0 : 1,
            borderColor: hasFilters
              ? themedColors.accent
              : themedColors.lightBorder,
            borderTopRightRadius: hasFilters ? 0 : 20,
            borderBottomRightRadius: hasFilters ? 0 : 20,
            borderTopLeftRadius: hasFilters ? 20 : 20,
            borderBottomLeftRadius: hasFilters ? 20 : 20,
            paddingRight: hasFilters ? 10 : 12,
          }}
        >
          <BarsSortIcon
            width={12}
            height={12}
            color={hasFilters ? themedColors.textOnAccent : themedColors.text}
          />
          <ThemedText
            className="text-sm font-uber-move-medium ml-2"
            style={{
              color: hasFilters ? themedColors.textOnAccent : themedColors.text,
            }}
          >
            Filters{hasFilters ? ` (${totalSelectedFilters})` : ""}
          </ThemedText>
          <View className="ml-1.5">
            <ChevronDownIcon
              width={16}
              height={16}
              color={hasFilters ? themedColors.textOnAccent : themedColors.text}
            />
          </View>
        </TouchableOpacity>
        {hasFilters && (
          <TouchableOpacity
            onPress={onClearAllFilters}
            className="py-[6px] pr-4 pl-3 rounded-r-full"
            style={{
              backgroundColor: themedColors.accent,
              borderWidth: 1,
              borderLeftWidth: 1,
              borderColor: "transparent",
              borderLeftColor: themedColors.lightBorder,
            }}
          >
            <ThemedText
              className="text-sm font-uber-move-medium"
              style={{ color: themedColors.textOnAccent }}
            >
              Clear
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSortButton = () => (
    <TouchableOpacity
      onPress={() => sortSheetRef.current?.expand()}
      className="flex-row items-center pl-4 pr-3 py-[6px] rounded-full"
      style={{
        backgroundColor: selectedSort?.isDefault
          ? themedColors.cardBackground
          : themedColors.accent,
        borderWidth: 1,
        borderColor: selectedSort?.isDefault
          ? themedColors.lightBorder
          : themedColors.accent,
      }}
    >
      <SortAltIcon
        width={12}
        height={12}
        color={
          selectedSort?.isDefault
            ? themedColors.text
            : themedColors.textOnAccent
        }
      />
      <ThemedText
        className="text-sm font-uber-move-medium mr-1.5 ml-2"
        style={{
          color: selectedSort?.isDefault
            ? themedColors.text
            : themedColors.textOnAccent,
        }}
      >
        {sortOptions.find((o) => o.value === selectedSort?.value)?.shortLabel ||
          "Sort"}
      </ThemedText>
      <ChevronDownIcon
        width={16}
        height={16}
        color={
          selectedSort?.isDefault
            ? themedColors.text
            : themedColors.textOnAccent
        }
      />
    </TouchableOpacity>
  );

  const renderCategoryFilterButton = (category: FilterCategory) => {
    const selectedCount = selectedFilters[category.id]?.length || 0;
    const hasSelection = selectedCount > 0;

    return (
      <TouchableOpacity
        key={category.id}
        onPress={() => {
          setActiveFilterCategory(category.id);
          handleOpenFilterSheet();
        }}
        className="flex-row items-center pl-4 pr-2  py-[6px] rounded-full"
        style={{
          backgroundColor: hasSelection
            ? themedColors.accent
            : themedColors.cardBackground,
          borderWidth: 1,
          borderColor: hasSelection
            ? themedColors.accent
            : themedColors.lightBorder,
        }}
      >
        {category.icon && (
          <View className="mr-2">
            <category.icon
              height={12}
              width={12}
              color={
                hasSelection ? themedColors.textOnAccent : themedColors.text
              }
            />
          </View>
        )}
        <ThemedText
          className="text-sm font-uber-move-medium mr-1.5"
          style={{
            color: hasSelection ? themedColors.textOnAccent : themedColors.text,
          }}
        >
          {category.label}
          {hasSelection ? ` (${selectedCount})` : ""}
        </ThemedText>
        <ChevronDownIcon
          width={16}
          height={16}
          color={hasSelection ? themedColors.textOnAccent : themedColors.text}
        />
      </TouchableOpacity>
    );
  };

  const renderSortSheet = () => (
    <Portal hostName={portalHostName}>
      <BottomSheet
        ref={sortSheetRef}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing
        backgroundStyle={{ backgroundColor: themedColors.modal }}
        handleIndicatorStyle={{ backgroundColor: themedColors.accent }}
        containerStyle={{ zIndex: 9999, elevation: 9999 }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView
          style={{
            backgroundColor: themedColors.modal,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <View className="px-8 pt-4 pb-2">
            <ThemedText className="text-xl font-uber-move-medium tracking-wide">
              Sort by
            </ThemedText>
          </View>
          <View className="px-8 mt-2">
            {sortOptions.map((option) => {
              const isSelected =
                selectedSort?.value === option.value ||
                (!selectedSort && option.isDefault);
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSortSelect(option.value)}
                  className="flex-row items-center py-2.5"
                >
                  <View
                    className="w-5 h-5 rounded-full border-2 items-center justify-center mr-4"
                    style={{
                      borderColor: isSelected
                        ? themedColors.accent
                        : themedColors.lightBorder,
                      backgroundColor: isSelected
                        ? themedColors.accent
                        : "transparent",
                    }}
                  >
                    {isSelected && (
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: themedColors.textOnAccent }}
                      />
                    )}
                  </View>
                  <ThemedText
                    className="text-base font-lato-regular tracking-wide"
                    style={{
                      color: isSelected
                        ? themedColors.text
                        : themedColors.secondaryText,
                    }}
                  >
                    {option.label}
                    {option.isDefault ? " (default)" : ""}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );

  const renderFilterSheet = () => (
    <Portal hostName={portalHostName}>
      <BottomSheet
        ref={filterSheetRef}
        index={-1}
        enablePanDownToClose
        snapPoints={["70%"]}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: themedColors.modal }}
        handleIndicatorStyle={{ backgroundColor: themedColors.accent }}
        containerStyle={{ zIndex: 9999, elevation: 9999 }}
        backdropComponent={renderBackdrop}
      >
        <View
          className="flex-1 px-2"
          style={{
            backgroundColor: themedColors.modal,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <View className="px-5 pt-6">
            <ThemedText className="text-xl font-uber-move-medium tracking-wide">
              Filter results
            </ThemedText>
          </View>
          <View style={{ minHeight: 16 }}>
            {Object.values(localFilters).reduce(
              (acc, arr) => acc + arr.length,
              0
            ) > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  gap: 8,
                  paddingVertical: 12,
                  height: 56,
                }}
              >
                {filterCategories.flatMap((category) =>
                  (localFilters[category.id] || []).map((value) => {
                    const option = category.options.find(
                      (opt) => opt.value === value
                    );
                    return (
                      <TouchableOpacity
                        key={`${category.id}-${value}`}
                        onPress={() => handleFilterToggle(category.id, value)}
                        className="flex-row items-center pl-3 pr-2.5 rounded-full"
                        style={{
                          backgroundColor: themedColors.cardBackground,
                          borderWidth: 1,
                          borderColor: themedColors.lightBorder,
                          gap: 8,
                        }}
                      >
                        <ThemedText className="text-sm font-uber-move-medium">
                          {option?.label || value}
                        </ThemedText>
                        <CrossCircleIcon
                          width={16}
                          height={16}
                          color={themedColors.secondaryText}
                        />
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>
          <View
            className="flex-1 flex-row mx-3 border rounded-md mt-1"
            style={{ borderColor: themedColors.lightBorder }}
          >
            <View
              className="w-1/3 border-r"
              style={{ borderColor: themedColors.lightBorder }}
            >
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                {filterCategories.map((category, index) => {
                  const isActive = activeFilterCategory === category.id;
                  const selectedCount = localFilters[category.id]?.length || 0;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setActiveFilterCategory(category.id)}
                      className="px-4 py-3.5"
                      style={{
                        backgroundColor: isActive
                          ? themedColors.accent + "20"
                          : "transparent",
                        borderRightWidth: isActive ? 3 : 0,
                        borderRightColor: themedColors.accent,
                        borderTopLeftRadius: index === 0 ? 6 : 0,
                      }}
                    >
                      <ThemedText
                        className="text-sm font-uber-move-medium tracking-wide"
                        style={{
                          color: isActive
                            ? themedColors.text
                            : themedColors.secondaryText,
                        }}
                      >
                        {category.label}
                        {selectedCount > 0 ? ` (${selectedCount})` : ""}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </BottomSheetScrollView>
            </View>
            <View className="flex-1">
              <BottomSheetScrollView
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 16,
                  flexGrow: 1,
                }}
                showsVerticalScrollIndicator={false}
              >
                {filterCategories
                  .find((c) => c.id === activeFilterCategory)
                  ?.options.map((option) => {
                    const isSelected =
                      localFilters[activeFilterCategory]?.includes(
                        option.value
                      ) || false;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() =>
                          handleFilterToggle(activeFilterCategory, option.value)
                        }
                        className="flex-row items-center justify-between py-3.5"
                      >
                        <ThemedText
                          className="text-sm font-uber-move-medium tracking-wide flex-1"
                          style={{
                            color: isSelected
                              ? themedColors.text
                              : themedColors.secondaryText,
                          }}
                        >
                          {option.label}
                          {option.count !== undefined ? (
                            <ThemedTextSecondary className="text-sm">
                              {" "}
                              ({option.count})
                            </ThemedTextSecondary>
                          ) : (
                            <ThemedTextSecondary className="text-sm">
                              {" "}
                              (0)
                            </ThemedTextSecondary>
                          )}
                        </ThemedText>
                        <View
                          className="w-5 h-5 rounded border-2 items-center justify-center"
                          style={{
                            borderColor: isSelected
                              ? themedColors.accent
                              : themedColors.lightBorder,
                            backgroundColor: isSelected
                              ? themedColors.accent
                              : "transparent",
                          }}
                        >
                          {isSelected && (
                            <TickIcon
                              width={14}
                              height={14}
                              color={themedColors.textOnAccent}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </BottomSheetScrollView>
            </View>
          </View>
          <View
            className="flex-row px-3 pt-6"
            style={{
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={handleClearLocalFilters}
              disabled={
                Object.values(localFilters).reduce(
                  (acc, arr) => acc + arr.length,
                  0
                ) === 0
              }
              className="flex-1 py-4 rounded-md items-center justify-center border"
              style={{
                backgroundColor: themedColors.cardBackground,
                borderColor:
                  Object.values(localFilters).reduce(
                    (acc, arr) => acc + arr.length,
                    0
                  ) > 0
                    ? themedColors.accent
                    : "transparent",
              }}
            >
              <ThemedText
                className="text-base font-uber-move-medium"
                style={{
                  color:
                    Object.values(localFilters).reduce(
                      (acc, arr) => acc + arr.length,
                      0
                    ) > 0
                      ? themedColors.accent
                      : themedColors.secondaryText,
                }}
              >
                Clear Filters
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApplyFilters}
              disabled={!hasLocalFilterChanges}
              className="flex-1 py-4 rounded-md items-center justify-center"
              style={{
                backgroundColor: hasLocalFilterChanges
                  ? themedColors.accent
                  : themedColors.cardBackground,
              }}
            >
              <ThemedText
                className="text-base font-uber-move-medium"
                style={{
                  color: hasLocalFilterChanges
                    ? themedColors.textOnAccent
                    : themedColors.secondaryText,
                }}
              >
                Apply
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </Portal>
  );

  return (
    <>
      <View className="">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 24 }}
        >
          {filterCategories.length > 0 && renderFilterButton()}
          {sortOptions.length > 0 && renderSortButton()}
          {filterCategories.map((category) =>
            renderCategoryFilterButton(category)
          )}
          {quickFilters.length > 0 && (
            <>
              <View
                className="w-px h-6 self-center"
                style={{ backgroundColor: themedColors.lightBorder }}
              />
              {quickFilters.map((filter) => renderQuickFilterChip(filter))}
            </>
          )}
        </ScrollView>
        {showResultCount && resultCount > 0 && (
          <View className="mt-10 mx-7">
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
              {resultCount}{" "}
              {resultCount === 1 ? resultLabel : `${resultLabel}s`} Found
            </ThemedTextSecondary>
          </View>
        )}
      </View>
      {sortOptions.length > 0 && renderSortSheet()}
      {filterCategories.length > 0 && renderFilterSheet()}
    </>
  );
};

export default FilterSortBar;
