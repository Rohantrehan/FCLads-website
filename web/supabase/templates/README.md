# Emails

Two kinds of email, both sent through **Resend** (free: 3,000 emails a month, 100 a day).

| Email | Sent by | When |
|---|---|---|
| Confirm your email | Supabase (`confirm-signup.html`) | Someone signs up |
| Reset your password | Supabase (`reset-password.html`) | "Forgot password" |
| Confirm new email / login link | Supabase (`change-email.html`, `magic-link.html`) | Not used by the site yet; branded in case |
| Welcome to FC Lads | The site (`src/lib/email`) | First time someone confirms their email |
| We've got your match | The site | A member sends a match for review |
| A new match to review | The site | Same moment, to the Lad they picked (or every Lad for "any Lad") |
| We need a new link | The site | A Lad can't watch the match |
| New link added | The site | The member fixes the link, to that Lad |
| Your review is ready | The site | A Lad sends the review, with the plan |

Without `RESEND_API_KEY` the site sends nothing and only logs the subject. Test addresses
(`@fclads.test`, `@example.com`, …) are never emailed, even with the key set.

## One-time setup

1. **Resend account**: sign up at resend.com.
2. **Domain**: Resend → Domains → Add your domain (e.g. `fclads.com`) and add the DNS records it
   shows at your domain provider. Until a domain is verified, Resend only delivers to your own email.
3. **API key**: Resend → API Keys → Create (permission "Sending access"). Put it in
   `web/.env.local` and in Vercel → Settings → Environment Variables:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=FC Lads <hello@fclads.com>
   EMAIL_REPLY_TO=support@fclads.com
   ```
   Then redeploy.
4. **Supabase sends through Resend too** (its built-in mailer only allows a few emails an hour):
   Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP:
   - Host `smtp.resend.com`, port `465`, username `resend`, password = the Resend API key
   - Sender email `hello@fclads.com`, sender name `FC Lads`
   Then Authentication → Rate Limits → raise "emails per hour" (e.g. 100).
5. **Templates**: Supabase → Authentication → Emails → Templates. For each one, paste the file's
   whole contents into "Message body" and set the subject:
   | Template | File | Subject |
   |---|---|---|
   | Confirm signup | `confirm-signup.html` | Confirm your FC Lads email |
   | Reset password | `reset-password.html` | Reset your FC Lads password |
   | Change email address | `change-email.html` | Confirm your new FC Lads email |
   | Magic link | `magic-link.html` | Your FC Lads login link |
6. **Redirect URLs**: Supabase → Authentication → URL Configuration → Redirect URLs must include
   `https://fc-lads-website.vercel.app/**` and `http://localhost:3000/**`. The sign-up and reset links
   go through `/auth/confirm` and keep the page the person came from.

The templates use the original green; Supabase can't read the site colour. The site's own emails
follow the colour chosen in Site settings.
