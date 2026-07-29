import { APP_NAME, COMPANY_NAME, EMAIL_FROM_NAME } from "@calcom/lib/constants";
import type { TFunction } from "i18next";
import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";

export type AccountApproved = {
  language: TFunction;
  user: {
    name?: string | null;
    email: string;
  };
  loginLink: string;
};

export default class AccountApprovedEmail extends BaseEmail {
  accountApprovedInput: AccountApproved;

  constructor(accountApprovedEvent: AccountApproved) {
    super();
    this.name = "SEND_ACCOUNT_APPROVED_EMAIL";
    this.accountApprovedInput = accountApprovedEvent;
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    return {
      to: `${this.accountApprovedInput.user.name} <${this.accountApprovedInput.user.email}>`,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      subject: this.accountApprovedInput.language("account_approved_subject", {
        appName: APP_NAME,
      }),
      html: await renderEmail("AccountApprovedEmail", this.accountApprovedInput),
      text: this.getTextBody(),
    };
  }

  protected getTextBody(): string {
    return `
${this.accountApprovedInput.language("account_approved_subject", { appName: APP_NAME })}
${this.accountApprovedInput.language("account_approved_email_header")}
${this.accountApprovedInput.language("hi_user_name", { name: this.accountApprovedInput.user.name })},
${this.accountApprovedInput.language("account_approved_email_body", { appName: APP_NAME })}
${this.accountApprovedInput.language("account_approved_email_link_text")}
${this.accountApprovedInput.loginLink}
${this.accountApprovedInput.language("happy_scheduling")} ${this.accountApprovedInput.language(
      "the_calcom_team",
      { companyName: COMPANY_NAME }
    )}
`.replace(/(<([^>]+)>)/gi, "");
  }
}
