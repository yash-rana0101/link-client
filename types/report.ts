export type ProfileReportReason =
  | "SPAM"
  | "IMPERSONATION"
  | "HARASSMENT"
  | "MISINFORMATION"
  | "INAPPROPRIATE"
  | "OTHER";

export interface CreateProfileReportPayload {
  reportedUserId: string;
  reason: ProfileReportReason;
  details?: string;
}

export interface ProfileReportRecord {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ProfileReportReason;
  details: string | null;
  status: "OPEN" | "REVIEWED" | "DISMISSED";
  createdAt: string;
  updatedAt: string;
}
