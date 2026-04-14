export type ExperienceStatus =
  | "SELF_CLAIMED"
  | "PEER_VERIFIED"
  | "FULLY_VERIFIED"
  | "FLAGGED";

export type ArtifactType =
  | "GITHUB"
  | "PORTFOLIO"
  | "PROJECT"
  | "CERTIFICATE"
  | "OTHER";

export interface Skill {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  currentRole: string | null;
  headline: string | null;
  about: string | null;
  profileImageUrl: string | null;
  profileBannerUrl: string | null;
  publicProfileUrl: string | null;
  skills: Skill[];
  trustScore: number;
  createdAt: string;
}

export interface PublicProfileUser {
  id: string;
  name: string | null;
  currentRole: string | null;
  headline: string | null;
  about: string | null;
  profileImageUrl: string | null;
  profileBannerUrl: string | null;
  publicProfileUrl: string | null;
  skills: Skill[];
  trustScore: number;
  createdAt: string;
}

export interface ExperienceArtifact {
  id: string;
  type: ArtifactType;
  url: string;
  createdAt: string;
}

export interface Experience {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  description: string | null;
  status: ExperienceStatus;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  artifacts: ExperienceArtifact[];
}

export interface Certificate {
  id: string;
  experienceId: string;
  companyName: string;
  role: string;
  url: string;
  createdAt: string;
}

export type RelationshipType =
  | "COWORKER"
  | "TEAMMATE"
  | "INTERVIEWED_WITH"
  | "EVENT"
  | "COLD_OUTREACH";

export interface ConnectionSummary {
  id: string;
  relationship: RelationshipType;
  status: "ACCEPTED";
  createdAt: string;
  otherUser: {
    id: string;
    email: string;
    name: string | null;
    trustScore: number;
  };
}

export interface ProfileStats {
  totalExperiences: number;
  verifiedExperiences: number;
  totalArtifacts: number;
  certificateCount: number;
  totalConnections: number;
  totalPosts: number;
}

export interface LightweightPost {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

export interface CompleteProfile {
  profile: Profile;
  stats: ProfileStats;
  experiences: Experience[];
  certificates: Certificate[];
  connections: ConnectionSummary[];
  posts: LightweightPost[];
}

export interface PublicProfile {
  profile: PublicProfileUser;
  stats: ProfileStats;
  experiences: Experience[];
  certificates: Certificate[];
}

export interface CompletionGuide {
  objective: string;
  philosophy: string;
  tone: string;
  completion: {
    percent: number;
    completedCount: number;
    totalSections: number;
  };
  feedback: string;
}
