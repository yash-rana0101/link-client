"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

interface PostComposerProps {
  onCreatePost: (content: string) => void;
  isSubmitting: boolean;
  authorName?: string;
}

const composerTemplates = [
  { label: "Verified Win", seed: "Verified win: " },
  { label: "Proof of Work", seed: "Proof of work: " },
  { label: "Insight", seed: "Insight: " },
];

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

export const PostComposer = ({
  onCreatePost,
  isSubmitting,
  authorName,
}: PostComposerProps) => {
  const [content, setContent] = useState("");
  const displayName = authorName ?? "Trusted Professional";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    onCreatePost(trimmedContent);
    setContent("");
  };

  const handleTemplateSelect = (seed: string) => {
    setContent((current) => {
      if (!current.trim()) {
        return seed;
      }

      return `${current.trim()}\n${seed}`;
    });
  };

  return (
    <Card className="rounded-2xl border-surface-300 bg-surface-100/90 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-trust-200 bg-trust-100 text-sm font-semibold text-trust-700">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1 rounded-2xl border border-surface-300 bg-white p-3">
            <p className="mb-2 text-xs font-medium text-surface-600">{displayName}</p>
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={5000}
              className="min-h-24 border-none bg-transparent px-0 py-0 focus-visible:ring-0"
              placeholder="Share a verified win, insight, or proof of work..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-300 pt-3">
          <div className="flex flex-wrap gap-2">
            {composerTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => handleTemplateSelect(template.seed)}
                className="rounded-full border border-surface-300 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 transition-colors duration-200 hover:border-trust-300 hover:bg-trust-100 hover:text-trust-700"
              >
                {template.label}
              </button>
            ))}
          </div>

          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
