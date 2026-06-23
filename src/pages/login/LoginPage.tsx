import "./login.css";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/authClient";
import { useApiLanguage, useLanguage } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import { useState, type ChangeEvent } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";

type LoginStep = "email" | "otp";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [step, setStep] = useState<LoginStep>("email");

  const { setAccessToken } = useAuth();
  const { t } = useLanguage();
  const apiLanguage = useApiLanguage();
  const navigate = useNavigate();

  const requestOtpMutation = useMutation({
    mutationFn: () =>
      authApi.requestOtp({
        oTPRequest: { email, language: apiLanguage },
      }),
    onSuccess: () => {
      setStep("otp");
    },
  });

  const loginWithOtpMutation = useMutation({
    mutationFn: () =>
      authApi.loginWithOtp({
        loginRequest: { email, otp, language: apiLanguage },
      }),
    onSuccess: (data) => {
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        navigate("/tasks");
      }
    },
  });

  const canSendOtp = !!email && !requestOtpMutation.isPending;
  const canLogin = !!email && !!otp && !loginWithOtpMutation.isPending;

  return (
    <div className="login">
      <LanguageSwitcher className="language-switcher--login" />

      <div className="login-card">
        <h1 className="login-title">{t("login.title")}</h1>

        {step === "email" && (
          <>
            <p className="login-subtitle">{t("login.subtitleEmail")}</p>

            <div className="login-field">
              <label>{t("login.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder={t("login.emailPlaceholder")}
                autoComplete="email"
              />
            </div>

            <button
              className="login-button"
              onClick={() => requestOtpMutation.mutate()}
              disabled={!canSendOtp}
            >
              {requestOtpMutation.isPending
                ? t("login.sending")
                : t("login.sendCode")}
            </button>

            {requestOtpMutation.isError && (
              <p className="login-error">{t("login.errorOtpRequest")}</p>
            )}
          </>
        )}

        {step === "otp" && (
          <>
            <p className="login-subtitle">
              {t("login.subtitleOtp", { email })}
            </p>

            <div className="login-field">
              <label>{t("login.otp")}</label>
              <input
                value={otp}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setOtp(e.target.value)
                }
                placeholder={t("login.otpPlaceholder")}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <button
              className="login-button"
              onClick={() => loginWithOtpMutation.mutate()}
              disabled={!canLogin}
            >
              {loginWithOtpMutation.isPending
                ? t("login.checking")
                : t("login.submit")}
            </button>

            {loginWithOtpMutation.isError && (
              <p className="login-error">{t("login.errorLogin")}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
