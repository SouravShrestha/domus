import { Gender } from "@enums/gender";

export type UserProfile = {
	id: string;
	name: string;
	phone: string;
	email?: string | null;
	gender?: Gender | null;
	onboarded_basic?: boolean | false;
};