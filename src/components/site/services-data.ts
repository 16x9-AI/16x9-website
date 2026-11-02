import type { Status } from "@/components/site/Board";

// What 16x9 offers, single-sourced for the homepage and /services so the two
// can never drift. Product truth is in PRODUCT.md; copy rules in VOICE.md.
//
// Transferred 2026-11-01 from Frontier Desk's operating work (offer spec v3,
// Team Reference v2, the FDO GTM draft). Exits, lending, data licensing and
// capital placement stay with that desk and are referred out, unnamed.
// No prices on the site: each engagement names its form, never a figure.

export const MAIL = "info@16x9.ai";

export function mailto(subject: string) {
  return `mailto:${MAIL}?subject=${encodeURIComponent(subject)}`;
}

/** The partnership, both sides. The hero sets these against each other. */
export const THEY_BRING = [
  "Years of knowing how the business works",
  "The customers, and their trust",
  "A way to reach more of them",
];
export const WE_BRING = [
  "Engineers and operators who work inside the company",
  "Mycel, the system we built to run AI at work",
  "Tools already running in our own companies",
];

export type Engagement = {
  key: string;
  name: string;
  /** How it is paid and how long it takes. Shape only, never a figure. */
  form: string;
  body: string;
  /** What the company holds at the end. */
  keeps: string;
};

// Ordered by how much of the company we take on, which is why the order is shown.
export const ENGAGEMENTS: Engagement[] = [
  {
    key: "assess",
    name: "Opportunity assessment",
    form: "Fixed fee · about two weeks",
    body: "We sit with your team and measure where the hours go: how long each task takes, what it costs, how often it goes wrong. Then we list what AI can take on, biggest saving first, and price the first piece.",
    keeps: "The measurements and the plan, whether or not you go on.",
  },
  {
    key: "build",
    name: "Fixed-scope build",
    form: "Fixed price · six to eight weeks",
    body: "We set up AI on the first one to three tasks, inside your real daily work. You watch it run every week. Halfway through you decide: keep going, change course, or stop.",
    keeps:
      "The working setup, a before-and-after measurement, and written instructions for your team.",
  },
  {
    key: "team",
    name: "Our team inside yours",
    form: "Monthly retainer",
    body: "Our engineers and operators work inside your company and move one task after another onto AI. Your people decide what needs their sign-off.",
    keeps: "Everything we build. You do not rent it back from us.",
  },
  {
    key: "operate",
    name: "We run the back office",
    form: "Profit share · terms set per company",
    body: "We take over the back office and run it with AI, with our own people handling anything unusual. We agree today's numbers first, and we are paid from the extra profit after that.",
    keeps: "A leaner company and a monthly profit report.",
  },
  {
    key: "partner",
    name: "Joint venture",
    form: "Equity or revenue share",
    body: "You bring the know-how, the customers and a way to reach more of them. We build and run everything behind the scenes. For new companies and existing ones.",
    keeps: "A share of a company that needs far fewer people to run.",
  },
];

export type Fn = { key: string; name: string; phrase: string; body: string };

/** Where the work goes first. `phrase` completes "Most of our team's hours go to …". */
export const FUNCTIONS: Fn[] = [
  {
    key: "requests",
    name: "Requests and service desks",
    phrase: "sorting and answering requests",
    body: "Sorting and answering what comes in by email, phone, ticket or form. AI drafts the answer; a person decides anything that needs deciding.",
  },
  {
    key: "documents",
    name: "Document review",
    phrase: "reviewing documents",
    body: "Reading contracts, claims, invoices or compliance evidence against a checklist, and flagging what a person needs to decide.",
  },
  {
    key: "scheduling",
    name: "Scheduling and dispatch",
    phrase: "scheduling and dispatch",
    body: "Booking jobs, assigning crews or drivers, and updating customers as the work moves.",
  },
  {
    key: "finance",
    name: "Finance and billing",
    phrase: "billing, payables and collections",
    body: "Matching hours or usage to invoices, paying suppliers, chasing receivables, closing the month.",
  },
  {
    key: "reporting",
    name: "Reporting",
    phrase: "putting reports together",
    body: "The weekly and monthly reports your team assembles by hand for customers or management.",
  },
  {
    key: "sales",
    name: "Sales follow-up",
    phrase: "following up leads and renewals",
    body: "Working the lead list, answering inbound fast, and keeping renewals from lapsing. Every send goes through an approval queue.",
  },
  {
    key: "people",
    name: "Hiring and onboarding",
    phrase: "hiring and onboarding",
    body: "Screening applicants against the role, scheduling interviews, and running onboarding from the signed offer.",
  },
];

