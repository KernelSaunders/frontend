"use client";
import { useState, useEffect } from "react";
import { getMyRole } from "@/lib/api";

// Allows us to check what role the user has

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getMyRole()
      .then((data) => setRole(data.role))
      .catch(() => setRole(null));
  }, []);

  return role;
}
