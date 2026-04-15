"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { uploadToCloudinary } from "@/services/cloudinary.service";
import { profileService } from "@/services/profile.service";

interface PostComposerProps {
  onCreatePost: (payload: { content: string; imageUrl?: string | null }) => Promise<unknown>;
  isSubmitting: boolean;
  authorName?: string;
  authorImageUrl?: string | null;
  authorProfileHref?: string;
}

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
  authorImageUrl,
  authorProfileHref,
}: PostComposerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const displayName = authorName ?? "Trusted Professional";

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    setSelectedFileName(null);
    setPreviewImageUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  };

  const resetComposer = () => {
    setContent("");
    clearSelectedImage();
    setUploadError(null);
    setIsUploading(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    try {
      let uploadedImageUrl: string | null = null;

      if (selectedImageFile) {
        setIsUploading(true);
        const signature = await profileService.createUploadSignature("POST_IMAGE");
        uploadedImageUrl = await uploadToCloudinary(selectedImageFile, signature);
      }

      await onCreatePost({
        content: trimmedContent,
        imageUrl: uploadedImageUrl,
      });

      resetComposer();
      setIsModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create post.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be 10MB or smaller.");
      return;
    }

    setUploadError(null);

    setSelectedImageFile(file);
    setSelectedFileName(file.name);
    setPreviewImageUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Card className="rounded-2xl border-surface-300 bg-surface-100/90 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
        <div className="flex items-center gap-3">
          {authorProfileHref ? (
            <Link
              href={authorProfileHref}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-trust-200 bg-trust-100 text-sm font-semibold text-trust-700 transition-transform duration-200 hover:scale-[1.04]"
            >
              {authorImageUrl ? (
                <img
                  src={authorImageUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(displayName)
              )}
            </Link>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-trust-200 bg-trust-100 text-sm font-semibold text-trust-700">
              {authorImageUrl ? (
                <img
                  src={authorImageUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(displayName)
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex h-11 flex-1 items-center rounded-full border border-surface-300 bg-white px-4 text-left text-sm text-surface-600 transition-colors duration-200 hover:bg-surface-50"
          >
            Start a post
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-surface-300 pt-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors duration-200 hover:bg-white"
          >
            <svg className="h-4 w-4 text-sky-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-13Zm2 0v10.88l3.86-3.87a1 1 0 011.41 0l1.6 1.6 3.23-3.22a1 1 0 011.41 0L18 11.38V5.5H6Zm0 12.99h12V14.2l-1.79-1.8-3.23 3.24a1 1 0 01-1.41 0l-1.6-1.6L6 18.49ZM8.75 10A1.75 1.75 0 108.75 6.5 1.75 1.75 0 008.75 10Z" />
            </svg>
            Photo
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors duration-200 hover:bg-white"
          >
            <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 4.75A2.75 2.75 0 003.25 7.5v9A2.75 2.75 0 006 19.25h12A2.75 2.75 0 0020.75 16.5v-9A2.75 2.75 0 0018 4.75H6Zm5.53 3.22a1 1 0 00-1.53.85v2.15H7.85a1 1 0 000 2H10v2.2a1 1 0 001.7.71l3.1-3.1a1 1 0 000-1.42l-3.27-3.14Z" />
            </svg>
            Video
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors duration-200 hover:bg-white"
          >
            <svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.5a1 1 0 011 1v1.02a7.5 7.5 0 015.98 5.98H20a1 1 0 110 2h-1.02A7.5 7.5 0 0113 18.48V19.5a1 1 0 11-2 0v-1.02A7.5 7.5 0 015.02 12.5H4a1 1 0 110-2h1.02A7.5 7.5 0 0111 4.52V3.5a1 1 0 011-1Zm0 4a5.5 5.5 0 100 11 5.5 5.5 0 000-11Zm0 2.5a1 1 0 011 1v1.59l.7.7a1 1 0 01-1.4 1.42l-1-1A1 1 0 0111 12V10a1 1 0 011-1Z" />
            </svg>
            Event
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors duration-200 hover:bg-white"
          >
            <svg className="h-4 w-4 text-rose-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 4.75A2.75 2.75 0 003.25 7.5v9A2.75 2.75 0 006 19.25h12A2.75 2.75 0 0020.75 16.5v-9A2.75 2.75 0 0018 4.75H6Zm2 2h8.5a1 1 0 110 2H8a1 1 0 010-2Zm0 4h8.5a1 1 0 010 2H8a1 1 0 010-2Zm0 4H13a1 1 0 010 2H8a1 1 0 010-2Z" />
            </svg>
            Write article
          </button>
        </div>
      </Card>

      {isModalOpen ? (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/35 px-4 py-6">
          <button
            type="button"
            aria-label="Close post composer"
            className="absolute inset-0"
            onClick={() => {
              if (!isSubmitting && !isUploading) {
                setIsModalOpen(false);
              }
            }}
          />

          <Card className="relative z-121 flex h-[min(90vh,700px)] w-full max-w-215 flex-col overflow-hidden rounded-2xl border border-surface-300 bg-white p-0 shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-sm font-semibold text-surface-700">
                  {authorImageUrl ? (
                    <img src={authorImageUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-tight text-surface-900">{displayName}</p>
                  <p className="text-sm text-surface-600">Post to Anyone</p>
                </div>
              </div>

              <button
                type="button"
                className="rounded-full p-2 text-surface-600 transition-colors duration-200 hover:bg-surface-100 hover:text-surface-900"
                onClick={() => {
                  if (!isSubmitting && !isUploading) {
                    setIsModalOpen(false);
                  }
                }}
                aria-label="Close"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void handleSubmit(event)}>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={5000}
                  className="h-44 w-full resize-none border-none text-[2rem] leading-tight text-surface-700 outline-none placeholder:text-surface-400"
                  placeholder="What do you want to talk about?"
                />

                {previewImageUrl ? (
                  <div className="mt-4 rounded-xl border border-surface-200 bg-surface-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-surface-700">{selectedFileName ?? "Uploaded image"}</p>
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="rounded-full px-2 py-1 text-xs font-semibold text-surface-600 transition-colors duration-200 hover:bg-surface-200 hover:text-surface-900"
                      >
                        Remove
                      </button>
                    </div>
                    <img src={previewImageUrl} alt="Post attachment preview" className="max-h-90 w-full rounded-lg object-cover" />
                  </div>
                ) : null}

                {uploadError ? (
                  <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {uploadError}
                  </p>
                ) : null}
              </div>

              <div className="border-t border-surface-200 px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-surface-700 transition-colors duration-200 hover:bg-surface-100"
                      disabled={isUploading || isSubmitting}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-13Zm2 0v10.88l3.86-3.87a1 1 0 011.41 0l1.6 1.6 3.23-3.22a1 1 0 011.41 0L18 11.38V5.5H6Zm0 12.99h12V14.2l-1.79-1.8-3.23 3.24a1 1 0 01-1.41 0l-1.6-1.6L6 18.49ZM8.75 10A1.75 1.75 0 108.75 6.5 1.75 1.75 0 008.75 10Z" />
                      </svg>
                      Add media
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-full px-3 text-surface-600 transition-colors duration-200 hover:bg-surface-100"
                    >
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2.5a1 1 0 011 1v1.02a7.5 7.5 0 015.98 5.98H20a1 1 0 110 2h-1.02A7.5 7.5 0 0113 18.48V19.5a1 1 0 11-2 0v-1.02A7.5 7.5 0 015.02 12.5H4a1 1 0 110-2h1.02A7.5 7.5 0 0111 4.52V3.5a1 1 0 011-1Zm0 4a5.5 5.5 0 100 11 5.5 5.5 0 000-11Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-full px-3 text-surface-600 transition-colors duration-200 hover:bg-surface-100"
                    >
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 4a1 1 0 011 1v1h8V5a1 1 0 112 0v1h.5A2.5 2.5 0 0121 8.5v10a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18.5v-10A2.5 2.5 0 015.5 6H6V5a1 1 0 011-1Zm12 7H5v7.5c0 .28.22.5.5.5h13a.5.5 0 00.5-.5V11ZM5.5 8a.5.5 0 00-.5.5V9h14v-.5a.5.5 0 00-.5-.5h-13Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-full px-3 text-surface-600 transition-colors duration-200 hover:bg-surface-100"
                    >
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M11 4a1 1 0 112 0v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4Z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {isUploading ? <p className="text-sm text-surface-600">Uploading image...</p> : null}
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading || !content.trim()}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-trust-600 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-trust-700 disabled:cursor-not-allowed disabled:bg-surface-300 disabled:text-surface-500"
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  handleAttachImage(file);
                }
              }}
            />
          </Card>
        </div>
      ) : null}
    </>
  );
};