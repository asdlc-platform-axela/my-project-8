import { useEffect, useState } from "react";
import { currentUser } from "../authz/session";

export interface Profile {
  name: string;
  email: string;
}

/** The signed-in user's display profile, read through the session module. */
export function useProfile(): Profile {
  const [profile, setProfile] = useState<Profile>({ name: "", email: "" });
  useEffect(() => {
    let live = true;
    void currentUser().then((user) => {
      if (!live || !user) return;
      const p = (user.profile ?? {}) as Record<string, unknown>;
      const str = (v: unknown) => (typeof v === "string" ? v : "");
      const name = str(p.name) || [str(p.given_name), str(p.family_name)].filter(Boolean).join(" ") || str(p.email) || str(p.sub);
      setProfile({ name, email: str(p.email) });
    });
    return () => {
      live = false;
    };
  }, []);
  return profile;
}
