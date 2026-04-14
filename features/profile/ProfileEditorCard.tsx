"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { uploadToCloudinary } from "@/services/cloudinary.service";
import { normalizeApiError } from "@/services/api";
import {
  profileService,
  type UpdateProfilePayload,
  type UploadAssetKind,
} from "@/services/profile.service";
import { useUpdateProfile } from "@/features/profile/useProfile";
import type { Profile } from "@/types/profile";

interface ProfileEditorCardProps {
  profile: Profile;
}

interface ProfileFormState {
  name: string;
  currentRole: string;
  headline: string;
  about: string;
  publicProfileUrl: string;
  profileImageUrl: string;
  profileBannerUrl: string;
  skillsInput: string;
}

const toSkillsInput = (skills: Profile["skills"]) => skills.map((skill) => skill.name).join(", ");

const toInitialState = (profile: Profile): ProfileFormState => ({
  name: profile.name ?? "",
  currentRole: profile.currentRole ?? "",
  headline: profile.headline ?? "",
  about: profile.about ?? "",
  publicProfileUrl: profile.publicProfileUrl ?? "",
  profileImageUrl: profile.profileImageUrl ?? "",
  profileBannerUrl: profile.profileBannerUrl ?? "",
  skillsInput: toSkillsInput(profile.skills),
});

const parseSkills = (value: string): string[] => {
  const uniqueValues = new Set<string>();

  for (const part of value.split(",")) {
    const normalized = part.trim();

    if (!normalized) {
      continue;
    }

    uniqueValues.add(normalized);
  }

  return Array.from(uniqueValues);
};

const toSlug = (value: string): string => value
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, "")
  .replace(/^www\./, "")
  .replace(/^linkedin\.com\/in\//, "")
  .replace(/^in\//, "")
  .replace(/[^a-z0-9-]/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

export const ProfileEditorCard = ({ profile }: ProfileEditorCardProps) => {
  const updateProfileMutation = useUpdateProfile();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileFormState>(() => toInitialState(profile));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<UploadAssetKind | null>(null);

  useEffect(() => {
    setForm(toInitialState(profile));
  }, [profile]);

  const previewSlug = useMemo(() => toSlug(form.publicProfileUrl), [form.publicProfileUrl]);
  const previewPath = previewSlug ? `/in/${previewSlug}` : null;

  const handleFieldChange = (field: keyof ProfileFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleUpload = async (kind: UploadAssetKind, file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Only image files are supported.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadingKind(kind);

    try {
      const signature = await profileService.createUploadSignature(kind);
      const secureUrl = await uploadToCloudinary(file, signature);

      if (kind === "PROFILE_IMAGE") {
        handleFieldChange("profileImageUrl", secureUrl);
      } else {
        handleFieldChange("profileBannerUrl", secureUrl);
      }
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    } finally {
      setUploadingKind(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = form.name.trim();

    if (!trimmedName) {
      setErrorMessage("Name is required.");
      return;
    }

    const payload: UpdateProfilePayload = {
      name: trimmedName,
      currentRole: form.currentRole.trim() || null,
      headline: form.headline.trim() || null,
      about: form.about.trim() || null,
      profileImageUrl: form.profileImageUrl.trim() || null,
      profileBannerUrl: form.profileBannerUrl.trim() || null,
      publicProfileUrl: previewSlug || null,
      skills: parseSkills(form.skillsInput),
    };

    try {
      await updateProfileMutation.mutateAsync(payload);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    }
  };

  const isUploadingImage = uploadingKind === "PROFILE_IMAGE";
  const isUploadingBanner = uploadingKind === "PROFILE_BANNER";

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-surface-900">Edit Profile</h3>
        <p className="text-sm text-surface-600">
          Add a profile photo, banner, and your public profile URL.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-3 rounded-xl border border-surface-300 bg-surface-100 p-3">
          <div
            className="h-28 rounded-xl border border-surface-300 bg-cover bg-center"
            style={
              form.profileBannerUrl
                ? { backgroundImage: `url(${form.profileBannerUrl})` }
                : undefined
            }
          >
            {!form.profileBannerUrl ? (
              <div className="flex h-full items-center justify-center text-xs font-medium text-surface-500">
                Profile banner preview
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-full border border-surface-300 bg-surface-200">
              {form.profileImageUrl ? (
                <img
                  src={form.profileImageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-surface-500">
                  Photo
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void handleUpload("PROFILE_IMAGE", file);
                  }

                  event.currentTarget.value = "";
                }}
              />
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void handleUpload("PROFILE_BANNER", file);
                  }

                  event.currentTarget.value = "";
                }}
              />

              <Button
                type="button"
                variant="secondary"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage || isUploadingBanner}
              >
                {isUploadingImage ? "Uploading..." : "Upload profile photo"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploadingImage || isUploadingBanner}
              >
                {isUploadingBanner ? "Uploading..." : "Upload banner"}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Full name</label>
          <Input
            value={form.name}
            onChange={(event) => handleFieldChange("name", event.target.value)}
            placeholder="Your full name"
            maxLength={120}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Current role</label>
          <Input
            value={form.currentRole}
            onChange={(event) => handleFieldChange("currentRole", event.target.value)}
            placeholder="Backend Engineer"
            maxLength={160}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Headline</label>
          <Input
            value={form.headline}
            onChange={(event) => handleFieldChange("headline", event.target.value)}
            placeholder="Backend Engineer | Node.js, Redis"
            maxLength={180}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">About</label>
          <Textarea
            value={form.about}
            onChange={(event) => handleFieldChange("about", event.target.value)}
            placeholder="What you build and what you are focused on"
            maxLength={2000}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">Skills</label>
          <Input
            value={form.skillsInput}
            onChange={(event) => handleFieldChange("skillsInput", event.target.value)}
            placeholder="Node.js, PostgreSQL, Redis"
          />
          <p className="mt-1 text-xs text-surface-500">
            Use comma-separated values. Keep this list focused to 8-10 skills.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-surface-700">
            Public profile URL
          </label>
          <Input
            value={form.publicProfileUrl}
            onChange={(event) => handleFieldChange("publicProfileUrl", event.target.value)}
            placeholder="ranayash"
            maxLength={100}
          />
          <p className="mt-1 text-xs text-surface-500">
            Share this profile URL publicly: {previewPath ?? "/in/your-name"}
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        ) : null}

        {successMessage ? (
          <p className="rounded-lg bg-trust-50 px-3 py-2 text-sm text-trust-700">{successMessage}</p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfileMutation.isPending || isUploadingImage || isUploadingBanner}>
            {updateProfileMutation.isPending ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
