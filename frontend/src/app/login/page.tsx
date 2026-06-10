"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClinician } from "@/lib/useClinician";

export default function LoginPage() {
  const router = useRouter();
  const clinician = useClinician();
  const [isChecked, setIsChecked] = useState(false);
  const [pin, setPin] = useState("");

  // Handle window focus and blur event listeners to trigger PHI security mask on the page
  useEffect(() => {
    const handleBlur = () => {
      document.body.classList.add("phi-mask-active");
    };
    const handleFocus = () => {
      document.body.classList.remove("phi-mask-active");
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Handle NHS Login action
  const handleNhsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecked) {
      router.push("/dashboard");
    }
  };

  // Handle Smartcard submit action
  const handleSmartcardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecked && pin.length === 4) {
      await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: clinician.id,
          actorName: clinician.name,
          actorRole: clinician.role,
          action: "auth.login.success",
          resourceType: "session",
          resourceId: `sess-${Date.now()}`,
          patientId: null,
          accessResult: "granted",
          sensitivityTier: null,
        }),
      });
      router.push("/dashboard");
    }
  };

  return (
    <div className="bg-pattern min-h-screen flex flex-col font-body-base text-on-surface">
      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* Branding Header */}
          <div className="mb-10 text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-10 px-3 bg-white flex items-center justify-center">
                {/* NHS Logo Representation */}
                <span
                  className="text-blue-500 font-extrabold text-[24px] tracking-tighter"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  NHS
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-primary">
                CLinIQ
              </h1>
            </div>
            <p className="text-on-primary-container font-body-sm opacity-80">
              Secure Portal for Healthcare Providers
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-navy-800 w-full p-8 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
            {/* Status Strip */}
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
            <div className="space-y-6">
              {/* Auth Method: NHS Login */}
              <button
                type="button"
                onClick={handleNhsLogin}
                className="w-full h-12 bg-blue-500 hover:bg-blue-400 text-white font-ui-heading text-ui-heading flex items-center justify-center gap-3 transition-all active:scale-95"
                style={{
                  opacity: isChecked ? "1" : "0.4",
                  cursor: isChecked ? "pointer" : "not-allowed",
                }}
                disabled={!isChecked}
              >
                <span className="material-symbols-outlined" data-icon="login">
                  login
                </span>
                Continue with NHS Login
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-outline-variant/20"></div>
                <span className="flex-shrink mx-4 text-on-primary-container text-label-xs font-label-xs">
                  OR USE SMARTCARD
                </span>
                <div className="flex-grow border-t border-outline-variant/20"></div>
              </div>

              {/* Auth Method: Smartcard */}
              <form onSubmit={handleSmartcardSubmit} className="space-y-2">
                <label className="text-on-primary font-label-xs text-label-xs opacity-70 block">
                  NHS Smartcard PIN
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full bg-primary-container border border-outline-variant/30 text-white font-data-mono text-center tracking-[1rem] focus:ring-secondary focus:border-secondary focus:outline-none px-3 py-2 rounded-sm"
                    maxLength={4}
                    placeholder="••••"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  />
                  <button
                    type="submit"
                    className="bg-navy-700 px-4 text-on-primary border border-outline-variant/20 hover:bg-navy-600 transition-colors"
                    disabled={!isChecked || pin.length !== 4}
                    style={{
                      opacity: isChecked && pin.length === 4 ? "1" : "0.4",
                      cursor: isChecked && pin.length === 4 ? "pointer" : "not-allowed",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      data-icon="arrow_forward"
                    >
                      arrow_forward
                    </span>
                  </button>
                </div>
                <p className="text-on-primary-container font-body-sm text-[11px] flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    data-icon="info"
                  >
                    info
                  </span>
                  Ensure reader is connected and card is inserted.
                </p>
              </form>

              {/* HIPAA Training Gate */}
              <div className="bg-primary-container/50 p-4 border-l-2 border-secondary-container">
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <input
                      className="rounded-sm bg-navy-900 border-outline text-secondary focus:ring-secondary cursor-pointer h-4 w-4"
                      id="policy-gate"
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    />
                  </div>
                  <label
                    className="text-on-primary-container text-body-sm leading-snug cursor-pointer select-none"
                    htmlFor="policy-gate"
                  >
                    I confirm I have completed my annual{" "}
                    <span className="text-on-primary font-bold">HIPAA &amp; GDPR</span>{" "}
                    training. I agree to the{" "}
                    <span className="text-secondary-fixed-dim underline cursor-pointer">
                      Security Protocol
                    </span>{" "}
                    and understand all sessions are audited.
                  </label>
                </div>
              </div>

              {/* SSO Link */}
              <div className="pt-2 text-center">
                <a
                  className="text-on-primary-container hover:text-on-primary transition-colors text-label-xs font-label-xs underline underline-offset-4 decoration-outline-variant"
                  href="#"
                >
                  Sign in with Trust SSO (Single Sign-On)
                </a>
              </div>
            </div>
          </div>

          {/* Footer Compliance Section */}
          <div className="mt-12 w-full max-w-sm">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* ISO Badge */}
              <div className="flex items-center gap-3 p-3 bg-navy-800/40 border border-outline-variant/10">
                <span
                  className="material-symbols-outlined text-secondary-container"
                  data-icon="verified_user"
                >
                  verified_user
                </span>
                <div className="flex flex-col">
                  <span className="text-on-primary font-bold text-[10px] leading-none">
                    ISO 27001
                  </span>
                  <span className="text-on-primary-container text-[8px] uppercase tracking-wider">
                    Certified System
                  </span>
                </div>
              </div>
              {/* HIPAA Badge */}
              <div className="flex items-center gap-3 p-3 bg-navy-800/40 border border-outline-variant/10">
                <span
                  className="material-symbols-outlined text-secondary-container"
                  data-icon="gavel"
                >
                  gavel
                </span>
                <div className="flex flex-col">
                  <span className="text-on-primary font-bold text-[10px] leading-none">
                    HIPAA
                  </span>
                  <span className="text-on-primary-container text-[8px] uppercase tracking-wider">
                    Compliant Cloud
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-on-primary-container font-label-xs text-label-xs opacity-40 uppercase tracking-widest">
                Zero PHI Persistent Storage Enabled
              </p>
              <p className="text-on-primary-container font-body-sm text-[10px] opacity-30 px-4">
                System automatically logs out after 12 minutes of inactivity.
                Session traffic is encrypted via TLS 1.3 with 256-bit AES.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Aesthetic Decorative Element */}
      <div className="fixed top-0 right-0 p-12 pointer-events-none opacity-10">
        <span
          className="material-symbols-outlined text-[120px] text-on-primary"
          data-icon="medical_services"
        >
          medical_services
        </span>
      </div>
    </div>
  );
}
