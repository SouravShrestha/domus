import React from "react";
import { View } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import basicColors from "@themes/colors";
import { MembershipStatusHistory } from "@/types/api/response/residence";
import CheckCircleIcon from "../icons/CheckCircleIcon";
import { CircleHalfIcon } from "../icons";

interface StatusStepperProps {
  statusHistory: MembershipStatusHistory[];
  currentStatus: string;
}

type StatusStep = {
  key: "pending" | "verified" | "approved" | "rejected";
  label: string;
};

const STATUS_STEPS: StatusStep[] = [
  { key: "pending", label: "Requested" },
  { key: "verified", label: "Verified" },
  { key: "approved", label: "Approved" },
];

const StatusStepper: React.FC<StatusStepperProps> = ({
  statusHistory,
  currentStatus,
}) => {
  console.log("Current Status:", currentStatus);
  console.log("Status History:", statusHistory);
  const { themedColors } = useTheme();

  // Check if the request was rejected
  const isRejected = currentStatus === "rejected";

  // If rejected, show Requested → Verified → Rejected
  const steps: StatusStep[] = isRejected
    ? [
      { key: "pending", label: "Requested" },
      { key: "verified", label: "Verified" },
      { key: "rejected", label: "Rejected" },
    ]
    : STATUS_STEPS;

  // Get the date for a specific status from history
  const getStatusDate = (status: string): string | null => {
    const historyItem = statusHistory.find((h) => h.status === status);
    if (!historyItem) return null;

    const date = new Date(historyItem.statusSetAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Determine if a step is completed
  const isStepCompleted = (stepKey: string): boolean => {
    return statusHistory.some((h) => h.status === stepKey);
  };

  // Determine if step is current
  const isStepCurrent = (stepKey: string): boolean => {
    return currentStatus === stepKey;
  };

  // Get step color
  const getStepColor = (stepKey: string): string => {
    if (stepKey === "rejected") {
      return isStepCompleted(stepKey) ? basicColors.red : themedColors.disabled;
    }
    if (isStepCompleted(stepKey)) {
      return basicColors.brightGreen;
    }
    if (isStepCurrent(stepKey)) {
      return themedColors.accent;
    }
    return themedColors.disabled;
  };

  // Get line color between steps
  const getLineColor = (fromIndex: number): string => {
    const nextStep = steps[fromIndex + 1];
    if (!nextStep) return themedColors.disabled;

    if (isStepCompleted(nextStep.key)) {
      return nextStep.key === "rejected" ? basicColors.red : basicColors.brightGreen;
    }
    return themedColors.disabled;
  };

  return (
    <View className="py-4">
      <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider mb-8">
        STATUS HISTORY
      </ThemedTextSecondary>

      {steps.map((step, index) => {
        const stepCompleted = isStepCompleted(step.key);
        const stepCurrent = isStepCurrent(step.key);
        const stepColor = getStepColor(step.key);
        const statusDate = getStatusDate(step.key);
        const isLastStep = index === steps.length - 1;

        return (
          <View key={step.key} className="flex-row items-start">
            {/* Left side - Timeline */}
            <View className="items-center mr-4">
              {/* Circle indicator */}
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{
                  backgroundColor: themedColors.background,
                  borderWidth: 2,
                  borderColor: stepCompleted || stepCurrent ? stepColor : themedColors.disabled,
                }}
              >
                {stepCompleted ? (
                  <CheckCircleIcon width={20} height={20} color={stepColor} />
                ) : <CircleHalfIcon width={16} height={16} color={stepColor} />}
              </View>

              {/* Vertical line to next step */}
              {!isLastStep && (
                <View
                  className="w-0.5 h-12"
                  style={{
                    backgroundColor: getLineColor(index),
                  }}
                />
              )}
            </View>

            {/* Right side - Content */}
            <View className="flex-1 pb-4 flex-row justify-between items-center">
              <ThemedText
                className="text-base font-uber-move-medium tracking-wide"
                style={{
                  color:
                    stepCompleted || stepCurrent
                      ? themedColors.text
                      : themedColors.disabled,
                }}
              >
                {step.label}
              </ThemedText>

              {statusDate && (
                <ThemedTextSecondary className="text-xs font-lato-regular">
                  {statusDate}
                </ThemedTextSecondary>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default StatusStepper;
