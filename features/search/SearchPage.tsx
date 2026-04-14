"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/common/State";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime } from "@/lib/date";
import { useGlobalSearch } from "@/features/search/useSearch";

const toSearchHref = (query: string) => {
  const normalized = query.trim();

  if (!normalized) {
    return "/search";
  }

  return `/search?q=${encodeURIComponent(normalized)}`;
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const committedQuery = searchParams.get("q")?.trim() ?? "";
  const [draftQuery, setDraftQuery] = useState(committedQuery);

  useEffect(() => {
    setDraftQuery(committedQuery);
  }, [committedQuery]);

  const searchQuery = useGlobalSearch(committedQuery, 24, true);

  const heading = useMemo(() => {
    if (!committedQuery) {
      return "Discover people, jobs, and companies";
    }

    return `Search results for \"${committedQuery}\"`;
  }, [committedQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(toSearchHref(draftQuery));
  };

  if (searchQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (searchQuery.isError || !searchQuery.data) {
    return (
      <ErrorState
        title="Search is unavailable"
        description="Try again in a moment."
        action={<Button onClick={() => searchQuery.refetch()}>Retry</Button>}
      />
    );
  }

  const { users, jobs, companies } = searchQuery.data;
  const hasResults = users.length > 0 || jobs.length > 0 || companies.length > 0;

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-surface-900">Global Search</h1>
        <p className="text-sm text-surface-600">{heading}</p>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
        <Input
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Search by people, company, role, or location"
          className="sm:max-w-xl"
        />
        <Button type="submit">Search</Button>
      </form>

      {!hasResults ? (
        <EmptyState
          title="No matching results"
          description="Try a broader keyword such as a role, location, or company name."
        />
      ) : null}

      {users.length ? (
        <Card className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">People</h2>
            <p className="text-sm text-surface-600">Profiles from across your network.</p>
          </div>

          <ul className="space-y-2">
            {users.map((user) => {
              const subtitle = [user.currentRole, user.location].filter(Boolean).join(" · ");
              const profileHref = user.publicProfileUrl ? `/in/${user.publicProfileUrl}` : null;

              return (
                <li key={user.id} className="rounded-xl border border-surface-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {profileHref ? (
                        <Link href={profileHref} className="text-sm font-medium text-trust-700 hover:text-trust-800">
                          {user.name ?? "Anonymous professional"}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-surface-900">{user.name ?? "Anonymous professional"}</p>
                      )}
                      {subtitle ? <p className="mt-1 text-xs text-surface-600">{subtitle}</p> : null}
                      {user.headline ? <p className="mt-1 text-sm text-surface-700">{user.headline}</p> : null}
                    </div>
                    <span className="rounded-full bg-trust-50 px-2 py-0.5 text-xs font-semibold text-trust-700">
                      Trust {user.trustScore}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      {jobs.length ? (
        <Card className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">Jobs</h2>
            <p className="text-sm text-surface-600">Open opportunities matching your query.</p>
          </div>

          <ul className="space-y-2">
            {jobs.map((job) => (
              <li key={job.id} className="rounded-xl border border-surface-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900">{job.title}</p>
                    <p className="mt-1 text-xs text-surface-600">
                      {job.location ?? "Location flexible"} · Posted {formatDateTime(job.createdAt)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-surface-700">{job.description}</p>
                    {job.postedBy.publicProfileUrl ? (
                      <Link href={`/in/${job.postedBy.publicProfileUrl}`} className="mt-2 inline-block text-xs font-medium text-trust-700 hover:text-trust-800">
                        Posted by {job.postedBy.name ?? "Recruiter"}
                      </Link>
                    ) : null}
                  </div>
                  <Link href="/jobs" className="text-xs font-medium text-trust-700 hover:text-trust-800">
                    Open jobs
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {companies.length ? (
        <Card className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">Companies</h2>
            <p className="text-sm text-surface-600">Companies inferred from verified experience data.</p>
          </div>

          <ul className="space-y-2">
            {companies.map((company) => (
              <li key={company.companyName} className="rounded-xl border border-surface-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-surface-900">{company.companyName}</p>
                    <p className="text-xs text-surface-600">{company.memberCount} professionals with this company in profile history</p>
                  </div>
                  <Link href={toSearchHref(company.companyName)} className="text-xs font-medium text-trust-700 hover:text-trust-800">
                    Explore
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </section>
  );
}
