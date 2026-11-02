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

export type Industry = { name: string; start: string };

// Manny's primer, 2026-11-01. Not a closed list: the test is the last row.
export const INDUSTRIES: Industry[] = [
  {
    name: "Manufacturing",
    start: "Quotes drafted from RFQ emails, orders keyed into the ERP, supplier invoices matched.",
  },
  {
    name: "Medical practices",
    start: "Intake, scheduling, referral and prior-authorization paperwork.",
  },
  {
    name: "Accounting firms",
    start: "Client document collection, bookkeeping prep, month-end checklists.",
  },
  {
    name: "Engineering firms",
    start: "Proposal assembly, submittal and RFI tracking, project reporting.",
  },
  {
    name: "Insurance carriers and brokers",
    start: "Submission intake, quote comparison, renewals, certificate requests.",
  },
  {
    name: "Mortgage lending",
    start: "Document collection, conditions tracking, borrower updates.",
  },
  {
    name: "Real estate brokerage",
    start: "Lead follow-up, transaction coordination, compliance file review.",
  },
  {
    name: "Managed IT and security",
    start: "Ticket triage, first review of alerts, compliance evidence on a schedule.",
  },
  {
    name: "Anyone with an outsourced back office",
    start: "If you pay a BPO for work that follows a checklist, that work is a candidate.",
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
