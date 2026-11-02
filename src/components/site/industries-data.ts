// One page per industry (/industries/$slug). Written for the owner or manager of that kind of
// business, in the words they use at work. Plain and literal: their trade's own terms are fine,
// ours are not (no "agents", "orchestration", "forward-deployed" on these pages).
//
// The list follows Manny's primer (2026-11-01) and the sectors Frontier Desk maps, adapted for
// 16x9. `picture` is the one comparison per page: a role this business already understands.
// `measure` is what the assessment measures. Never a promised result.
// `proof` is set only where an audited board row (routes/index.tsx, Q3 2026) backs it.

import type { Status } from "@/components/site/Board";

export type IndustryGroup =
  "Money and advice" | "Health" | "Property" | "Professional firms" | "Operations";

export const INDUSTRY_GROUPS: IndustryGroup[] = [
  "Money and advice",
  "Health",
  "Property",
  "Professional firms",
  "Operations",
];

export type IndustryPack = {
  key: string;
  name: string;
  group: IndustryGroup;
  /** One line for index rows. */
  start: string;
  /** The page headline, in the reader's words. */
  headline: string;
  lede: string;
  /** The one comparison: a role the reader already pays for. */
  picture: string;
  /** What eats the team's week, in their lingo. */
  chores: string[];
  /** What the AI takes on. */
  tasks: string[];
  /** Who signs off, in their titles. */
  keeps: string;
  /** What the assessment measures. */
  measure: string[];
  /** Function groups that usually come first (keys in services-data FUNCTION_GROUPS). */
  first: string[];
  proof?: { status: Status; text: string };
  note?: string;
};

