"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { RelationshipType } from "@/types/profile";

const relationshipOptions: RelationshipType[] = [
  "COWORKER",
  "TEAMMATE",
  "INTERVIEWED_WITH",
  "EVENT",
  "COLD_OUTREACH",
];

interface ConnectionRequestFormProps {
  onSubmit: (payload: { receiverId: string; relationship: RelationshipType }) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export const ConnectionRequestForm = ({
  onSubmit,
  isSubmitting,
  errorMessage,
}: ConnectionRequestFormProps) => {
  const [receiverId, setReceiverId] = useState("");
  const [relationship, setRelationship] = useState<RelationshipType>("COWORKER");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedReceiverId = receiverId.trim();
    if (!trimmedReceiverId) {
      return;
    }

    onSubmit({
      receiverId: trimmedReceiverId,
      relationship,
    });

    setReceiverId("");
  };

  return (
    <Card className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-surface-900">Request Connection</h3>
        <p className="text-sm text-surface-600">
          Send a trust-graph request using the target user ID.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">
            Receiver User ID
          </label>
          <Input
            value={receiverId}
            onChange={(event) => setReceiverId(event.target.value)}
            placeholder="uuid"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">
            Relationship Context
          </label>
          <select
            className="h-11 w-full rounded-xl border border-surface-300 bg-white px-3 text-sm text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-500"
            value={relationship}
            onChange={(event) =>
              setRelationship(event.target.value as RelationshipType)
            }
          >
            {relationshipOptions.map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {errorMessage ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting || !receiverId.trim()}>
          {isSubmitting ? "Sending..." : "Send Request"}
        </Button>
      </form>
    </Card>
  );
};
