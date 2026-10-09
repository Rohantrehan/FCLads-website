import { ladsPlus } from "@/data/ladsPlus";

// Legal pages: Terms of Service, Privacy Policy and the Trading disclaimer.
// DRAFT copy written in plain English from the design. Must be reviewed by a lawyer before launch:
// company name, governing law, contact email and the payment / analytics providers are placeholders.

export const LEGAL_UPDATED = "2026-10-01";
export const LEGAL_EMAIL = "hello@fclads.com"; // TODO: confirm the real contact address with the client.

/** A paragraph. `lead` is shown in bold before the text, e.g. "Not financial advice:". */
export interface LegalParagraph {
  type: "p";
  lead?: string;
  text: string;
}

export interface LegalList {
  type: "list";
  items: { lead?: string; text: string }[];
}

/** Highlighted box: "info" (green) for key facts, "warning" (gold) for things people must not miss. */
export interface LegalCallout {
  type: "callout";
  tone: "info" | "warning";
  title: string;
  text: string;
}

export type LegalBlock = LegalParagraph | LegalList | LegalCallout;

export interface LegalSection {
  id: string;
  title: string;
  /** Short name for the table of contents. Defaults to `title`. */
  short?: string;
  blocks: LegalBlock[];
}

export type LegalSlug = "terms" | "privacy" | "trading-disclaimer";

