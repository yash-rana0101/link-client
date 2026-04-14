export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "REJECTED"
  | "HIRED";

export interface JobPoster {
  id: string;
  name: string | null;
  email: string;
  trustScore: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  createdAt: string;
  postedById: string;
  postedBy: JobPoster;
  applicationCount: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  createdAt: string;
  user: JobPoster;
  job: {
    id: string;
    title: string;
    postedById: string;
  };
}
