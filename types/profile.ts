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
  location: string | null;
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
  location: string | null;
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

export interface Education {
  id: string;
  experienceId: string;
  institutionName: string;
  degree: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  proofUrl: string;
  createdAt: string;
}

export interface Project {
  id: string;
  experienceId: string;
  organizationName: string;
  title: string;
  description: string | null;
  type: ArtifactType;
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
    profileImageUrl: string | null;
    publicProfileUrl: string | null;
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
  imageUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

export interface ProfileAnalytics {
  totalConnections: number;
  totalFollowers: number;
  totalFollowing: number;
  totalExperiences: number;
  verifiedExperiences: number;
  totalArtifacts: number;
  certificateCount: number;
  totalPosts: number;
  totalSkills: number;
  totalProjects: number;
  totalReactions: number;
  totalComments: number;
  totalProfileViews: number;
}

export interface CompleteProfile {
  profile: Profile;
  stats: ProfileStats;
  experiences: Experience[];
  certificates: Certificate[];
  education: Education[];
  projects: Project[];
  connections: ConnectionSummary[];
  posts: LightweightPost[];
  featuredPost: LightweightPost | null;
  analytics: ProfileAnalytics;
}

export interface PublicProfile {
  profile: PublicProfileUser;
  stats: ProfileStats;
  experiences: Experience[];
  certificates: Certificate[];
  education: Education[];
  projects: Project[];
  posts: LightweightPost[];
  featuredPost: LightweightPost | null;
  analytics: ProfileAnalytics;
}

export interface ProfileViewer {
  viewer: {
    id: string;
    name: string | null;
    currentRole: string | null;
    location: string | null;
    headline: string | null;
    profileImageUrl: string | null;
    publicProfileUrl: string | null;
    trustScore: number;
  };
  firstViewedAt: string;
  lastViewedAt: string;
  viewCount: number;
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
