import { FC } from "react";
import { router, Router } from "expo-router";
import colorMapping from "@themes/colors";
import {
  BellIcon,
  DeliveryIcon,
  TriangleWarningIcon,
  InfoIcon,
  SecurityGateIcon,
} from "@/components/icons";
import { Notification } from "@models/notification";
import { format, parseISO } from "date-fns";
import { ROUTES } from "@/constants/routes";

type IconComponent = FC<{ width: number; height: number; color: string }>;

export interface NotificationConfig {
  icon: IconComponent;
  color: string;
  title: string;
  body: string;
  time: string;
  routeData?: {
    pathname: string;
    params?: Record<string, string>;
  };
}

export const getNotificationConfig = (
  item: Notification
): NotificationConfig => {
  switch (item.type) {
    case "delivery":
      return {
        icon: DeliveryIcon,
        color: colorMapping.orange,
        title: "Delivery",
        body: item.body || "You have a delivery.",
        time: format(parseISO(item.created_at), "dd MMM yyyy 'at' hh:mm a"),
        routeData: null,
      };
    case "walk_in_request":
      return {
        icon: SecurityGateIcon,
        color: colorMapping.pink,
        title: `${item.data.visitor_name} is waiting at the gate.`,
        body: "Visitor Approval Request",
        time: format(parseISO(item.created_at), "dd MMM yyyy 'at' hh:mm a"),
        routeData: {
          pathname: ROUTES.RESIDENT.SCREENS.APPROVALS.WALK_IN,
          params: { logId: item.data.log_id },
        },
      };
    case "emergency":
      return {
        icon: TriangleWarningIcon,
        color: colorMapping.red,
        title: "Emergency",
        body: item.body || "Emergency alert!",
        time: format(parseISO(item.created_at), "dd MMM yyyy 'at' hh:mm a"),
        routeData: null,
      };
    case "general":
    default:
      return {
        icon: InfoIcon,
        color: colorMapping.gray,
        title: item.title || "Notification",
        body: item.body || "",
        time: format(parseISO(item.created_at), "dd MMM yyyy 'at' hh:mm a"),
        routeData: null,
      };
  }
};

export type NotificationFilter = "All" | "Unread";

export const groupNotifications = (notifications: Notification[]) => {
  return notifications.reduce(
    (groups: Record<string, Notification[]>, notification) => {
      const date = parseISO(notification.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      let groupTitle = format(date, "dd MMM yyyy");

      if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
        groupTitle = "Today";
      } else if (
        format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
      ) {
        groupTitle = "Yesterday";
      } else if (
        format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")
      ) {
        groupTitle = "Tomorrow";
      }

      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(notification);
      return groups;
    },
    {}
  );
};
