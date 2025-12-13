import React, { FC } from "react";
import { Text } from "react-native";
import { ActivityLogWithActor, ActivityType } from "@models/activity";
import colorMapping from "@themes/colors";
import {
  PaperPlaneIcon,
  CheckIcon,
  CancelIcon,
  GroupIcon,
  ProfileIcon,
  ActivityIcon,
  PartyHornIcon,
  TrashXmarkIcon,
  SettingsIcon,
  PrivacyIcon,
  ShieldKeyholeIcon,
  AddVisitorIcon,
  FilledGiftIcon,
  DeclineIcon,
  BadgeApproveIcon,
} from "@/components/icons";

export interface ActivityConfig {
  message: React.ReactNode;
  Icon: FC<{ height?: number; width?: number; color?: string }>;
  color: string;
}

const formatMessageWithItalics = (
  template: string,
  variables: Record<string, string | number>
): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\{(\w+)\}/g;
  let match;
  let hasPlaceholders = false;

  while ((match = regex.exec(template)) !== null) {
    hasPlaceholders = true;
    if (match.index > lastIndex) {
      parts.push(template.substring(lastIndex, match.index));
    }

    const varName = match[1];
    const value = variables[varName]?.toString() || `{${varName}}`;
    parts.push(
      <Text key={match.index} style={{ fontStyle: "italic" }}>
        {value}
      </Text>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    parts.push(template.substring(lastIndex));
  }

  if (!hasPlaceholders) {
    return template;
  }

  return <>{parts}</>;
};

interface UserInfo {
  id?: string;
  name?: string;
}

export const getActivityConfig = async (
  activity: ActivityLogWithActor,
  currentUser?: UserInfo | null
): Promise<ActivityConfig> => {
  const isCurrentUser = currentUser?.id === activity.actor_user_id;
  const actorName = isCurrentUser ? "You" : activity.actor?.name || "Someone";
  const targetName = activity.target_identifier || "someone";
  const metadata = activity.metadata || {};
  const role = metadata.role || "member";

  switch (activity.action_type as ActivityType) {
    case "INVITE_SENT":
      return {
        message: formatMessageWithItalics(
          "{actorName} sent an invitation to {targetName} to join {residenceShortName} in {societyName} as {role}",
          {
            actorName,
            targetName,
            residenceShortName: metadata.residenceShortName || "residence",
            societyName: metadata.societyName || "society",
            role,
          }
        ),
        Icon: PaperPlaneIcon,
        color: colorMapping.navyBlue,
      };

    case "INVITE_ACCEPTED":
      return {
        message: formatMessageWithItalics(
          "{actorName} accepted an invitation to join",
          {
            actorName,
          }
        ),
        Icon: CheckIcon,
        color: colorMapping.brightGreen,
      };

    case "INVITE_REJECTED":
      return {
        message: formatMessageWithItalics(
          "{actorName} declined an invitation",
          {
            actorName,
          }
        ),
        Icon: CancelIcon,
        color: colorMapping.red,
      };

    case "INVITE_DELETED":
      return {
        message: formatMessageWithItalics(
          "{actorName} deleted invite for {targetName} to {residenceShortName} in {societyName} as {role}",
          {
            actorName,
            targetName,
            residenceShortName: metadata.residenceShortName || "residence",
            societyName: metadata.societyName || "society",
            role,
          }
        ),
        Icon: TrashXmarkIcon,
        color: colorMapping.red,
      };

    case "MEMBER_JOINED":
      return {
        message: formatMessageWithItalics(
          "{actorName} joined {residenceShortName} in {societyName} as {role}",
          {
            actorName,
            residenceShortName: metadata.residenceShortName || "NA",
            societyName: metadata.societyName || "NA",
            role,
          }
        ),
        Icon: PartyHornIcon,
        color: colorMapping.teal,
      };

    case "MEMBER_REMOVED":
      return {
        message: isCurrentUser
          ? formatMessageWithItalics(
              "You left {residenceShortName} in {societyName}",
              {
                residenceShortName: metadata.residenceShortName || "NA",
                societyName: metadata.societyName || "NA",
              }
            )
          : formatMessageWithItalics("{actorName} removed {targetName}", {
              actorName,
              targetName,
            }),
        Icon: CancelIcon,
        color: colorMapping.orange,
      };

    case "MEMBER_ROLE_UPDATED": {
      const newRole = metadata.new_status || "member";
      return {
        message: formatMessageWithItalics(
          "{actorName}'s role was updated to {newRole}",
          {
            actorName,
            newRole,
          }
        ),
        Icon: ShieldKeyholeIcon,
        color: colorMapping.gold,
      };
    }

    case "MEMBER_PERMISSIONS_UPDATED": {
      const memberName = metadata.member_name || targetName;
      return {
        message: formatMessageWithItalics(
          "{actorName} updated permissions for {memberName}",
          {
            actorName,
            memberName,
          }
        ),
        Icon: ShieldKeyholeIcon,
        color: colorMapping.gold,
      };
    }

    case "GUEST_INVITED": {
      const validFromDate = metadata.valid_from
        ? new Date(metadata.valid_from).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "today";
      return {
        message: formatMessageWithItalics(
          "{actorName} created an invite for {targetName} to {residenceShortName} for {validFromDate}",
          {
            actorName,
            targetName,
            residenceShortName: metadata.residenceShortName || "your residence",
            validFromDate,
          }
        ),
        Icon: FilledGiftIcon,
        color: colorMapping.pink,
      };
    }

    case "GUEST_INVITATION_CANCELLED":
      return {
        message: formatMessageWithItalics(
          "{actorName} cancelled guest invite for {targetName} to {residenceShortName}",
          {
            actorName,
            targetName,
            residenceShortName: metadata.residenceShortName || "your residence",
          }
        ),
        Icon: TrashXmarkIcon,
        color: colorMapping.red,
      };

    case "GUEST_INVITATION_DELETED":
      return {
        message: formatMessageWithItalics(
          "{actorName} deleted guest invite for {targetName} to {residenceShortName}",
          {
            actorName,
            targetName,
            residenceShortName: metadata.residenceShortName || "your residence",
          }
        ),
        Icon: TrashXmarkIcon,
        color: colorMapping.red,
      };

    case "WALK_IN_VISITOR_ENTRY":
      return {
        message: formatMessageWithItalics(
          "Walk-in visitor {targetName} arrived at the gate",
          { targetName }
        ),
        Icon: AddVisitorIcon,
        color: colorMapping.navyBlue,
      };

    case "WALK_IN_VISITOR_APPROVED":
      return {
        message: formatMessageWithItalics(
          "{actorName} approved entry for walk-in visitor {targetName}",
          { actorName, targetName }
        ),
        Icon: BadgeApproveIcon,
        color: colorMapping.brightGreen,
      };

    case "WALK_IN_VISITOR_REJECTED":
      return {
        message: formatMessageWithItalics(
          "{actorName} denied entry for walk-in visitor {targetName}",
          { actorName, targetName }
        ),
        Icon: DeclineIcon,
        color: colorMapping.red,
      };

    default:
      return {
        message:
          activity.action_type?.replace(/_/g, " ").toLowerCase() ||
          "Unknown activity",
        Icon: ActivityIcon,
        color: colorMapping.gray,
      };
  }
};

export const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};