export type Billing = { key: string; phrase: string; note: string };

/** How the contracts bill decides whether the saving stays with the company. */
export const BILLING: Billing[] = [
  {
    key: "fixed",
    phrase: "per user, device or month",
    note: "Every hour software takes off this work stays with you as margin, because the price of each contract does not move.",
  },
  {
    key: "project",
    phrase: "a fixed price per project",
    note: "The saving shows in the margin on each project you price after the change, and gives you room to bid lower when you choose to.",
  },
  {
    key: "hourly",
    phrase: "by the hour",
    note: "The saving passes to your customers as fewer billed hours unless the contracts change, so the assessment looks at how you bill as well as the work.",
  },
  {
    key: "mixed",
    phrase: "in a mix of ways",
    note: "The assessment splits the saving by how each contract bills, so you see how much of it stays with you.",
  },
];

/** What the change does for the company, beyond the cost line. */
export const OUTCOMES = [
  {
    h: "Margin on fixed-price work",
    body: "If you charge a fixed price per month or per project, every hour AI saves is money you keep.",
  },
  {
    h: "Growth without the same hiring",
    body: "The same team serves more customers, so the next contract no longer waits on the next hire.",
  },
  {
    h: "Competing with bigger players",
    body: "Investor-backed groups are buying companies like yours, cutting costs with software and underbidding you. With the same tools, you can bid where they bid.",
  },
  {
    h: "Room to borrow",
    body: "Banks lend against cash flow. When the same work costs less to deliver, there is more cash to support a loan.",
  },
  {
    h: "A sale, on your timing",
    body: "Buyers pay more once lower costs show up in a full year of results. If selling, raising money or borrowing is the goal, a partner firm handles that side, and we say so up front.",
  },
];

export const STEPS = [
  {
    when: "Weeks 1–2",
    body: "The assessment. We measure how the work runs today, list what AI can take on, and price the first piece.",
  },
  {
    when: "Weeks 3–10",
    body: "AI set up on the first one to three tasks, inside your real work. You see it run every week.",
  },
  {
    when: "Midway",
    body: "You continue, change the scope or stop, and pay for the work done to that point.",
  },
  {
    when: "End of build",
    body: "We measure again and compare with where you started. Your team gets written instructions.",
  },
  {
    when: "After",
    body: "Our team moves more tasks onto AI, or we take over the back office for a share of the extra profit.",
  },
];

/** The sample. Made up, labelled at the top. Every number is an input, never a result. */
export const SAMPLE = {
  label: "A made-up company, to show what a build plan contains.",
  company:
    "A precision-parts manufacturer with about 60 staff and $10M in revenue. Orders arrive by email and phone, the ERP dates from 2009, and supplier invoices are matched by hand. The owner wants to take on more customers without adding another estimator.",
  measured: [
    "Estimator hours per quote, by part family",
    "Minutes to key an order into the ERP",
    "Invoices matched per clerk-day, and the exception rate",
    "Days to close the month",
  ],
  build: [
    "Quotes drafted from each RFQ email against past jobs and current material prices, with an estimator approving every one.",
    "Purchase orders, delivery receipts and supplier invoices matched by AI, with the clerk handling only the ones that do not match.",
    "Order confirmations and ship-date updates sent to customers as the work moves through the floor.",
  ],
  result:
    "Cost and turnaround per quote and per order, before and after, with the method and the records behind it. The owner prices the next bids from it.",
};

// ---------------------------------------------------------------------------
// The function catalogue (/services/functions). Ranked by five tests, not by
// a percentage: volume, rules, digital inputs, checkable output, and a gate
// before harm. Research basis and date are in the vault, CHG-537-cc addendum
// (Anthropic Economic Index, McKinsey State of AI 2026, Microsoft "Working with
// AI", Stanford WORKBank, OpenAI GDPval). No automation percentage is published.
//
// `status` reuses the audited board vocabulary from routes/index.tsx (Q3 2026)
// and is set only where a board row backs it; `proof` names that row. Change
// the board and this together.

