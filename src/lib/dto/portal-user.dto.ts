export type PortalInvitationStatus =
  | "None"
  | "Pending"
  | "Sent"
  | "Accepted"
  | "Expired"
  | "Failed"
  | "Revoked"
  | "";

export interface PortalUserDto {
  id: string;
  entryNo?: number;
  externalUserId: string;
  email: string;
  customerNo: string;
  portalEnabled: boolean;
  blocked: boolean;
  lastLoginDateTime: string;
  languageCode: string;
  createdAt: string;
  bcCompanyName: string;
  invitationStatus: PortalInvitationStatus;
  invitationSentAt: string;
  invitationAcceptedAt: string;
  invitationExpiresAt: string;
  lastInvitationError: string;
  lastSyncStatus: string;
  lastSyncError: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreatePortalUserInput {
  externalUserId: string;
  email: string;
  customerNo: string;
  languageCode?: string;
  bcCompanyName?: string;
  invitationStatus?: PortalInvitationStatus;
  invitationSentAt?: string;
  lastInvitationError?: string;
  lastSyncStatus?: string;
  lastSyncError?: string;
}
