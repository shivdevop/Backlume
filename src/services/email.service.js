import sgMail from "@sendgrid/mail"
import { ENV } from "../config/env.js"

sgMail.setApiKey(ENV.SENDGRID_API_KEY)

export const sendWelcomeEmail=async({email})=>{
    const msg={
        to: email,
        from:ENV.SENDGRID_FROM_EMAIL,
        subject:"Welcome to Backlume",
        text: "Welcome to Backlume! Your account has been created successfully.",
    html: `
      <h2>Welcome to Backlume </h2>
      <p>Your account has been created successfully.</p>
      <p>We're glad to have you onboard.</p>
    `
    }
    await sgMail.send(msg)
}