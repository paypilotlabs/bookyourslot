import { APP_NAME, SENDER_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import type { TFunction } from "i18next";
import { BaseEmailHtml, CallToAction } from "../components";

export type AccountApproved = {
  language: TFunction;
  user: {
    name?: string | null;
    email: string;
  };
  loginLink: string;
};

export const AccountApprovedEmail = (
  props: AccountApproved & Partial<React.ComponentProps<typeof BaseEmailHtml>>
) => {
  return (
    <BaseEmailHtml subject={props.language("account_approved_subject", { appName: APP_NAME })}>
      <p
        style={{
          fontWeight: 600,
          fontSize: "32px",
          lineHeight: "38px",
        }}>
        <>{props.language("account_approved_email_header")}</>
      </p>
      <p style={{ fontWeight: 400 }}>
        <>{props.language("hi_user_name", { name: props.user.name })}!</>
      </p>
      <p style={{ fontWeight: 400, lineHeight: "24px" }}>
        <>{props.language("account_approved_email_body", { appName: APP_NAME })}</>
      </p>
      <CallToAction label={props.language("account_approved_button")} href={props.loginLink} />

      <div style={{ lineHeight: "6px" }}>
        <p style={{ fontWeight: 400, lineHeight: "24px" }}>
          <>{props.language("account_approved_email_link_text")}</>
          <br />
          <a href={props.loginLink}>{props.loginLink}</a>
        </p>
      </div>
      <div style={{ lineHeight: "6px" }}>
        <p style={{ fontWeight: 400, lineHeight: "24px" }}>
          <>
            {props.language("happy_scheduling")}, <br />
            <a
              href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
              style={{ color: "#3E3E3E" }}
              target="_blank"
              rel="noreferrer">
              <>{props.language("the_calcom_team", { companyName: SENDER_NAME })}</>
            </a>
          </>
        </p>
      </div>
    </BaseEmailHtml>
  );
};
