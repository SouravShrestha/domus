// Repositories
import { accessInfoRepository } from '@/api/repositories/accessInfo/accessInfo.repository';
import { activityRepository } from '@/api/repositories/activity/activity.repository';
import { approvedMembershipRepository } from '@/api/repositories/membership/approvedMembership.repository';
import { avatarRepository } from '@/api/repositories/avatar/avatar.repository';
import { cabInviteRepository } from '@/api/repositories/cab/cabInvite.repository';
import { complaintRepository } from '@/api/repositories/complaint/complaint.repository';
import { deliveryInviteRepository } from '@/api/repositories/delivery/deliveryInvite.repository';
import { gateRepository } from '@/api/repositories/gate/gate.repository';
import { guardRepository } from '@/api/repositories/guard/guard.repository';
import { guestInvitationRepository } from '@/api/repositories/visitor/visitorInvitation.repository';
import { guestLogRepository } from '@/api/repositories/visitor/visitorLog.repository';
import { invitationRepository } from '@/api/repositories/invitation/invitation.repository';
import { maintenanceRepository } from '@/api/repositories/maintenance/maintenance.repository';
import { managerDashboardRepository } from '@/api/repositories/managerDashboard/managerDashboard.repository';
import { managerRepository } from '@/api/repositories/manager/manager.repository';
import { memberPermissionsRepository } from '@/api/repositories/permissions/memberPermissions.repository';
import { membershipStatusHistoryRepository } from '@/api/repositories/membership/membershipStatusHistory.repository';
import { noticeRepository } from '@/api/repositories/notice/notice.repository';
import { notificationPreferencesRepository } from '@/api/repositories/notification/notificationPreferences.repository';
import { notificationRepository } from '@/api/repositories/notification/notification.repository';
import { pendingMembershipRepository } from '@/api/repositories/membership/pendingMembership.repository';
import { profileRepository } from '@/api/repositories/profile/profile.repository';
import { rejectedInvitationRepository } from '@/api/repositories/invitation/rejectedInvitation.repository';
import { residenceRepository } from '@/api/repositories/residence/residence.repository';
import { roleDetectionRepository } from '@/api/repositories/roleDetection/roleDetection.repository';
import { staffRepository } from '@/api/repositories/staff/staff.repository';

// Services
import { AccessInfoService } from './accessInfo.service';
import { ActivityService } from './activity.service';
import { AvatarService } from './avatar.service';
import { CabService } from './cab.service';
import { ComplaintService } from './complaint.service';
import { DeliveryService } from './delivery.service';
import { GateService } from './gate.service';
import { GuardService } from './guard.service';
import { GuestService } from './visitor.service';
import { InvitationService } from './invitation.service';
import { MaintenanceService } from './maintenance.service';
import { ManagerDashboardService } from './managerDashboard.service';
import { ManagerService } from './manager.service';
import { MemberPermissionsService } from './memberPermissions.service';
import { NoticeService } from './notice.service';
import { NotificationPreferencesService } from './notificationPreferences.service';
import { NotificationService } from './notification.service';
import { ProfileService } from './profile.service';
import { ResidenceService } from './residence.service';
import { RoleDetectionService } from './roleDetection.service';
import { StaffService } from './staff.service';
import { UserService } from './user.service';

export const services = {
  accessInfo: new AccessInfoService(accessInfoRepository),
  activity: new ActivityService(activityRepository),
  avatar: new AvatarService(avatarRepository),
  cab: new CabService(cabInviteRepository),
  complaint: new ComplaintService(complaintRepository),
  delivery: new DeliveryService(deliveryInviteRepository),
  gate: new GateService(gateRepository),
  guard: new GuardService(guardRepository),
  guest: new GuestService(guestInvitationRepository, guestLogRepository),
  invitation: new InvitationService(
    invitationRepository,
    rejectedInvitationRepository,
    approvedMembershipRepository,
    pendingMembershipRepository,
    membershipStatusHistoryRepository
  ),
  maintenance: new MaintenanceService(maintenanceRepository),
  manager: new ManagerService(managerRepository),
  managerDashboard: new ManagerDashboardService(managerDashboardRepository),
  memberPermissions: new MemberPermissionsService(memberPermissionsRepository, approvedMembershipRepository),
  notice: new NoticeService(noticeRepository),
  notification: new NotificationService(notificationRepository),
  notificationPreferences: new NotificationPreferencesService(notificationPreferencesRepository),
  profile: new ProfileService(profileRepository),
  residence: new ResidenceService(residenceRepository, pendingMembershipRepository),
  roleDetection: new RoleDetectionService(roleDetectionRepository),
  staff: new StaffService(staffRepository),
  user: new UserService(approvedMembershipRepository, pendingMembershipRepository, profileRepository),
} as const;

export type ServiceRegistry = typeof services;