export interface LegalDoc {
  slug: LegalSlug;
  title: string;
  /** Tab label. */
  label: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

const terms: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  label: "Terms of Service",
  description: "The rules for using FC Lads and FC Lads+: accounts, membership, trading content, videos and Discord.",
  intro:
    "Please read these terms before using FC Lads. By browsing the site, creating an account or joining FC Lads+, you agree to them. We've kept them as short and clear as we can.",
  sections: [
    {
      id: "acceptance",
      title: "Accepting these terms",
      blocks: [
        {
          type: "p",
          text: "These terms are an agreement between you and FC Lads (“FC Lads”, “we”, “us”). They cover the FC Lads website, FC Lads+ membership, our videos and our Discord server.",
        },
        {
          type: "p",
          lead: "Independent fan community:",
          text: "FC Lads is not affiliated with, endorsed by or sponsored by Electronic Arts Inc., EA SPORTS FC, or any football club, league or association. Game names, player names and club badges belong to their owners.",
        },
        {
          type: "p",
          text: "If you don't agree with these terms, please don't use FC Lads. We may update them from time to time; if a change is important, we'll tell members by email before it applies.",
        },
      ],
    },
    {
      id: "accounts",
      title: "Your account",
      blocks: [
        {
          type: "p",
          text: "You need an account for FC Lads+ and some community features. You can sign up with email, Google or Discord. You must be at least 13 years old, or the minimum age for online services in your country if that is higher.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Keep it accurate:",
              text: "use your real email address so we can reach you about your account and membership.",
            },
            {
              lead: "Keep it safe:",
              text: "you're responsible for your password and for activity on your account. One account per person; don't share it.",
            },
            {
              lead: "We'll never ask for your EA account:",
              text: "FC Lads will never ask for your EA, PlayStation, Xbox or Steam password, or your backup codes. Anyone who does is not us.",
            },
            {
              lead: "Tell us about problems:",
              text: "if you think someone else has used your account, contact us straight away.",
            },
          ],
        },
      ],
    },
    {
      id: "membership",
      title: "FC Lads+ membership",
      blocks: [
        {
          type: "p",
          text: "FC Lads+ is our paid membership. It unlocks every guide and video collection, the private Discord channels, the weekly trading brief, direct access to the creators and a monthly gameplay review.",
        },
        {
          type: "callout",
          tone: "info",
          title: "Billing",
          text: `FC Lads+ costs ${ladsPlus.priceLabel} (${ladsPlus.currency}) per month, plus any tax that applies where you live. It renews automatically each month until you cancel. You can cancel at any time from your account.`,
        },
        {
          type: "p",
          lead: "Refunds:",
          text: "because you get access to all members' content straight away, payments for a month that has already started aren't refunded, except where the law says they must be. If you've been charged twice or by mistake, contact us within 7 days and we'll sort it out.",
        },
        {
          type: "p",
          lead: "Price changes:",
          text: "if the price changes, we'll email you at least 30 days before your next payment. You can cancel before then if you don't want to continue.",
        },
      ],
    },
    {
      id: "trading",
      title: "Trading content",
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "Our opinions, not guarantees",
          text: "Market notes, buy and sell targets, price forecasts and SBC costs are our opinions about the in-game market. Prices can change quickly, especially after patches and promos.",
        },
        {
          type: "p",
          lead: "Not financial advice:",
          text: "FC coins and cards have no real-world money value. Nothing on FC Lads is financial advice.",
        },
        {
          type: "p",
          lead: "Follow EA's rules:",
          text: "you must follow EA's User Agreement. We don't support buying or selling coins for real money, coin farming bots or exploits, and we don't allow them in our community. Read the full Trading Disclaimer for more.",
        },
      ],
    },
    {
      id: "content",
      title: "Our content and yours",
      blocks: [
        {
          type: "p",
          text: "Our guides, videos, tactics, squads, graphics and brand belong to FC Lads and our creators. You can use them to improve your own game.",
        },
        {
          type: "p",
          lead: "Please don't share paid content:",
          text: "don't copy, re-upload, resell or post FC Lads+ guides, videos or the trading brief anywhere else, and don't scrape the site.",
        },
        {
          type: "p",
          lead: "What you post:",
          text: "you keep ownership of anything you post, like comments, squads or gameplay clips. You give us permission to show it on FC Lads and in our Discord, and, if you send a clip for review, to use it in that review.",
        },
      ],
    },
    {
      id: "reviews",
      title: "Gameplay reviews",
      blocks: [
        {
          type: "p",
          text: "FC Lads+ members get one gameplay review a month: upload a match, then book a 30-minute session where one of the Lads goes through it with you. Sessions are recorded, and you get a written plan afterwards.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Rescheduling:",
              text: "you can move your session up to 12 hours before it starts. If you miss it without telling us, it counts as that month's review.",
            },
            {
              lead: "One a month:",
              text: "unused reviews don't roll over to the next month.",
            },
            {
              lead: "Be respectful:",
              text: "abuse or harassment towards creators or other members can lead to your account being closed.",
            },
          ],
        },
      ],
    },
    {
      id: "third-parties",
      title: "Discord, YouTube and other services",
      short: "Discord & other services",
      blocks: [
        {
          type: "p",
          text: "Some of FC Lads runs on other services: our Discord server, YouTube and Loom for videos, and our payment provider for billing. Those services have their own terms and privacy policies, and we can't control them.",
        },
        {
          type: "p",
          text: "In our Discord server you must follow the server rules and Discord's own rules. Moderators can mute or remove anyone who breaks them, including for spam or selling coins.",
        },
      ],
    },
    {
      id: "liability",
      title: "Limits of our responsibility",
      short: "Limits of responsibility",
      blocks: [
        {
          type: "p",
          text: "We work hard to keep FC Lads accurate and online, but we provide it “as is”. We can't promise it will always be available, error-free, or that our advice will win you games or coins.",
        },
        {
          type: "p",
          lead: "Game updates:",
          text: "EA changes the game regularly. We aren't responsible for losses caused by patches, meta changes or price drops.",
        },
        {
          type: "p",
          text: "As far as the law allows, we aren't liable for indirect losses. Nothing in these terms limits rights you have under consumer law that can't be excluded.",
        },
      ],
    },
    {
      id: "cancellation",
      title: "Cancelling and closing accounts",
      short: "Cancelling",
      blocks: [
        {
          type: "p",
          text: "You can cancel FC Lads+ at any time in Account > Membership & billing. You'll keep your membership until the end of the month you've paid for. You can also ask us to delete your account.",
        },
        {
          type: "p",
          text: "We may suspend or close accounts that break these terms, for example by sharing paid content, abusing other members, or trying to break into the site. If we close your account without a good reason, we'll refund any unused part of your membership.",
        },
      ],
    },
    {
      id: "law",
      title: "Governing law and disputes",
      short: "Governing law",
      blocks: [
        {
          type: "p",
          text: "These terms are governed by the laws of England and Wales. If you live elsewhere, you still keep any consumer rights your local law gives you.",
        },
        {
          type: "p",
          lead: "Talk to us first:",
          text: "if something goes wrong, please contact us so we can try to fix it. Most problems can be solved quickly by email.",
        },
      ],
    },
  ],
};

