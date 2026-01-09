"use client";

import { useState, useEffect } from "react";
import { profileService } from "../services/profile.service";

export function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAll();
      setProfiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const updated = await profileService.upsert(profileData);
      setProfiles((prev) =>
        prev.map((p: any) => (p.id === updated.id ? updated : p)),
      );
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { profiles, loading, error, fetchProfiles, updateProfile };
}
