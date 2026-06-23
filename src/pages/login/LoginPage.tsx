import "./login.css";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/authClient";
import { useApiLanguage, useLanguage } from "@/i18n/LanguageProvider";
import LanguageDropdown from "@/i18n/LanguageDropdown";
import LoginHelpTooltip from "@/pages/login/LoginHelpTooltip";
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
      <div className="login__background" aria-hidden="true" />
      <div className="login__overlay" aria-hidden="true" />

      <LanguageDropdown className="language-dropdown--login login__language" />

      <div className="login__layout">
        <div className="login__hero" aria-hidden="true">
          <p className="login__hero-kicker">{t("login.hero.kicker")}</p>
          <h2 className="login__hero-title">
            <span>{t("login.hero.titleLine1")}</span>
            <span>{t("login.hero.titleLine2")}</span>
            <span className="login__hero-title-accent">
              {t("login.hero.titleLine3")}
            </span>
          </h2>
        </div>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__header">
            <div className="login-panel__title-row">
              <h1 id="login-title" className="login-panel__title">
                {t("login.title")}
              </h1>
              <LoginHelpTooltip />
            </div>
            <p className="login-panel__subtitle">{t("login.subtitle")}</p>
          </div>

          {step === "email" && (
            <form
              className="login-panel__form"
              onSubmit={(event) => {
                event.preventDefault();
                if (canSendOtp) {
                  requestOtpMutation.mutate();
                }
              }}
            >
              <div className="login-field">
                <label htmlFor="login-email">{t("login.email")}</label>
                <input
                  id="login-email"
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
                type="submit"
                className="login-button"
                disabled={!canSendOtp}
              >
                {requestOtpMutation.isPending
                  ? t("login.sending")
                  : t("login.sendCode")}
              </button>

              {requestOtpMutation.isError && (
                <p className="login-error">{t("login.errorOtpRequest")}</p>
              )}
            </form>
          )}

          {step === "otp" && (
            <form
              className="login-panel__form"
              onSubmit={(event) => {
                event.preventDefault();
                if (canLogin) {
                  loginWithOtpMutation.mutate();
                }
              }}
            >
              <p className="login-panel__step-hint">
                {t("login.subtitleOtp", { email })}
              </p>

              <div className="login-field">
                <label htmlFor="login-otp">{t("login.otp")}</label>
                <input
                  id="login-otp"
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
                type="submit"
                className="login-button"
                disabled={!canLogin}
              >
                {loginWithOtpMutation.isPending
                  ? t("login.checking")
                  : t("login.submit")}
              </button>

              {loginWithOtpMutation.isError && (
                <p className="login-error">{t("login.errorLogin")}</p>
              )}
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
