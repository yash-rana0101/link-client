"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

interface PostComposerProps {
  onCreatePost: (content: string) => void;
  isSubmitting: boolean;
}

export const PostComposer = ({
  onCreatePost,
  isSubmitting,
}: PostComposerProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    onCreatePost(trimmedContent);
    setContent("");
  };

  return (
    <Card>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={5000}
          placeholder="Share a verified win, a hiring insight, or your latest proof of work..."
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
