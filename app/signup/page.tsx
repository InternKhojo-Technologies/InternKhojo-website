"use client";

import { Suspense } from "react";
import SignupContent from "./SignupContent";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
