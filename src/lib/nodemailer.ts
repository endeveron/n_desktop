import nodemailer from 'nodemailer';

import { gmailTransportConfig, nodemailerUser } from '@/configs/nodemailer';
import {
  APP_NAME,
  VERIFICATION_EMAIL_BUTTON,
  VERIFICATION_EMAIL_DESCRIPTION,
  VERIFICATION_EMAIL_SUBJECT,
  VERIFICATION_EMAIL_TITLE,
} from '@/translations/en';

export type SendEmailArgs = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

const gmailTransporter = nodemailer.createTransport(gmailTransportConfig);

// See: https://nodemailer.com/message/
export const sendEmail = async (data: SendEmailArgs) => {
  const info = await gmailTransporter.sendMail(data);
  return !!info?.messageId;
};

export const configureVerificationEmail = ({
  email,
  url,
}: {
  email: string;
  url: string;
}): SendEmailArgs => {
  const from = `${APP_NAME} <${nodemailerUser}>`;
  const to = email;
  const subject = VERIFICATION_EMAIL_SUBJECT;

  const html = `
    <div style="font-family:'Verdana',sans-serif;text-align:center;padding:4rem 0;">
      <h1 style="color:#151518;font-size:2rem;font-weight:bold;margin:0;">
        ${VERIFICATION_EMAIL_TITLE}
      </h1>
      <p style="color:#5a5a5a;margin-bottom:2rem;margin-top:1rem;">
        ${VERIFICATION_EMAIL_DESCRIPTION}
      </p>
      <a
        style="background-color:#151518;border-radius:32px;color:#ffffff;display:inline-block;font-family:sans-serif;padding:1rem 2rem;font-size:1rem;text-decoration:none;"
        href="${url}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${VERIFICATION_EMAIL_BUTTON}
      </a>
    </div>
  `;

  return {
    from,
    to,
    subject,
    html,
  };
};