const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  label: "Privacy Policy",
  description: "What personal data FC Lads collects, why, who we share it with, and how to access or delete it.",
  intro:
    "This policy explains what information we collect when you use FC Lads, why we need it and the choices you have. We only collect what we need to run the site and your membership, and we never sell your data.",
  sections: [
    {
      id: "collect",
      title: "What we collect",
      blocks: [
        {
          type: "list",
          items: [
            {
              lead: "Account details:",
              text: "your name, email address and password (stored encrypted). If you sign in with Google or Discord, we receive your name, email and profile picture from them.",
            },
            {
              lead: "Membership:",
              text: "your plan, payment dates and billing country. Card details are handled by our payment provider; we never see or store your full card number.",
            },
            {
              lead: "What you send us:",
              text: "messages, comments, squads, match clips you upload for a gameplay review, and recordings of your review sessions.",
            },
            {
              lead: "How you use the site:",
              text: "pages visited, device and browser type, and rough location (country), so we can fix problems and improve FC Lads.",
            },
          ],
        },
      ],
    },
    {
      id: "use",
      title: "How we use it",
      blocks: [
        {
          type: "list",
          items: [
            { text: "To run your account and give FC Lads+ members access to their content." },
            { text: "To take payments and send receipts and important account emails." },
            { text: "To create your gameplay reviews." },
            { text: "To keep the site and community safe, and stop fraud and abuse." },
            { text: "To understand which guides and features are useful, so we can make better ones." },
            {
              text: "To send you news and new guides by email, only if you've agreed. You can unsubscribe from any email.",
            },
          ],
        },
      ],
    },
    {
      id: "sharing",
      title: "Who we share it with",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "We never sell your data",
          text: "We only share information with services that help us run FC Lads, and only what they need.",
        },
        {
          type: "list",
          items: [
            { lead: "Payments:", text: "our payment provider, to take membership payments." },
            { lead: "Hosting and email:", text: "the companies that host the site and send our emails." },
            {
              lead: "Video:",
              text: "YouTube and Loom, when you press play on a video. Videos don't load (or set cookies) until you press play.",
            },
            { lead: "Sign-in:", text: "Google or Discord, if you choose to sign in with them." },
            { lead: "The law:", text: "if we're legally required to, or to protect people from harm." },
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      blocks: [
        {
          type: "p",
          text: "We use essential cookies to keep you logged in and remember your settings. We only use analytics cookies if you agree to them, and you can change your choice at any time.",
        },
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      blocks: [
        {
          type: "p",
          text: "We keep your account details while your account is open. If you delete your account, we delete your personal data within 30 days, except billing records we must keep for tax reasons (usually 6 years). Match clips and session recordings are deleted 90 days after your review.",
        },
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      blocks: [
        {
          type: "p",
          text: "You can ask us to show you the data we hold about you, correct it, delete it, or send you a copy. You can also object to how we use it or withdraw your consent for emails and analytics.",
        },
        {
          type: "p",
          text: "Email us to make a request; we'll reply within 30 days. If you're unhappy with how we handle your data, you can complain to your local data protection authority (in the UK, the ICO).",
        },
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        {
          type: "p",
          text: "FC Lads isn't for children under 13 and we don't knowingly collect their data. If you think a child has given us their information, contact us and we'll delete it.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "If we make important changes, we'll update the date at the top of this page and tell members by email.",
        },
      ],
    },
  ],
};

const tradingDisclaimer: LegalDoc = {
  slug: "trading-disclaimer",
  title: "Trading Disclaimer",
  label: "Trading Disclaimer",
  description: "FC Lads trading content is opinion about the in-game market, not financial advice. Read the risks.",
  intro:
    "Our trading content helps you make coins on the Ultimate Team transfer market. Please read this before acting on any market note, target or forecast.",
  sections: [
    {
      id: "opinion",
      title: "Opinions, not guarantees",
      blocks: [
        {
          type: "p",
          text: "Market notes, buy and sell targets, price charts, forecasts and SBC costs are our opinions, based on what we see in the market. They can be wrong.",
        },
        {
          type: "callout",
          tone: "warning",
          title: "Prices can change quickly",
          text: "Patches, promos, SBCs and content drops can move prices within minutes. Past results don't guarantee future ones. Only trade with coins you're happy to risk.",
        },
      ],
    },
    {
      id: "not-financial",
      title: "Not financial advice",
      blocks: [
        {
          type: "p",
          text: "FC coins, cards and packs are part of the game and have no real-world money value. Nothing on FC Lads is financial, investment or betting advice.",
        },
      ],
    },
    {
      id: "ea-rules",
      title: "Follow EA's rules",
      blocks: [
        {
          type: "list",
          items: [
            {
              text: "Never buy or sell coins, cards or accounts for real money. It breaks EA's User Agreement and can get you banned.",
            },
            { text: "Never use bots, autobuyers or exploits." },
            { text: "Never share your EA account or login with anyone, including people claiming to be from FC Lads." },
          ],
        },
      ],
    },
    {
      id: "data",
      title: "Prices and data",
      blocks: [
        {
          type: "p",
          text: "Prices shown on FC Lads may be delayed or differ between platforms. Always check the live price in the game before you buy or sell. The 5% EA tax applies to every sale on the transfer market.",
        },
      ],
    },
    {
      id: "responsibility",
      title: "Your decisions",
      blocks: [
        {
          type: "p",
          text: "Every trade you make is your choice. FC Lads isn't responsible for coins lost from trades, price drops or game updates.",
        },
      ],
    },
  ],
};

export const legalDocs: LegalDoc[] = [terms, privacy, tradingDisclaimer];

export function getLegalDoc(slug: string) {
  return legalDocs.find((doc) => doc.slug === slug);
}