export type LevelKey = "run" | "approve" | "assist";

export const LEVELS: { key: LevelKey; name: string; line: string }[] = [
  {
    key: "run",
    name: "AI does it, your people check",
    line: "Work that repeats all day, follows clear rules, and can be checked against a source. AI does it. Your people handle anything unusual.",
  },
  {
    key: "approve",
    name: "AI does it, a person signs off",
    line: "AI does the whole job and stops before anything goes out. A person reads it and signs off.",
  },
  {
    key: "assist",
    name: "Your people lead, AI helps",
    line: "Decisions that need judgment, trust or accountability stay with people. AI gets the information ready.",
  },
];

export type FunctionGroup = {
  key: string;
  level: LevelKey;
  name: string;
  tasks: string[];
  keeps: string;
  status?: Status;
  proof?: string;
};

export const FUNCTION_GROUPS: FunctionGroup[] = [
  {
    key: "payables",
    level: "run",
    name: "Paying bills (accounts payable)",
    tasks: [
      "Bills read as they arrive",
      "Each bill matched to its purchase order and delivery",
      "Vendor onboarding",
      "Payments lined up for approval",
    ],
    keeps: "Approving payments and settling vendor disputes.",
  },
  {
    key: "receivables",
    level: "run",
    name: "Billing and collecting (receivables)",
    tasks: [
      "Invoices built from hours or usage",
      "Payment reminders",
      "Collections follow-up",
      "Payments matched to the right invoice",
      "Claims coded and submitted to payers",
    ],
    keeps: "Write-offs and customer escalations.",
    status: "Building",
    proof: "Receivables and agreement billing, each line behind a gate verdict.",
  },
  {
    key: "close",
    level: "run",
    name: "Bookkeeping and month-end close",
    tasks: [
      "Every transaction put in the right account",
      "Bank and card reconciliations",
      "Month-end checklist",
      "Month-end adjusting entries drafted",
    ],
    keeps: "Signing off the close.",
    status: "Building",
    proof: "An accounting platform: US GAAP close, a reconciliation queue, period locks.",
  },
  {
    key: "intake",
    level: "run",
    name: "Paperwork and data entry",
    tasks: [
      "Documents classified and read",
      "Fields keyed into the ERP, CRM or loan system",
      "Files renamed and filed",
    ],
    keeps: "Anything the agent is not sure of.",
    status: "Running",
    proof:
      "New leads become applications in the property system. AI that reads and files documents is in pilot.",
  },
  {
    key: "desk",
    level: "run",
    name: "Inbox and customer questions",
    tasks: [
      "Requests sorted and routed",
      "Replies drafted",
      "Status updates sent",
      "Common questions answered",
    ],
    keeps: "Anything off script or sensitive.",
  },
  {
    key: "dispatch",
    level: "run",
    name: "Scheduling and dispatch",
    tasks: [
      "Bookings and reminders",
      "Rescheduling",
      "Crews and drivers assigned",
      "Customers updated as work moves",
    ],
    keeps: "Conflicts and priorities.",
    status: "Building",
    proof: "Assigning cleaners to jobs, the first part of a back office moving onto AI.",
  },
  {
    key: "reporting",
    level: "run",
    name: "Weekly and monthly reports",
    tasks: ["Weekly and monthly packs", "A plain summary of what moved and why", "Client reports"],
    keeps: "What the numbers mean for a decision.",
  },
  {
    key: "research",
    level: "run",
    name: "Research and keeping watch",
    tasks: [
      "Market, regulatory and competitor watch",
      "Contact and company records filled in",
      "Daily briefs",
    ],
    keeps: "Choosing what to act on.",
    status: "Running",
    proof: "Filings and news read daily, scored, and published as a morning report.",
  },
  {
    key: "sales",
    level: "approve",
    name: "Finding and following up with customers",
    tasks: [
      "Likely customers found and ranked",
      "Outreach drafted per account",
      "Inbound answered in minutes",
      "Customer records kept up to date",
      "Renewals flagged",
    ],
    keeps: "Every send passes an approval queue. People run the closing conversation.",
    status: "Running",
    proof: "Targeting engines: who to call, why now, who decides.",
  },
  {
    key: "marketing",
    level: "approve",
    name: "Marketing",
    tasks: [
      "Articles drafted, every claim backed by a source",
      "Pages that help people find you on Google",
      "Campaign reports",
      "Social posts scheduled",
    ],
    keeps: "Brand voice and the final approval.",
    status: "Running",
    proof: "A content engine whose gate blocks unsourced claims before anything publishes.",
  },
  {
    key: "recruiting",
    level: "approve",
    name: "Recruiting and onboarding",
    tasks: [
      "Candidates sourced",
      "Applicants screened against the role",
      "Interviews scheduled",
      "Onboarding paperwork run",
    ],
    keeps: "The hiring decision.",
  },
  {
    key: "compliance",
    level: "approve",
    name: "Compliance paperwork",
    tasks: [
      "Audit evidence collected on a schedule",
      "Policies checked",
      "Identity and documents verified",
      "Licences and renewals tracked",
      "Sales and income tax filings prepared across states",
    ],
    keeps: "Attestation and every judgment call.",
  },
  {
    key: "procurement",
    level: "approve",
    name: "Buying from suppliers",
    tasks: [
      "Quote requests sent to suppliers",
      "Quotes compared",
      "Purchase orders raised",
      "Invoices checked against negotiated terms to recover overpayments",
    ],
    keeps: "Negotiation and signature.",
    status: "Building",
    proof: "Vendor discovery: listings found, validated and enriched before outreach.",
  },
  {
    key: "legal",
    level: "approve",
    name: "Contracts and filings",
    tasks: [
      "NDAs and standard contracts drafted",
      "Contracts checked against your standard terms",
      "Regulatory filings prepared",
      "Obligations and renewal dates tracked",
    ],
    keeps: "A lawyer approves anything that leaves the company.",
  },
  {
    key: "engineering",
    level: "approve",
    name: "IT support and software",
    tasks: [
      "Updates installed and systems watched",
      "User accounts provisioned and removed",
      "Access requests",
      "Security alerts reviewed first",
      "Update tickets closed",
      "Software changes built, tested and sent for review",
    ],
    keeps: "Code review and incident command.",
    status: "Running",
    proof:
      "A request comes in, the change is built and tested against the live system, and a person reviews it.",
  },
];

