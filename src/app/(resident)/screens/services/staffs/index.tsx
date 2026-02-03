import React, { useState, useCallback, useRef, useMemo } from "react";
import {
    StatusBar,
    TouchableOpacity,
    View,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView, ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { useAuth } from "@contexts/authContext";
import { router, useFocusEffect } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { PlusIcon, BroomIcon, EyeIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { StaffWithAssignment, STAFF_CATEGORIES, StaffCategory, StaffAssignmentStatus, SHORT_DAY_NAMES } from "@/types/models/staff";
import { getStaffByResidence } from "@/api/services/staff.service";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import basicColors from "@/themes/colors";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import StaffQRCodeBottomSheet from "@/app/(resident)/screens/services/staffs/StaffQRCodeBottomSheet";
import StaffCard from "@/app/(resident)/screens/services/staffs/StaffCard";
import FilterSortBar, { FilterCategory, SortOption } from "@/components/widgets/FilterSortBar";

const ManageStaffScreen: React.FC = () => {
    const { themedColors, currentTheme } = useTheme();
    const { currentResidence, isOwner, permissions } = useResidence();
    const { profile } = useAuth();
    const insets = useSafeAreaInsets();

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [staffList, setStaffList] = useState<StaffWithAssignment[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<StaffWithAssignment | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [selectedSort, setSelectedSort] = useState<SortOption>({ label: "Name (A-Z)", value: "name_asc", isDefault: true });
    const hasInitiallyLoaded = useRef(false);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const canManageStaff = isOwner || permissions?.can_manage_staff || false;

    const filterCategories: FilterCategory[] = useMemo(() => {
        const categoryCounts = staffList.reduce((acc, staff) => {
            acc[staff.category] = (acc[staff.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const statusCounts = staffList.reduce((acc, staff) => {
            acc[staff.assignment.status] = (acc[staff.assignment.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const genderCounts = staffList.reduce((acc, staff) => {
            acc[staff.gender] = (acc[staff.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const workingDayCounts = staffList.reduce((acc, staff) => {
            const activeDays = staff.schedules
                .filter((s) => s.is_active)
                .map((s) => s.day_of_week);
            activeDays.forEach((day) => {
                acc[day] = (acc[day] || 0) + 1;
            });
            return acc;
        }, {} as Record<number, number>);

        return [
            {
                id: "category",
                label: "Category",
                options: STAFF_CATEGORIES.map((cat) => ({
                    label: cat.label,
                    value: cat.value,
                    count: categoryCounts[cat.value] || 0,
                })),
            },
            {
                id: "status",
                label: "Status",
                options: [
                    { label: "Active", value: "active", count: statusCounts["active"] || 0 },
                    { label: "Inactive", value: "inactive", count: statusCounts["inactive"] || 0 },
                ],
            },
            {
                id: "gender",
                label: "Gender",
                options: [
                    { label: "Male", value: "male", count: genderCounts["male"] || 0 },
                    { label: "Female", value: "female", count: genderCounts["female"] || 0 },
                ],
            },
            {
                id: "workingDays",
                label: "Working Days",
                options: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
                    label: SHORT_DAY_NAMES[day],
                    value: String(day),
                    count: workingDayCounts[day] || 0,
                })),
            },
        ];
    }, [staffList]);

    const sortOptions: SortOption[] = [
        { label: "Name (A-Z)", value: "name_asc", isDefault: true, shortLabel: "A-Z" },
        { label: "Name (Z-A)", value: "name_desc", shortLabel: "Z-A" },
        { label: "Recently Added", value: "recent", shortLabel: "Recent" },
        { label: "Category", value: "category", shortLabel: "Category" },
    ];

    const filteredAndSortedStaff = useMemo(() => {
        let result = [...staffList];

        const categoryFilters = selectedFilters["category"] || [];
        if (categoryFilters.length > 0) {
            result = result.filter((staff) => categoryFilters.includes(staff.category));
        }

        const statusFilters = selectedFilters["status"] || [];
        if (statusFilters.length > 0) {
            result = result.filter((staff) => statusFilters.includes(staff.assignment.status));
        }

        const genderFilters = selectedFilters["gender"] || [];
        if (genderFilters.length > 0) {
            result = result.filter((staff) => genderFilters.includes(staff.gender));
        }

        const workingDayFilters = selectedFilters["workingDays"] || [];
        if (workingDayFilters.length > 0) {
            result = result.filter((staff) => {
                const activeDays = staff.schedules
                    .filter((s) => s.is_active)
                    .map((s) => String(s.day_of_week));
                return workingDayFilters.some((day) => activeDays.includes(day));
            });
        }

        switch (selectedSort.value) {
            case "name_asc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name_desc":
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "recent":
                result.sort((a, b) => new Date(b.assignment.created_at).getTime() - new Date(a.assignment.created_at).getTime());
                break;
            case "category":
                result.sort((a, b) => a.category.localeCompare(b.category));
                break;
        }

        return result;
    }, [staffList, selectedFilters, selectedSort]);

    const { activeStaff, disabledStaff } = useMemo(() => {
        const active = filteredAndSortedStaff.filter((staff) => !staff.is_access_disabled);
        const disabled = filteredAndSortedStaff.filter((staff) => staff.is_access_disabled);
        return { activeStaff: active, disabledStaff: disabled };
    }, [filteredAndSortedStaff]);

    const handleFilterChange = useCallback((categoryId: string, values: string[]) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [categoryId]: values,
        }));
    }, []);

    const handleClearAllFilters = useCallback(() => {
        setSelectedFilters({});
    }, []);

    const handleSortChange = useCallback((value: string) => {
        const option = sortOptions.find((o) => o.value === value);
        if (option) {
            setSelectedSort(option);
        }
    }, []);

    const fetchStaff = useCallback(async (showLoadingOverlay = true) => {
        if (!currentResidence?.id) return;

        if (showLoadingOverlay) {
            setIsLoading(true);
        }

        try {
            const { data, error } = await getStaffByResidence(currentResidence.id);

            if (error) {
                console.error("Error fetching staff:", error);
                return;
            }

            if (data) {
                setStaffList(data);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [currentResidence?.id]);

    useFocusEffect(
        useCallback(() => {
            if (!hasInitiallyLoaded.current) {
                hasInitiallyLoaded.current = true;
                fetchStaff();
            } else {
                fetchStaff(false);
            }
        }, [fetchStaff])
    );

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchStaff(false);
    }, [fetchStaff]);

    const handleStaffPress = useCallback((staff: StaffWithAssignment) => {
        setSelectedStaff(staff);
        bottomSheetRef.current?.expand();
    }, []);

    const handleBottomSheetClose = useCallback(() => {
        setSelectedStaff(null);
    }, []);

    const handleEditPress = useCallback(() => {
        if (!selectedStaff) return;
        bottomSheetRef.current?.close();
        router.push({
            pathname: ROUTES.RESIDENT.SCREENS.STAFFS.EDIT_STAFF as any,
            params: {
                staffId: selectedStaff.id,
                assignmentId: selectedStaff.assignment.id,
            },
        });
    }, [selectedStaff]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    const hasStaff = staffList.length > 0;
    const hasFilteredStaff = filteredAndSortedStaff.length > 0;
    const hasActiveStaff = activeStaff.length > 0;
    const hasDisabledStaff = disabledStaff.length > 0;

    return (
      <ThemedView className="flex-1">
        <StatusBar barStyle="default" animated />

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 16,
            flexGrow: 1,
          }}
          style={{
            marginTop: insets.top + 6,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themedColors.accent}
            />
          }
        >
          <View className="-mx-2">
            <ThemedHeaderWithBack
              onBackPress={() => router.back()}
              title="staffs & workers"
            />
          </View>
          {!canManageStaff && (
            <View
              className="mt-4 px-4 py-3 rounded-md flex items-start justify-between"
              style={{
                backgroundColor: basicColors.gold + "15",
                borderWidth: 1,
                borderColor: basicColors.gold + "30",
              }}
            >
              <View className="items-center justify-center flex-row">
                <EyeIcon width={14} height={14} color={basicColors.gold} />
                <ThemedText
                  className="text-sm font-uber-move-medium ml-2 tracking-wide"
                  style={{ color: basicColors.gold }}
                >
                  View only mode
                </ThemedText>
              </View>
              <View className="flex-1 mt-0.5">
                <ThemedTextSecondary className="text-xs font-lato-regular mt-0.5 tracking-wide">
                  Only residents with staff management permission can add or
                  edit staff
                </ThemedTextSecondary>
              </View>
            </View>
          )}

          {hasStaff && (
            <View className="mt-5 -mx-5">
              <FilterSortBar
                filterCategories={filterCategories}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearAllFilters={handleClearAllFilters}
                sortOptions={sortOptions}
                selectedSort={selectedSort}
                onSortChange={handleSortChange}
                showResultCount={Object.values(selectedFilters).some(
                  (v) => v.length > 0,
                )}
                resultCount={filteredAndSortedStaff.length}
                resultLabel="Staff"
              />
            </View>
          )}
          <View className="h-5"></View>

          {hasActiveStaff && (
            <View className="mt-6 flex-row flex-wrap justify-between mx-1">
              {activeStaff.map((staff) => (
                <StaffCard
                  key={staff.id}
                  staff={staff}
                  onPress={() => handleStaffPress(staff)}
                />
              ))}
            </View>
          )}

          {hasDisabledStaff && (
            <View className="mt-6 mx-1">
              <View className="flex-row items-center mb-4">
                <ThemedTextSecondary className="mx-4 text-xs font-uber-move-medium tracking-widest uppercase">
                  Disabled
                </ThemedTextSecondary>
              </View>
              <View className="flex-row flex-wrap justify-between">
                {disabledStaff.map((staff) => (
                  <StaffCard
                    key={staff.id}
                    staff={staff}
                    onPress={() => handleStaffPress(staff)}
                  />
                ))}
              </View>
            </View>
          )}

          {hasStaff && !hasFilteredStaff && (
            <View className="flex-1 items-center justify-center mt-20">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: themedColors.cardBackground }}
              >
                <BroomIcon width={32} height={32} color={themedColors.accent} />
              </View>
              <ThemedText className="text-lg font-uber-move-medium tracking-wide text-center">
                No staff match filters
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-2 text-center px-8">
                Try adjusting your filters to see more staff members.
              </ThemedTextSecondary>
            </View>
          )}

          {!hasStaff && !isLoading && (
            <View className="flex-1 items-center justify-center mt-20">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: themedColors.cardBackground }}
              >
                <BroomIcon width={32} height={32} color={themedColors.accent} />
              </View>
              <ThemedText className="text-lg font-uber-move-medium tracking-wide text-center">
                No staff members yet
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-2 text-center px-8">
                {canManageStaff
                  ? "Tap the + button below to add your household staff like maids, cooks, drivers, etc."
                  : "Only residents with staff management permission can add staff."}
              </ThemedTextSecondary>
            </View>
          )}
        </ScrollView>

        {canManageStaff && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: ROUTES.SCREENS.PEOPLE.ADD_MEMBER,
                params: { type: "staff" },
              })
            }
            className="absolute w-14 h-14 rounded-full items-center justify-center shadow-lg right-6"
            style={{
              backgroundColor: themedColors.accent,
              bottom: insets.bottom + 24,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <PlusIcon
              width={20}
              height={20}
              color={themedColors.textOnAccent}
            />
          </TouchableOpacity>
        )}

        {isLoading && !isRefreshing && (
          <LoadingOverlay currentTheme={currentTheme} withToast={false} />
        )}

        <Portal hostName="global">
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            enablePanDownToClose
            enableDynamicSizing
            backgroundStyle={{
              backgroundColor: themedColors.modal,
            }}
            handleIndicatorStyle={{
              backgroundColor: themedColors.accent,
            }}
            containerStyle={{
              zIndex: 9999,
              elevation: 9999,
            }}
            backdropComponent={renderBackdrop}
            onChange={(index) => {
              if (index === -1) handleBottomSheetClose();
            }}
          >
            <BottomSheetView
              className="flex-1"
              style={{ backgroundColor: themedColors.modal }}
            >
              <StaffQRCodeBottomSheet
                staff={selectedStaff}
                onEditPress={handleEditPress}
                canManageStaff={canManageStaff}
              />
            </BottomSheetView>
          </BottomSheet>
        </Portal>
      </ThemedView>
    );
};

export default ManageStaffScreen;
