import { Logo } from "@calcom/ui/components/logo";
import Loader from "@components/Loader";
import classNames from "classnames";

interface Props {
  footerText?: React.ReactNode | string;
  showLogo?: boolean;
  heading?: string;
  loading?: boolean;
}

/**
 * Shared shell for the secondary auth screens (forgot password, reset password,
 * logout). It mirrors the login view on purpose: same navy ground and lime
 * glow, same max-w-md column, same card radius, padding and shadow, so moving
 * between auth screens has no visual jump.
 */
export default function AuthContainer(props: React.PropsWithChildren<Props>) {
  return (
    <div className="bg-brand-navy relative flex min-h-screen items-center justify-center px-4 py-10 [--cal-brand-emphasis:#bfe23e] [--cal-brand-text:#0E0E1B] [--cal-brand:#CDF34F] dark:[--cal-brand-emphasis:#bfe23e] dark:[--cal-brand-text:#0E0E1B] dark:[--cal-brand:#CDF34F]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-brand-lime/20 absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
      </div>

      {props.loading && (
        <div className="bg-cal-muted absolute z-50 flex h-screen w-full items-center">
          <Loader />
        </div>
      )}

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Auth pages have no theme provider, so app tokens resolve to light:
            the card is white with dark text for every visitor. A deliberate,
            consistent look on the navy brand ground. */}
        <div className="bg-default border-subtle w-full rounded-2xl border p-10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)]">
          {props.showLogo && (
            <div className="mb-2 flex justify-center">
              <Logo inline={false} />
            </div>
          )}

          {props.heading && (
            <h2
              className={classNames(
                "text-emphasis text-center font-cal text-2xl",
                props.showLogo ? "mb-8 mt-2" : "mb-8"
              )}>
              {props.heading}
            </h2>
          )}

          {props.children}
        </div>

        {/* Sits on the navy ground, so it needs cream rather than the app's
            default ink, which would be unreadable here. */}
        {props.footerText && (
          <div className="text-brand-cream/70 mt-8 text-center text-sm">{props.footerText}</div>
        )}
      </div>
    </div>
  );
}
