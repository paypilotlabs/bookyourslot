"use client";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { HOSTED_CAL_FEATURES, WEBAPP_URL, WEBSITE_URL } from "@calcom/lib/constants";
import { emailRegex } from "@calcom/lib/emailSchema";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Alert } from "@calcom/ui/components/alert";
import { Icon } from "@calcom/ui/components/icon";
import { Logo } from "@calcom/ui/components/logo";
import { LastUsed, useLastUsed } from "@calcom/web/modules/auth/hooks/useLastUsed";
import AddToHomescreen from "@components/AddToHomescreen";
import BackupCode from "@components/auth/BackupCode";
import TwoFactor from "@components/auth/TwoFactor";
import { Button } from "@coss/ui/components/button";
import { Field, FieldLabel } from "@coss/ui/components/field";
import { Input } from "@coss/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@coss/ui/components/input-group";
import { Separator } from "@coss/ui/components/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import type { inferSSRProps } from "@lib/types/inferSSRProps";
import type { getServerSideProps } from "@server/lib/auth/login/getServerSideProps";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

interface LoginValues {
  email: string;
  password: string;
  totpCode: string;
  backupCode: string;
  csrfToken: string;
}

const MicrosoftIcon = () => <img className="size-4" src="/microsoft-logo.svg" alt="" />;

const GoogleIcon = () => <img className="size-4" src="/google-icon-colored.svg" alt="" />;

