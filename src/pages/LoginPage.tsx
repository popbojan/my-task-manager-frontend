import "./login.css";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authClient";
import { useState, type ChangeEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

type LoginStep = "email" | "otp";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [step, setStep] = useState<LoginStep>("email");

  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

const requestOtpMutation = useMutation({
  mutationFn: () =>
    authApi.requestOtp({
      oTPRequest: { email },
    }),
  onSuccess: (data) => {
    console.log("OTP requested:", data);
    setStep("otp");
  },
  onError: (error) => {
    console.error("Request OTP failed:", error);
  },
});

const loginWithOtpMutation = useMutation({
  mutationFn: () =>
    authApi.loginWithOtp({
      loginRequest: { email, otp },
    }),
  onSuccess: (data) => {
    console.log("Logged in:", data);
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
      navigate("/tasks");
    }
  },
  onError: (error) => {
    console.error("Login with OTP failed:", error);
  },
});

  const canSendOtp = !!email && !requestOtpMutation.isPending;
  const canLogin = !!email && !!otp && !loginWithOtpMutation.isPending;

  return (
    <div className="login">
      <div className="login-card">
        <h1 className="login-title">Anmelden</h1>

        {step === "email" && (
          <>
            <p className="login-subtitle">
              Wir schicken Ihnen einen Einmalcode per E-Mail.
            </p>

            <div className="login-field">
              <label>E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="name@domain.com"
                autoComplete="email"
              />
            </div>

            <button
              className="login-button"
              onClick={() => requestOtpMutation.mutate()}
              disabled={!canSendOtp}
            >
              {requestOtpMutation.isPending ? "Sende…" : "Code senden"}
            </button>

            {requestOtpMutation.isError && (
              <p className="login-error">OTP konnte nicht gesendet werden.</p>
            )}
          </>
        )}

        {step === "otp" && (
          <>
            <p className="login-subtitle">
              Wir haben einen Code an <b>{email}</b> geschickt.
            </p>

            <div className="login-field">
              <label>OTP-Code</label>
              <input
                value={otp}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setOtp(e.target.value)
                }
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <button
              className="login-button"
              onClick={() => loginWithOtpMutation.mutate()}
              disabled={!canLogin}
            >
              {loginWithOtpMutation.isPending ? "Prüfe…" : "Einloggen"}
            </button>

            <button
              className="login-link"
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
              }}
            >
              E-Mail ändern
            </button>

            <button
              className="login-link"
              type="button"
              onClick={() => requestOtpMutation.mutate()}
              disabled={requestOtpMutation.isPending}
            >
              Code erneut senden
            </button>

            {loginWithOtpMutation.isError && (
              <p className="login-error">OTP ist ungültig oder abgelaufen.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}