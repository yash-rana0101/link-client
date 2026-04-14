import type { ExperienceStatus } from "@/types/profile";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface VerificationItem {
  id: string;
  experienceId: string;
  verifierId: string;
  status: VerificationStatus;
  createdAt: string;
  verifier: {
    id: string;
    name: string | null;
  };
}

export interface VerificationRequestResult {
  experienceId: string;
  requestedCount: number;
  verifications: VerificationItem[];
}

export interface VerificationResponseResult {
  experienceId: string;
  verificationStatus: Extract<VerificationStatus, "APPROVED" | "REJECTED">;
  approvalsRequired: number;
  approvalsReceived: number;
  consensusReached: boolean;
  experienceStatus: ExperienceStatus;
  resolutionSource: "rust" | "fallback";
  trustScore: number | null;
}

export interface VerificationOverview {
  experienceId: string;
  experienceStatus: ExperienceStatus;
  approvalsRequired: number;
  approvalsReceived: number;
  verifications: VerificationItem[];
}

export interface RequestVerificationPayload {
  experienceId: string;
  verifierIds: string[];
}

export interface RespondVerificationPayload {
  experienceId: string;
  status: Extract<VerificationStatus, "APPROVED" | "REJECTED">;
}