function BackgroundGrid() {
  // A soft lime glow behind the card on the navy brand ground. Replaces the
  // old grid + white radial vignette, which fought the card in dark mode.
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="bg-brand-lime/20 absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
    </div>
  );
}
export type PageProps = inferSSRProps<typeof getServerSideProps>;
export default function Login({
  csrfToken,
  isGoogleLoginEnabled,
  isOutlookLoginEnabled,
  totpEmail,
}: PageProps) {
  const searchParams = useCompatSearchParams();
  const { t } = useLocale();
  const router = useRouter();
  const formSchema = z
    .object({
      email: z
        .string()
        .min(1, `${t("error_required_field")}`)
        .regex(emailRegex, `${t("enter_valid_email")}`),
      ...(totpEmail ? {} : { password: z.string().min(1, `${t("error_required_field")}`) }),
    })
    // Passthrough other fields like totpCode
    .passthrough();
  const methods = useForm<LoginValues>({ resolver: zodResolver(formSchema) });
  const { register, formState } = methods;
  const [twoFactorRequired, setTwoFactorRequired] = useState(!!totpEmail || false);
  const [twoFactorLostAccess, setTwoFactorLostAccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useLastUsed();
  const [showPassword, setShowPassword] = useState(false);

  const errorMessages: { [key: string]: string } = {
    // [ErrorCode.SecondFactorRequired]: t("2fa_enabled_instructions"),
    // Don't leak information about whether an email is registered or not
    [ErrorCode.IncorrectEmailPassword]: t("incorrect_email_password"),
    [ErrorCode.IncorrectTwoFactorCode]: `${t("incorrect_2fa_code")} ${t("please_try_again")}`,
    [ErrorCode.InternalServerError]: `${t("something_went_wrong")} ${t("please_try_again_and_contact_us")}`,
    [ErrorCode.ThirdPartyIdentityProviderEnabled]: t("account_created_with_identity_provider"),
  };

  let callbackUrl = searchParams?.get("callbackUrl") || "";

  if (/"\//.test(callbackUrl)) callbackUrl = callbackUrl.substring(1);

  // If not absolute URL, make it absolute
  if (!/^https?:\/\//.test(callbackUrl)) {
    callbackUrl = `${WEBAPP_URL}/${callbackUrl}`;
  }

  const safeCallbackUrl = getSafeRedirectUrl(callbackUrl);

  callbackUrl = safeCallbackUrl || "";

  const onSubmit = async (values: LoginValues) => {
    setErrorMessage(null);
    // telemetry.event(telemetryEventTypes.login, collectPageParameters());
    const res = await signIn<"credentials">("credentials", {
      ...values,
      callbackUrl,
      redirect: false,
    });
    if (!res) setErrorMessage(errorMessages[ErrorCode.InternalServerError]);
    // we're logged in! let's do a hard refresh to the desired url
    else if (!res.error) {
      setLastUsed("credentials");
      router.push(callbackUrl);
    } else if (res.error === ErrorCode.SecondFactorRequired) setTwoFactorRequired(true);
    else if (res.error === ErrorCode.IncorrectBackupCode) setErrorMessage(t("incorrect_backup_code"));
    else if (res.error === ErrorCode.MissingBackupCodes) setErrorMessage(t("missing_backup_codes"));
    // fallback if error not found
    else setErrorMessage(errorMessages[res.error] || t("something_went_wrong"));
  };

  const showSocialLogin = isGoogleLoginEnabled || isOutlookLoginEnabled;
  const showSignupLink =
    process.env.NEXT_PUBLIC_DISABLE_SIGNUP !== "true" && searchParams?.get("register") !== "false";

  return (
    <div className="bg-brand-navy relative flex min-h-screen items-center justify-center px-4 py-10 [--cal-brand-emphasis:#bfe23e] [--cal-brand-text:#0E0E1B] [--cal-brand:#CDF34F] dark:[--cal-brand-emphasis:#bfe23e] dark:[--cal-brand-text:#0E0E1B] dark:[--cal-brand:#CDF34F]">
      <BackgroundGrid />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Auth pages have no theme provider, so app tokens resolve to light:
            the card is white with dark text for every visitor. A deliberate,
            consistent look on the navy brand ground. */}
        <div className="bg-default border-subtle w-full rounded-2xl border p-10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <div className="mb-2 flex justify-center">
            <Logo inline={false} />
          </div>

          {/* Heading */}
          <p className="mb-8 text-center text-sm text-subtle" data-testid="login-subtitle">
            {twoFactorRequired ? t("2fa_code") : t("welcome_back_sign_in")}
          </p>

          <FormProvider {...methods}>
            {/* Social Login Buttons */}
            {!twoFactorRequired && showSocialLogin && (
              <>
                <div className="flex flex-col gap-2">
                  {isGoogleLoginEnabled && (
                    <Button
                      className="w-full py-1"
                      disabled={formState.isSubmitting}
                      data-testid="google"
                      onClick={async (e) => {
                        e.preventDefault();
                        setLastUsed("google");
                        await signIn("google", {
                          callbackUrl,
                        });
                      }}>
                      <GoogleIcon />
                      <span>{t("signin_with_google")}</span>
                      {lastUsed === "google" && <LastUsed />}
                    </Button>
                  )}
                  {isOutlookLoginEnabled && (
                    <Button
                      variant="outline"
                      className="w-full py-1"
                      data-testid="microsoft"
                      onClick={async (e) => {
                        e.preventDefault();
                        setLastUsed("microsoft");
                        await signIn("azure-ad", {
                          callbackUrl,
                        });
                      }}>
                      <MicrosoftIcon />
                      <span>{t("signin_with_microsoft")}</span>
                      {lastUsed === "microsoft" && <LastUsed />}
                    </Button>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-sm text-zinc-400">{t("or").toLowerCase()}</span>
                  <Separator className="flex-1" />
                </div>
              </>
            )}

            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate data-testid="login-form">
              <input defaultValue={csrfToken || undefined} type="hidden" hidden {...register("csrfToken")} />

              {!twoFactorRequired && (
                <div className="space-y-6">
                  {/* Email Field */}
                  <Field>
                    <FieldLabel>{t("email")}</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={totpEmail || (searchParams?.get("email") as string)}
                      autoComplete="email"
                      {...register("email")}
                    />
                    {formState.errors.email && (
                      <p data-testid="field-error" className="text-destructive-foreground text-xs">
                        {formState.errors.email.message}
                      </p>
                    )}
                  </Field>

                  {/* Password Field */}
                  <Field>
                    <div className="flex w-full items-center justify-between">
                      <FieldLabel>{t("password")}</FieldLabel>
                      <Link href="/auth/forgot-password" className="text-sm text-subtle hover:text-emphasis">
                        {t("forgot")}
                      </Link>
                    </div>
                    <InputGroup className="overflow-hidden">
                      <InputGroupInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...register("password")}
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? t("hide_password") : t("show_password")}>
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                    {formState.errors.password && (
                      <p data-testid="field-error" className="text-destructive-foreground text-xs">
                        {formState.errors.password.message}
                      </p>
                    )}
                  </Field>
                </div>
              )}

              {/* Two Factor */}
              {twoFactorRequired && (
                <div className="space-y-4">
                  {!twoFactorLostAccess ? <TwoFactor center /> : <BackupCode center />}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && <Alert severity="error" title={errorMessage} className="mt-4" />}

              {/* Submit Button */}
              <Button
                type="submit"
                className="mt-8 w-full justify-center border-transparent bg-[#CDF34F] text-[#0E0E1B] hover:bg-[#bfe23e] hover:text-[#0E0E1B]"
                disabled={formState.isSubmitting}>
                {twoFactorRequired ? t("submit") : t("sign_in")}
              </Button>
            </form>

            {/* Two Factor Footer */}
            {twoFactorRequired && (
              <div className="mt-4 flex justify-center gap-4">
                {!totpEmail ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (twoFactorLostAccess) {
                          setTwoFactorLostAccess(false);
                          methods.setValue("backupCode", "");
                        } else {
                          setTwoFactorRequired(false);
                          methods.setValue("totpCode", "");
                        }
                        setErrorMessage(null);
                      }}>
                      <Icon name="arrow-left" className="mr-2 size-4" />
                      {t("go_back")}
                    </Button>
                    {!twoFactorLostAccess && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setTwoFactorLostAccess(true);
                          setErrorMessage(null);
                          methods.setValue("totpCode", "");
                        }}>
                        <Icon name="lock" className="mr-2 size-4" />
                        {t("lost_access")}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      window.location.replace("/");
                    }}>
                    {t("cancel")}
                  </Button>
                )}
              </div>
            )}
          </FormProvider>
        </div>

        {/* Footer Links */}
        {!twoFactorRequired && (
          <div className="mt-6 flex items-center justify-center gap-4 text-center">
            {showSignupLink && (
              <Link
                href={
                  callbackUrl
                    ? `${WEBSITE_URL}/signup?redirect=${encodeURIComponent(callbackUrl)}`
                    : `${WEBSITE_URL}/signup`
                }
                className="text-brand-cream/80 hover:text-brand-cream text-sm font-medium underline-offset-4 hover:underline">
                {t("create_account")}
              </Link>
            )}
          </div>
        )}
      </div>

      <AddToHomescreen />
    </div>
  );
}
