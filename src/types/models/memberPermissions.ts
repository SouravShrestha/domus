export type MemberPermissions = {
    id: string;
    membership_id: string;
    residence_id: string;
    user_id: string;
    can_invite_visitors: boolean;
    can_approve_delivery: boolean;
    can_exit_society: boolean;
    can_manage_staff: boolean;
    can_book_amenities: boolean;
    can_raise_complaints: boolean;
    created_at: string;
    updated_at: string;
};

export type PermissionKey = 
    | 'can_invite_visitors'
    | 'can_approve_delivery'
    | 'can_exit_society'
    | 'can_manage_staff'
    | 'can_book_amenities'
    | 'can_raise_complaints';

export type MemberRole = 'owner' | 'adult' | 'kid' | 'tenant' | 'staff';

export const DEFAULT_PERMISSIONS: Record<MemberRole, Partial<Record<PermissionKey, boolean>>> = {
    owner: {
        can_invite_visitors: true,
        can_approve_delivery: true,
        can_exit_society: true,
        can_manage_staff: true,
        can_book_amenities: true,
        can_raise_complaints: true,
    },
    adult: {
        can_invite_visitors: true,
        can_approve_delivery: true,
        can_exit_society: true,
        can_manage_staff: false,
        can_book_amenities: true,
        can_raise_complaints: true,
    },
    kid: {
        can_invite_visitors: false,
        can_approve_delivery: false,
        can_exit_society: false,
        can_manage_staff: false,
        can_book_amenities: true,
        can_raise_complaints: false,
    },
    tenant: {
        can_invite_visitors: true,
        can_approve_delivery: true,
        can_exit_society: true,
        can_manage_staff: false,
        can_book_amenities: true,
        can_raise_complaints: true,
    },
    staff: {
        can_invite_visitors: false,
        can_approve_delivery: false,
        can_exit_society: true,
        can_manage_staff: false,
        can_book_amenities: false,
        can_raise_complaints: true,
    },
};

export type PermissionInfo = {
    key: PermissionKey;
    label: string;
    description: string;
    icon: string;
    category: 'visitors' | 'access' | 'society' | 'management';
};

export const PERMISSION_INFO: PermissionInfo[] = [
    {
        key: 'can_invite_visitors',
        label: 'Invite Visitors',
        description: 'Can create and share visitor invitations',
        icon: 'visitor',
        category: 'visitors',
    },
    {
        key: 'can_approve_delivery',
        label: 'Approve Deliveries',
        description: 'Can approve delivery personnel entry',
        icon: 'delivery',
        category: 'visitors',
    },
    {
        key: 'can_exit_society',
        label: 'Exit Society',
        description: 'Can request exit from society gates',
        icon: 'exit',
        category: 'access',
    },
    {
        key: 'can_manage_staff',
        label: 'Manage Staff',
        description: 'Can add and manage domestic staff',
        icon: 'staff',
        category: 'management',
    },
    {
        key: 'can_book_amenities',
        label: 'Book Amenities',
        description: 'Can book society amenities',
        icon: 'amenities',
        category: 'society',
    },
    {
        key: 'can_raise_complaints',
        label: 'Raise Complaints',
        description: 'Can submit complaints to management',
        icon: 'complaint',
        category: 'society',
    },
];
