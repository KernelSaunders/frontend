"use client"

import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { verifyClaim, unverifyClaim, updateClaimConfidence, Claim } from "@/lib/api";

interface VerifierClaimActionsProps {
  productId: string;
  claim: Claim;
  onVerificationChange?: () => void;
}

