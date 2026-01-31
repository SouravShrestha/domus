import React, { useMemo } from "react";
import FilterSortBar, {
  FilterCategory,
} from "@/components/widgets/FilterSortBar";
import { SocietyGate } from "@/types/models/societyGate";
import { SocietyShift } from "@/types";
import { GuardAssignment, GuardProfile } from "@/types/models/guard";

export type GuardFilterState = Record<string, string[]>;

interface GuardFilterBarProps {
  gates: (SocietyGate & { guards: (GuardAssignment & { status: string })[] })[];
  shifts: SocietyShift[];
  unassignedGuards: GuardProfile[];
  selectedFilters: GuardFilterState;
  onFilterChange: (categoryId: string, values: string[]) => void;
  onClearAllFilters: () => void;
  resultCount: number;
}

const STATUS_OPTIONS = [
  { label: "On Duty", value: "active" },
  { label: "Off Duty", value: "inactive" },
  { label: "Unassigned", value: "unassigned" },
];

const GuardFilterBar: React.FC<GuardFilterBarProps> = ({
  gates,
  shifts,
  unassignedGuards,
  selectedFilters,
  onFilterChange,
  onClearAllFilters,
  resultCount,
}) => {
  const filterCategories = useMemo<FilterCategory[]>(() => {
    // Calculate counts
    const gateCounts = gates.reduce(
      (acc, gate) => {
        acc[gate.id] = gate.guards.length;
        return acc;
      },
      {} as Record<string, number>,
    );

    const shiftCounts = shifts.reduce(
      (acc, shift) => {
        const count = gates.reduce(
          (total, gate) =>
            total + gate.guards.filter((g) => g.shift_id === shift.id).length,
          0,
        );
        acc[shift.id] = count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const statusCounts = {
      active: gates.reduce(
        (total, gate) =>
          total + gate.guards.filter((g) => g.status === "active").length,
        0,
      ),
      inactive: gates.reduce(
        (total, gate) =>
          total + gate.guards.filter((g) => g.status === "inactive").length,
        0,
      ),
      unassigned: unassignedGuards.length,
    };

    const gateOptions = gates.map((gate) => ({
      label: gate.name,
      value: gate.id,
      count: gateCounts[gate.id] || 0,
    }));

    const shiftOptions = shifts.map((shift) => ({
      label: shift.name,
      value: shift.id,
      count: shiftCounts[shift.id] || 0,
    }));

    const statusOptions = STATUS_OPTIONS.map((status) => ({
      ...status,
      count: statusCounts[status.value as keyof typeof statusCounts] || 0,
    }));

    return [
      {
        id: "gate",
        label: "Gate",
        options: gateOptions,
      },
      {
        id: "shift",
        label: "Shift",
        options: shiftOptions,
      },
      {
        id: "status",
        label: "Status",
        options: statusOptions,
      },
    ];
  }, [gates, shifts, unassignedGuards]);

  return (
    <FilterSortBar
      filterCategories={filterCategories}
      selectedFilters={selectedFilters}
      onFilterChange={onFilterChange}
      onClearAllFilters={onClearAllFilters}
      showResultCount={false}
      resultCount={resultCount}
      resultLabel="Guard"
    />
  );
};

export default GuardFilterBar;
