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
  "The trade, learned over years",
  "Customers and relationships",
  "Distribution, and a reason to be trusted",
];
export const WE_BRING = [
  "Forward-deployed engineers and operators",
  "Mycel, the orchestration system that runs the work",
  "Systems already running in our own companies",
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
    body: "We measure each process as it runs today: hours, cost, volume, errors. Then we rank the changes by what each does for margin and price the first build.",
    keeps: "The baseline and the ranked plan, whether or not you go on.",
  },
  {
    key: "build",
    name: "Fixed-scope build",
    form: "Fixed price · six to eight weeks",
    body: "The first one to three automations go into the live work. You see each one running on real work every week. Midway you continue, change the scope, or stop.",
    keeps: "The automations, the measured result, and the runbooks.",
  },
  {
    key: "team",
    name: "Forward-deployed team",
    form: "Monthly retainer",
    body: "Engineers and operators work inside your company and move the next processes onto agents, one function at a time, behind gates your people set.",
    keeps: "Everything we build. Nothing is licensed back to you.",
  },
  {
    key: "operate",
    name: "Back office, operated",
    form: "Profit share · terms set per company",
    body: "We take on the back office and run it on agents, with our operators on the exceptions. We are paid from the profit the change adds, measured against a baseline we agree first.",
    keeps: "A leaner company and a monthly profit report.",
  },
  {
    key: "partner",
    name: "Joint venture",
    form: "Equity or revenue share",
    body: "You bring the trade, the relationships and the distribution. We build the company around you and run the machine. New companies and existing ones.",
    keeps: "A share of a company built to run lean from the start.",
  },
];

export type Fn = { key: string; name: string; phrase: string; body: string };

/** Where the work goes first. `phrase` completes "Most of our team's hours go to …". */
export const FUNCTIONS: Fn[] = [
  {
    key: "requests",
    name: "Requests and service desks",
    phrase: "sorting and answering requests",
    body: "Sorting, routing and answering what comes in, as tickets, emails, claims or calls. Agents draft; a person decides what needs deciding.",
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
    name: "Recruiting and onboarding",
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
    body: "When a contract bills per month, per seat or per project, the hours agents take off the work stay with you.",
  },
  {
    h: "Growth without the same hiring",
    body: "The same team serves more customers, so the next contract no longer waits on the next hire.",
  },
  {
    h: "Bidding against roll-ups",
    body: "Roll-ups rebuild companies like yours around software and bid on the lower cost. With the work automated, you bid where they bid.",
  },
  {
    h: "Room to borrow",
    body: "Lenders lend against cash flow. When the same contracts cost less to deliver, more of it is left to carry a loan.",
  },
  {
    h: "A sale, on your timing",
    body: "Buyers pay for lower costs once they show in a full year of earnings. When a sale, a raise or a loan is the goal, a partner desk runs that work, and the scope says so.",
  },
];

