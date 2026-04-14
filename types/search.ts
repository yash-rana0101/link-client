export interface GlobalSearchUserResult {
  id: string;
  name: string | null;
  currentRole: string | null;
  location: string | null;
  headline: string | null;
  profileImageUrl: string | null;
  publicProfileUrl: string | null;
  trustScore: number;
}

export interface GlobalSearchJobResult {
  id: string;
  title: string;
  description: string;
  location: string | null;
  createdAt: string;
  postedById: string;
  postedBy: {
    id: string;
    name: string | null;
    publicProfileUrl: string | null;
  };
}

export interface GlobalSearchCompanyResult {
  companyName: string;
  memberCount: number;
}

export interface GlobalSearchResult {
  query: string;
  users: GlobalSearchUserResult[];
  jobs: GlobalSearchJobResult[];
  companies: GlobalSearchCompanyResult[];
}
