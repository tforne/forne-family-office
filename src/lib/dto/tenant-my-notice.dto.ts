export interface TenantMyNoticeDto {
  noticeId: string;
  lineNo: number | null;
  customerNo: string | null;
  contactNo: string | null;
  contractNo: string | null;
  assetNo: string | null;
  tenantName: string | null;
  email: string | null;
  portalVisible: boolean | null;
  readInPortal: boolean | null;
  readDateTime: string | null;
  noticeNo: string | null;
  title: string | null;
  description: string | null;
  noticeType: string | null;
  priority: string | null;
  status: string | null;
  showInPortal: boolean | null;
  publishFrom: string | null;
  publishUntil: string | null;
  requiresReadConfirmation: boolean | null;
  headerAssetNo: string | null;
  headerContractNo: string | null;
  incidentId: string | null;
  isActive: boolean | null;
  isUnread: boolean | null;
}