export const STEPS = [
  {
    when: "Weeks 1–2",
    body: "The opportunity assessment. Every process measured as it runs, the changes ranked, the first build priced.",
  },
  {
    when: "Weeks 3–10",
    body: "The first one to three automations built into the live work. You see each one on real work every week.",
  },
  {
    when: "Midway",
    body: "You continue, change the scope or stop, and pay for the work done to that point.",
  },
  {
    when: "End of build",
    body: "The result measured against the baseline. Your team gets the runbooks.",
  },
  {
    when: "After",
    body: "The next functions move onto agents with a forward-deployed team, or we take the back office on for a share of the profit it adds.",
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
    "Purchase orders, receipts and supplier invoices matched by an agent, with the clerk working only the exceptions.",
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
    name: "Agents run it",
    line: "High volume, clear rules, an answer that can be checked against a source. People work the exceptions.",
  },
  {
    key: "approve",
    name: "Agents draft, a person approves",
    line: "Agents do the work end to end and stop at a gate. Nothing goes out until a person signs off.",
  },
  {
    key: "assist",
    name: "People lead, agents assist",
    line: "Judgment, trust and accountability stay with people. Agents prepare the ground.",
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
    name: "Accounts payable",
    tasks: ["Invoice capture", "Three-way match", "Vendor onboarding", "Payment runs prepared"],
    keeps: "Approving payments and settling vendor disputes.",
  },
  {
    key: "receivables",
    level: "run",
    name: "Receivables and billing",
    tasks: [
      "Invoices built from hours or usage",
      "Payment reminders",
      "Collections follow-up",
      "Cash applied to invoices",
    ],
    keeps: "Write-offs and customer escalations.",
    status: "Building",
    proof: "Receivables and agreement billing, each line behind a gate verdict.",
  },
  {
    key: "close",
    level: "run",
    name: "Bookkeeping and close",
    tasks: [
      "Transactions categorised",
      "Bank and card reconciliations",
      "Month-end checklist",
      "Accruals drafted",
    ],
    keeps: "Signing off the close.",
    status: "Building",
    proof: "An accounting platform: US GAAP close, a reconciliation queue, period locks.",
  },
  {
    key: "intake",
    level: "run",
    name: "Document intake and data entry",
    tasks: [
      "Documents classified and read",
      "Fields keyed into the ERP, CRM or loan system",
      "Files renamed and filed",
    ],
    keeps: "Anything the agent is not sure of.",
    status: "Running",
    proof: "New leads become applications in the property system. Document agents in pilot.",
  },
  {
    key: "desk",
    level: "run",
    name: "Inbox and service desk",
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
    proof: "Cleaner assignment and operations, first in a back office moving onto agents.",
  },
  {
    key: "reporting",
    level: "run",
    name: "Recurring reporting",
    tasks: ["Weekly and monthly packs", "KPI commentary", "Client reports"],
    keeps: "What the numbers mean for a decision.",
  },
  {
    key: "research",
    level: "run",
    name: "Research and monitoring",
    tasks: ["Market, regulatory and competitor watch", "Records enriched", "Daily briefs"],
    keeps: "Choosing what to act on.",
    status: "Running",
    proof: "Filings and news read daily, scored, and published as a morning report.",
  },
  {
    key: "sales",
    level: "approve",
    name: "Sales development",
    tasks: [
      "Prospects researched and scored",
      "Outreach drafted per account",
      "Inbound answered in minutes",
      "CRM kept clean",
      "Renewals flagged",
    ],
    keeps: "Every send passes an approval queue. People run the closing conversation.",
    status: "Running",
    proof: "Targeting engines: who to call, why now, who decides.",
  },
  {
    key: "marketing",
    level: "approve",
    name: "Marketing operations",
    tasks: [
      "Content drafted against a source registry",
      "Location and search pages",
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
    name: "Compliance and risk",
    tasks: [
      "Control evidence collected on a schedule",
      "Policies checked",
      "Identity and documents verified",
      "Licences and renewals tracked",
    ],
    keeps: "Attestation and every judgment call.",
  },
  {
    key: "procurement",
    level: "approve",
    name: "Procurement and contracts",
    tasks: [
      "Requests for quote handled",
      "Quotes compared",
      "Purchase orders raised",
      "Contracts read against a playbook",
      "Obligations tracked",
    ],
    keeps: "Negotiation and signature.",
    status: "Building",
    proof: "Vendor discovery: listings found, validated and enriched before outreach.",
  },
  {
    key: "engineering",
    level: "approve",
    name: "IT operations and software delivery",
    tasks: [
      "Access requests",
      "First review of alerts",
      "Patch tickets",
      "Tickets taken to a verified pull request",
    ],
    keeps: "Code review and incident command.",
    status: "Running",
    proof:
      "Agents take a ticket, implement it, verify against the live system, close with evidence.",
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

export type IndustryPack = {
  key: string;
  name: string;
  /** One line for the index rows. */
  start: string;
  tasks: string[];
  /** Function groups that usually come first, by key. */
  first: string[];
  note?: string;
};

// Manny's primer, 2026-11-01. Not a closed list: the test is the last row.
export const INDUSTRY_PACKS: IndustryPack[] = [
  {
    key: "manufacturing",
    name: "Manufacturing",
    start: "Quotes drafted from RFQ emails, orders keyed into the ERP, supplier invoices matched.",
    tasks: [
      "Quotes drafted from each RFQ against past jobs",
      "Orders keyed into the ERP",
      "Supplier invoices matched to POs and receipts",
      "Ship-date updates sent as work moves",
    ],
    first: ["procurement", "intake", "payables"],
  },
  {
    key: "medical",
    name: "Medical practices",
    start: "Intake, scheduling, referral and prior-authorization paperwork.",
    tasks: [
      "Patient intake forms read and filed",
      "Insurance eligibility checked before the visit",
      "Prior-authorization packets assembled",
      "Reminders and rescheduling",
    ],
    first: ["intake", "dispatch", "receivables"],
    note: "Patient data stays inside the practice's own systems.",
  },
  {
    key: "accounting",
    name: "Accounting firms",
    start: "Client document collection, bookkeeping prep, month-end checklists.",
    tasks: [
      "Client documents requested and chased",
      "Bookkeeping prepared for review",
      "Tax organizers filled from source documents",
      "Close checklists run",
    ],
    first: ["intake", "close", "reporting"],
  },
  {
    key: "engineering",
    name: "Engineering firms",
    start: "Proposal assembly, submittal and RFI tracking, project reporting.",
    tasks: [
      "Proposals assembled from past work",
      "Submittals and RFIs logged and chased",
      "Project status reports",
    ],
    first: ["reporting", "intake", "desk"],
  },
  {
    key: "insurance",
    name: "Insurance carriers and brokers",
    start: "Submission intake, quote comparison, renewals, certificate requests.",
    tasks: [
      "Submissions read and keyed",
      "Carrier quotes compared side by side",
      "Certificates of insurance issued on request",
      "Renewals prepared ahead of the date",
      "First notice of loss taken in",
    ],
    first: ["intake", "desk", "sales"],
  },
  {
    key: "mortgage",
    name: "Mortgage lending",
    start: "Document collection, conditions tracking, borrower updates.",
    tasks: [
      "Borrower documents collected and checked",
      "Conditions tracked to clear",
      "Employment and income verifications requested",
      "Borrowers updated at every stage",
    ],
    first: ["intake", "compliance", "desk"],
  },
  {
    key: "realestate",
    name: "Real estate brokerage",
    start: "Lead follow-up, transaction coordination, compliance file review.",
    tasks: [
      "Leads answered and followed up",
      "Transactions coordinated to closing",
      "Compliance files reviewed before audit",
      "Tenant applications into the property system",
    ],
    first: ["sales", "intake", "compliance"],
  },
  {
    key: "msp",
    name: "Managed IT and security",
    start: "Ticket triage, first review of alerts, compliance evidence on a schedule.",
    tasks: [
      "Tickets sorted and routed",
      "First review of alerts, analyst deciding",
      "SOC 2 and ISO evidence pulled on a schedule",
      "New customers onboarded from the signed contract",
    ],
    first: ["desk", "engineering", "compliance"],
  },
  {
    key: "outsourced",
    name: "Anyone with an outsourced back office",
    start: "If you pay a BPO for work that follows a checklist, that work is a candidate.",
    tasks: [
      "The checklist work an outside team does today",
      "Measured first, then moved onto agents",
    ],
    first: ["payables", "receivables", "desk"],
  },
];