/** What we do not automate, said plainly. */
export const PEOPLE_LEAD = [
  "Strategy and pricing",
  "Negotiation",
  "Relationship selling",
  "Hiring and letting people go",
  "Clinical and legal judgment",
  "Crisis response",
];

/**
 * Questions owners ask before a first call. Shown on the page and mirrored as FAQPage data, so
 * answer engines can quote them. Every answer restates the offer above; nothing new is promised.
 */
export function faqItems(industry?: { name: string; note?: string }) {
  const who = industry ? industry.name.toLowerCase() : "your business";
  return [
    {
      q: "Will this replace my staff?",
      a: "It takes over the repetitive part of their week: the forms, the follow-up, the matching and the reports. Most owners use that time to serve more customers without hiring at the same pace. Who you employ stays your decision.",
    },
    {
      q: "Is our data safe?",
      a: `Before any work starts, a written agreement says what we can access and who can see it. Every step the AI takes is logged.${industry?.note ? ` ${industry.note}` : ""}`,
    },
    {
      q: "How long before something is running?",
      a: "The assessment takes about two weeks. The first tasks then run inside your real work within six to eight weeks, and halfway through you decide whether to continue.",
    },
    {
      q: "What does it cost?",
      a: "It depends on the work. The assessment is a fixed fee agreed before we start. After that you choose a fixed price for a build, a monthly retainer, or paying us from the extra profit.",
    },
    {
      q: "Do we have to change our software?",
      a: `Usually not. We work with the systems ${who === "your business" ? "you" : who} already use.`,
    },
    {
      q: "What if the AI gets something wrong?",
      a: "Anything that goes to a customer, a regulator or your books is checked by a person first, and every step is logged so a mistake can be traced and fixed.",
    },
  ];
}
