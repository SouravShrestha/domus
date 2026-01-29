import { Gender } from "@enums/gender";

export type UserProfile = {
	id: string;
	name: string;
	phone: string;
	email?: string | null;
	gender?: Gender | null;
	onboarded_basic?: boolean | false;
	photo_url?: string | null;

	enablePushNotifications?: boolean;
	enableEmailNotifications?: boolean;
	enableSmsNotifications?: boolean;
	firstName?: string | null;
	lastName?: string | null;
};