export const INDUSTRY_PACKS: IndustryPack[] = [
  // ---------------------------------------------------------------- Money and advice
  {
    key: "accounting",
    name: "Accounting and tax firms",
    group: "Money and advice",
    start: "Client document chasing, bookkeeping prep, reconciliations, tax organizers.",
    headline: "Get through busy season without hiring another staff accountant.",
    lede: "Most of a firm's hours go to work that comes before the real work: chasing clients for documents, keying them in, tying out balances. The AI does that prep. Your CPAs review it and sign.",
    picture:
      "Think of a first-year staff accountant who never quits, preps every file the same way, and drops each workpaper in your review queue.",
    chores: [
      "Emailing clients three times for the same bank statement",
      "Keying W-2s, 1099s and K-1s into the tax software",
      "Bank and credit card reconciliations every month",
      "Building the PBC list and checking off what came in",
      "Month-end close checklists for bookkeeping clients",
    ],
    tasks: [
      "Requests and reminders sent to clients until the documents arrive",
      "Source documents read and keyed into the tax or bookkeeping software",
      "Bank and card reconciliations prepared, with differences flagged",
      "Tax organizers filled in from last year's return and this year's documents",
      "Multi-state filings prepared for review",
    ],
    keeps: "A CPA reviews every return and reconciliation. A partner signs.",
    measure: [
      "Hours per return, by return type",
      "Days from first request to a complete file",
      "Hours per bookkeeping client per month",
      "Days to close the month",
    ],
    first: ["intake", "close", "compliance"],
  },
  {
    key: "capital-advisory",
    name: "Capital advisory firms",
    group: "Money and advice",
    start: "Buyer lists, teasers and CIM first drafts, data room upkeep, deal follow-up.",
    headline: "Run more mandates with the same deal team.",
    lede: "M&A, debt and real-estate advisers spend most of an engagement on analyst work: building buyer lists, formatting the CIM, chasing NDAs, keeping the data room in order. The AI does that work. Your bankers keep the relationships and the judgment.",
    picture:
      "Think of an analyst who has read every filing and deal announcement in your sector, builds the buyer list overnight, and never loses an NDA.",
    chores: [
      "Building and scrubbing buyer and lender lists",
      "First drafts of teasers, CIMs and lender presentations",
      "Sending NDAs and tracking who signed",
      "Keeping the data room organised and answering the same questions twice",
      "Logging every call and email in the CRM",
    ],
    tasks: [
      "Buyer and lender lists built from filings, deal history and stated strategy",
      "Teaser and CIM first drafts from the client's financials and your template",
      "NDA tracking, reminders and follow-up",
      "Data room indexed, with a running log of buyer questions and answers",
      "Call notes and next steps written into the CRM",
    ],
    keeps: "Bankers own the client, the pricing view and every conversation with a buyer.",
    measure: [
      "Analyst hours per CIM",
      "Days from engagement letter to launch",
      "Buyers contacted per mandate",
      "Hours spent on data room questions",
    ],
    first: ["research", "sales", "reporting"],
    proof: {
      status: "Running",
      text: "In our own advisory work: filings and news read daily, scored for credibility, and checked against what actually happened.",
    },
  },
  {
    key: "wealth",
    name: "Wealth management firms",
    group: "Money and advice",
    start: "Meeting prep, new-account paperwork, transfers, CRM notes, client reviews.",
    headline: "Serve more households without adding another client service associate.",
    lede: "Advisers want to spend time with clients. Their teams spend it on paperwork: new-account forms, transfers, meeting prep, CRM notes. The AI does the paperwork and the prep. Your advisers and compliance team approve.",
    picture:
      "Think of a client service associate who preps every review meeting the night before and never lets a transfer form sit in a drawer.",
    chores: [
      "New-account forms and transfer paperwork that come back with missing signatures",
      "Pulling statements and performance for review meetings",
      "Writing up meeting notes and follow-ups in the CRM",
      "Chasing clients for updated documents",
      "Keeping the books and records ready for an audit",
    ],
    tasks: [
      "New-account and transfer forms filled in and checked before they go out",
      "Review-meeting packets built from statements and the client's plan",
      "Meeting notes and follow-ups written into the CRM",
      "Document requests sent and tracked",
      "Communications archived and checked against your compliance rules",
    ],
    keeps: "Advisers give the advice. Compliance approves anything a client sees.",
    measure: [
      "Hours of prep per review meeting",
      "Days to open an account and complete a transfer",
      "Forms returned for missing information",
      "Households per adviser",
    ],
    first: ["intake", "reporting", "compliance"],
  },
  {
    key: "insurance",
    name: "Insurance carriers and agencies",
    group: "Money and advice",
    start: "Submissions, quote comparison, renewals, certificates, standard claims.",
    headline: "Work every renewal 120 days out, not 10.",
    lede: "Agencies and carriers lose hours to the same paperwork on every policy: keying submissions, comparing quotes, issuing certificates, chasing renewals. The AI does that work. Your producers and account managers stay with the client.",
    picture:
      "Think of a CSR who keys every submission the day it arrives, shops it across your carriers, and starts every renewal months early.",
    chores: [
      "Re-keying applications and ACORD forms into carrier portals",
      "Comparing carrier quotes side by side",
      "Issuing certificates of insurance the same day they are asked for",
      "Renewals worked at the last minute",
      "First notice of loss calls and the paperwork after",
    ],
    tasks: [
      "Submissions read and keyed into each carrier's portal",
      "Quotes compared in one side-by-side summary",
      "Certificates of insurance issued on request",
      "Renewals prepared well ahead of the date",
      "Standard claims checked against the policy, reserve drafted, an adjuster approving",
    ],
    keeps: "Producers own the client. An adjuster approves every claim decision.",
    measure: [
      "Hours from submission to quote",
      "Certificates issued per day, and turnaround",
      "Renewals worked more than 60 days out",
      "Retention at renewal",
    ],
    first: ["intake", "desk", "sales"],
  },
  {
    key: "mortgage",
    name: "Mortgage lenders and brokers",
    group: "Money and advice",
    start: "Document collection, conditions, verifications, borrower updates.",
    headline: "Close loans faster without adding processors.",
    lede: "A loan sits still while someone chases a pay stub or a bank statement. The AI chases, checks and files. Your processors and underwriters decide.",
    picture:
      "Think of a loan processor who works every file at once, chases every condition the day it is issued, and tells the borrower where things stand before they ask.",
    chores: [
      "Chasing borrowers for pay stubs, bank statements and tax returns",
      "Working the conditions list after underwriting",
      "Ordering verifications of employment and income",
      "Answering “where is my loan?” calls",
      "Checking files before they go to the investor",
    ],
    tasks: [
      "Borrower documents requested, read and checked against the file",
      "Conditions tracked until each one clears",
      "Verifications of employment and income ordered and followed up",
      "Borrowers updated at every stage, by text or email",
      "Files checked for missing items before submission",
    ],
    keeps: "Underwriters decide. Processors handle the exceptions.",
    measure: [
      "Days from application to clear to close",
      "Days a file waits on a document",
      "Files per processor",
      "Conditions per file",
    ],
    first: ["intake", "compliance", "desk"],
  },
  {
    key: "lending",
    name: "Business lenders and loan brokers",
    group: "Money and advice",
    start: "Prequalification, application packages, compliance, lead follow-up.",
    headline: "Answer every applicant the same day.",
    lede: "Business lending is a paperwork race: the lender that gets a complete package first usually wins. The AI collects, checks and packages. Your loan officers make the call.",
    picture:
      "Think of a loan coordinator who answers every inquiry within minutes, collects the whole package, and hands it over complete.",
    chores: [
      "Following up on leads before they go cold",
      "Collecting financials, tax returns and bank statements",
      "Building the application package for each lender",
      "Keeping marketing and outreach compliant",
    ],
    tasks: [
      "Inquiries answered and applicants prequalified without a hard credit pull",
      "Documents collected and checked",
      "Application packages built for each lender's requirements",
      "Content and outreach checked against your compliance rules before it goes out",
    ],
    keeps: "Loan officers and credit decide. Compliance approves marketing.",
    measure: [
      "Minutes to first response",
      "Days to a complete package",
      "Applications per loan officer",
    ],
    first: ["sales", "intake", "compliance"],
    proof: {
      status: "Running",
      text: "In our own lending business: a content engine that blocks any claim without a source before it publishes.",
    },
  },
  // ---------------------------------------------------------------- Health
  {
    key: "medical",
    name: "Medical practices and clinics",
    group: "Health",
    start: "Intake, eligibility, prior authorizations, coding, claims follow-up.",
    headline: "A front desk and billing office that keep up.",
    lede: "Practices lose money in the gaps: an eligibility check that was missed, a prior authorization that sat, a denied claim nobody worked. The AI does the checking, the paperwork and the follow-up. Your staff handle patients.",
    picture:
      "Think of a front desk and billing office that never closes, with your billing manager signing off on anything that leaves.",
    chores: [
      "Checking insurance eligibility before the visit",
      "Assembling prior-authorization packets and waiting on hold",
      "Coding visits from the provider's notes",
      "Working denials and aging A/R",
      "Reminder calls and no-shows",
    ],
    tasks: [
      "Intake forms read and filed in your system",
      "Eligibility checked before every visit",
      "Prior-authorization packets assembled and followed up",
      "Visits coded from clinical notes, claims submitted and denials worked",
      "Reminders and rescheduling",
    ],
    keeps: "Providers make clinical decisions. Your billing manager approves coding and appeals.",
    measure: [
      "Days in A/R",
      "Denial rate",
      "Days to approve a prior authorization",
      "No-show rate",
    ],
    first: ["intake", "receivables", "dispatch"],
    note: "Patient data stays inside your own systems.",
    proof: {
      status: "Pilot",
      text: "In our own clinical-research business: patient onboarding with health data filtered in code. One practice live.",
    },
  },
  // ---------------------------------------------------------------- Property
  {
    key: "realestate",
    name: "Real estate brokerages",
    group: "Property",
    start: "Lead follow-up, transaction coordination, compliance file review.",
    headline: "A transaction coordinator on every deal.",
    lede: "Agents sell. Everything around the sale, from lead follow-up to the compliance file, falls on a small back office. The AI does that work so nothing slips between contract and closing.",
    picture:
      "Think of a transaction coordinator who tracks every deadline on every contract and never forgets to send the lender an update.",
    chores: [
      "Calling back online leads before another agent does",
      "Tracking inspection, appraisal and financing deadlines",
      "Chasing signatures and missing disclosures",
      "Reviewing compliance files before the broker signs off",
    ],
    tasks: [
      "Leads answered within minutes and followed up",
      "Contract deadlines tracked, with reminders to every party",
      "Disclosures and signatures chased until the file is complete",
      "Compliance files checked before broker review",
    ],
    keeps: "Agents own the client. The broker signs off on every file.",
    measure: [
      "Minutes to first response on a lead",
      "Files missing documents at closing",
      "Transactions per coordinator",
    ],
    first: ["sales", "intake", "compliance"],
  },
  {
    key: "property-management",
    name: "Property managers",
    group: "Property",
    start: "Applications, leasing, work orders, rent collection, owner reports.",
    headline: "Manage more doors without adding staff.",
    lede: "Property management is volume: applications, work orders, late rent, owner statements, every month for every door. The AI handles the volume. Your managers handle tenants and owners.",
    picture:
      "Think of an office manager who answers every tenant, logs every work order and sends every owner report on time.",
    chores: [
      "Screening applications and scheduling showings",
      "Logging work orders and chasing vendors",
      "Late-rent reminders and notices",
      "Monthly owner statements",
    ],
    tasks: [
      "Leads turned into applications in your property system",
      "Work orders logged and vendors dispatched",
      "Rent reminders and notices sent on schedule",
      "Owner statements drafted from the books",
    ],
    keeps: "Managers approve leases, notices and any spend above your limit.",
    measure: ["Doors per manager", "Days to fill a vacancy", "Days to close a work order"],
    first: ["intake", "dispatch", "receivables"],
    proof: {
      status: "Running",
      text: "In our own property business: new leads become applications in the property system. Live since June 2026.",
    },
  },
  {
    key: "home-services",
    name: "Cleaning, HVAC and field services",
    group: "Property",
    start: "Scheduling, dispatch, crew assignment, quotes, invoicing.",
    headline: "Book, dispatch and bill without an office full of coordinators.",
    lede: "The work happens in the field. The money is lost in the office: missed callbacks, slow quotes, crews sent to the wrong place, invoices that go out late. The AI runs the office side.",
    picture:
      "Think of a dispatcher and office manager who answer every call, fill every schedule gap and invoice the same day the job closes.",
    chores: [
      "Answering calls and booking jobs",
      "Building tomorrow's schedule and routing crews",
      "Writing quotes and following up",
      "Invoicing and chasing payment",
    ],
    tasks: [
      "Calls and web requests answered and booked",
      "Schedules built and crews assigned",
      "Quotes drafted and followed up",
      "Invoices sent when the job closes, reminders after",
    ],
    keeps: "Your operations manager approves the schedule and any pricing exception.",
    measure: ["Minutes to answer a lead", "Jobs per dispatcher", "Days from job done to paid"],
    first: ["dispatch", "sales", "receivables"],
    proof: {
      status: "Building",
      text: "In our own cleaning company: crew assignment and operations moving onto AI first, HR and accounting next.",
    },
  },
  // ---------------------------------------------------------------- Professional firms
  {
    key: "legal",
    name: "Law firms",
    group: "Professional firms",
    start: "Intake, conflict checks, first drafts, deadlines, billing.",
    headline: "Bill for legal work, not for paperwork.",
    lede: "Associates and paralegals spend hours on intake, first drafts and keeping calendars. The AI does the first pass. Your attorneys review and decide.",
    picture:
      "Think of a paralegal who handles intake, drafts from your templates and never misses a deadline.",
    chores: [
      "New-client intake and conflict checks",
      "First drafts of NDAs, engagement letters and standard agreements",
      "Docketing deadlines",
      "Turning time entries into clean invoices",
    ],
    tasks: [
      "Intake forms and conflict searches run before the first call",
      "First drafts from your templates and playbook",
      "Deadlines docketed with reminders",
      "Time entries cleaned up and invoices drafted",
    ],
    keeps: "An attorney reviews and approves anything that leaves the firm.",
    measure: [
      "Hours per standard agreement",
      "Days from intake to engagement",
      "Unbilled time each month",
    ],
    first: ["legal", "intake", "receivables"],
  },
  {
    key: "engineering",
    name: "Engineering and consulting firms",
    group: "Professional firms",
    start: "Proposals, RFIs, submittals, project reports.",
    headline: "Win more proposals with the people you have.",
    lede: "Engineers should engineer. Too much of the week goes to proposals, RFI logs, submittals and status reports. The AI assembles them. Your project managers check and send.",
    picture:
      "Think of a project coordinator who keeps every RFI and submittal log current and has the proposal draft ready by Monday.",
    chores: [
      "Assembling proposals from past projects and resumes",
      "Logging and chasing RFIs and submittals",
      "Weekly status reports for each client",
    ],
    tasks: [
      "Proposals assembled from past work",
      "RFIs and submittals logged and chased",
      "Status reports drafted from the project record",
    ],
    keeps: "Project managers approve what goes to a client. Engineers stamp drawings.",
    measure: ["Hours per proposal", "Days an RFI stays open", "Hours per status report"],
    first: ["reporting", "intake", "desk"],
  },
  {
    key: "agencies",
    name: "Marketing agencies",
    group: "Professional firms",
    start: "Client reports, content drafts, scheduling, campaign tracking.",
    headline: "Take on more clients without more account coordinators.",
    lede: "Agencies sell ideas and spend the margin on coordination: monthly reports, content calendars, approvals, campaign tracking. The AI does the coordination. Your strategists and creatives do the work clients pay for.",
    picture:
      "Think of an account coordinator who builds every client report on the first of the month and keeps every content calendar full.",
    chores: [
      "Monthly client reports pulled from five platforms",
      "Content drafts and the approval chase",
      "Scheduling posts and campaigns",
    ],
    tasks: [
      "Client reports built from your ad and analytics accounts",
      "Content drafted against the brief, with sources checked",
      "Posts and campaigns scheduled after approval",
    ],
    keeps:
      "Strategists set direction. Every piece goes to a person for approval before it publishes.",
    measure: [
      "Hours per client report",
      "Clients per account manager",
      "Days from brief to approved draft",
    ],
    first: ["marketing", "reporting", "sales"],
    proof: {
      status: "Running",
      text: "In our own companies: location pages and blogs published through a check that blocks unsourced claims.",
    },
  },
  {
    key: "staffing",
    name: "Staffing and recruiting firms",
    group: "Professional firms",
    start: "Sourcing, screening, scheduling, onboarding, timesheets.",
    headline: "Fill more orders with the recruiters you have.",
    lede: "Recruiters make placements. Coordinators drown in screening, scheduling, onboarding paperwork and timesheets. The AI handles the coordination.",
    picture:
      "Think of a recruiting coordinator who screens every applicant overnight and has the interview on the calendar by morning.",
    chores: [
      "Sorting hundreds of applicants for each order",
      "Scheduling interviews across three calendars",
      "Onboarding paperwork and I-9s",
      "Chasing timesheets every Friday",
    ],
    tasks: [
      "Applicants screened against the job order",
      "Interviews scheduled",
      "Onboarding paperwork run from the offer",
      "Timesheets collected and checked before payroll",
    ],
    keeps: "Recruiters own the candidate and the client. A person makes every hiring decision.",
    measure: ["Hours to shortlist", "Days to fill", "Placements per recruiter"],
    first: ["recruiting", "dispatch", "receivables"],
  },
  // ---------------------------------------------------------------- Operations
  {
    key: "manufacturing",
    name: "Manufacturers and distributors",
    group: "Operations",
    start: "Quotes from RFQs, order entry, supplier invoices, ship-date updates.",
    headline: "Quote every RFQ the same day.",
    lede: "Orders arrive by email and phone. Someone keys them into an ERP from 2009, and someone else matches supplier invoices by hand. The AI does the keying and matching. Your estimators and buyers decide.",
    picture:
      "Think of an inside-sales estimator who answers every RFQ the day it lands and keys every order without a typo.",
    chores: [
      "Turning RFQ emails into quotes",
      "Keying orders into the ERP",
      "Matching supplier invoices to POs and receipts",
      "Answering “when will it ship?”",
    ],
    tasks: [
      "Quotes drafted from each RFQ against past jobs and current material prices",
      "Orders keyed into the ERP",
      "Supplier invoices matched to purchase orders and receipts",
      "Ship-date updates sent as work moves through the floor",
    ],
    keeps: "Estimators approve every quote. Buyers approve every payment.",
    measure: [
      "Hours per quote",
      "Minutes to key an order",
      "Invoices matched per clerk-day",
      "Quote win rate",
    ],
    first: ["procurement", "intake", "payables"],
  },
  {
    key: "logistics",
    name: "Freight and logistics companies",
    group: "Operations",
    start: "Load tracking, carrier paperwork, billing, customer updates.",
    headline: "Answer “where is my load?” before anyone asks.",
    lede: "Freight runs on paperwork: rate confirmations, carrier packets, proof of delivery, invoices. The AI keeps the paperwork moving and customers updated. Your dispatchers and brokers handle the exceptions.",
    picture:
      "Think of a track-and-trace clerk who checks every load every hour and bills it the minute the POD comes in.",
    chores: [
      "Check calls and customer status updates",
      "Carrier onboarding packets",
      "Matching PODs to invoices",
      "Chasing accessorials and detention",
    ],
    tasks: [
      "Loads tracked and customers updated",
      "Carrier packets collected and checked",
      "Invoices sent when proof of delivery arrives",
      "Payment follow-up",
    ],
    keeps: "Dispatchers handle exceptions. Your billing lead approves disputes.",
    measure: ["Loads per dispatcher", "Days from delivery to invoice", "Days sales outstanding"],
    first: ["desk", "receivables", "intake"],
  },
  {
    key: "msp",
    name: "Managed IT and security providers",
    group: "Operations",
    start: "Ticket triage, alert review, patching, onboarding, compliance evidence.",
    headline: "A level-one tech on every ticket, around the clock.",
    lede: "MSPs sell fixed monthly contracts, so every hour saved stays as margin. The AI sorts tickets, reviews alerts and keeps compliance evidence current. Your technicians handle what needs a person.",
    picture:
      "Think of a level-one technician who never sleeps, works every ticket the minute it opens and escalates only what needs a person.",
    chores: [
      "Sorting and routing tickets",
      "Looking at every alert to find the real ones",
      "Patching and user setup",
      "Collecting SOC 2 and ISO evidence for clients",
    ],
    tasks: [
      "Tickets sorted, routed and the simple ones resolved",
      "First review of every alert, with an analyst deciding",
      "Patching, monitoring and user setup across client environments",
      "Compliance evidence pulled on a schedule",
    ],
    keeps: "Technicians handle escalations. An analyst decides every security incident.",
    measure: ["Tickets per technician", "Minutes to first response", "Analyst minutes per alert"],
    first: ["desk", "engineering", "compliance"],
    proof: {
      status: "Running",
      text: "In our own software work: a ticket goes in, the change is built and checked against the live system, and a person reviews it.",
    },
  },
  {
    key: "outsourced",
    name: "Anyone with an outsourced back office",
    group: "Operations",
    start:
      "Work you already outsource moves first: the budget line exists and you already buy an outcome.",
    headline: "Pay for the outcome, not the headcount.",
    lede: "If you already pay an outside firm or an offshore team for work that follows a checklist, that work is the easiest to move. You already buy an outcome. We deliver the same outcome with AI and our own people on the exceptions.",
    picture:
      "Think of your current outsourcing contract, with the same deliverables, delivered faster and measured every month.",
    chores: [
      "Managing an offshore team across time zones",
      "Re-checking work that comes back wrong",
      "Paying for hours instead of results",
    ],
    tasks: [
      "The checklist work an outside team does today",
      "Measured against the current contract first",
      "The same outcome, delivered with AI and our operators on the exceptions",
    ],
    keeps: "You keep the same sign-offs you have today.",
    measure: ["Cost per transaction today", "Turnaround today", "Error rate today"],
    first: ["payables", "receivables", "desk"],
  },
];

export const packByKey = (key: string) => INDUSTRY_PACKS.find((p) => p.key === key);
