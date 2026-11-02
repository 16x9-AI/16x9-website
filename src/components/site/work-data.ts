import type { Status } from "@/components/site/Board";

// Case studies (/work/$slug): the companies 16x9 runs, described by industry, never by name
// (VOICE.md, decision 2026-09-02; reaffirmed by Manny 2026-11-02).
//
// Researched 2026-11-02 from the vault, the company repos and Linear, one read-only pass per
// company. Rules held here:
//   - Status matches the audited homepage board (routes/index.tsx) unless a source is clearly
//     newer; disagreements are recorded in the vault (CHG-537-cc), not silently changed.
//   - Only counts a source confirms and that are safe to publish. No money, clients, partners,
//     people, patients or deal figures. Unconfirmed figures (location-page counts, "one practice
//     live", unit counts) are left out until re-measured.
//   - The capital-advisory and lending pages never mention the network they belong to
//     (firewall, Manny 2026-11-02), never describe commercial traction, never state ownership.

export type CaseStudy = {
  key: string;
  industry: string;
  /** The industry page this case belongs next to. */
  industryKey?: string;
  headline: string;
  oneLine: string;
  startingPoint: string;
  built: { name: string; status: Status; what: string }[];
  howItRuns: string[];
  peopleDecide: string[];
  next: string[];
  numbers?: { value: string; label: string }[];
  /** Said plainly when the record is thin. */
  caveat?: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    key: "clinical-research",
    industry: "Clinical research",
    industryKey: "medical",
    headline:
      "A clinical-research network that finds studies, reads its own paperwork and checks what it is owed.",
    oneLine: "A clinical-research site network, with a sponsored-research network beside it.",
    startingPoint:
      "Practices described themselves in forms and emails, and staff read every document by hand. The shared drive held thousands of clinical files with inconsistent names. Invoices were checked against contract terms nobody could look up quickly, so some were rejected after the fact.",
    built: [
      {
        name: "Sponsor development",
        status: "Running",
        what: "The public trial registry is read every day, sponsors are scored for fit, and a research report lands with the team each morning.",
      },
      {
        name: "Sponsored-research platform",
        status: "Pilot",
        what: "A practice joins through a guided interview, is matched against real registry trials, and sees the reason for each match. Patient data is blocked in code.",
      },
      {
        name: "Document reading and filing",
        status: "Pilot",
        what: "Uploaded documents are read and filed. The shared drive is being renamed in checked, reversible batches, and every change is logged before it lands.",
      },
      {
        name: "Receivables and trial-agreement billing",
        status: "Building",
        what: "Contract rates, a receivables ledger, and a check that stops any invoice above the agreed cap. Designed, not yet relied on.",
      },
    ],
    howItRuns: [
      "The public trial registry is read every day.",
      "Each trial is scored against a practice's profile.",
      "The practice sees its matches with the reasons. Sponsor contacts stay hidden.",
      "Uploaded documents are read, and anything shaped like patient data is filtered out in code.",
      "Every change is logged before it lands.",
      "A person approves each admission, each outreach and each invoice.",
    ],
    peopleDecide: [
      "Whether a practice is admitted, held or declined.",
      "Which sponsors to approach, and what the outreach says.",
      "Whether a renamed file or a billed line is right.",
      "Whether the platform ever holds patient data. Today it does not.",
    ],
    next: [
      "Connect each practice's own file storage and email.",
      "Check practices against public regulator findings before admission.",
      "Run the invoice check end to end on real agreements.",
    ],
    numbers: [{ value: "~9,900", label: "clinical files in the shared-drive cleanup" }],
  },
  {
    key: "real-estate",
    industry: "Real estate",
    industryKey: "property-management",
    headline: "A property operator moving its leasing, vendors and deal screening onto AI.",
    oneLine: "An agentic operating platform for property operators. Early.",
    startingPoint:
      "A small portfolio of rental homes and multi-unit buildings, run day to day on an off-the-shelf property-management system. Applications stalled when applicants went quiet, and vendor work and records were handled by hand in email and spreadsheets.",
    built: [
      {
        name: "Tenant applications",
        status: "Running",
        what: "New leads become applications in the property system.",
      },
      {
        name: "Vendor discovery",
        status: "Building",
        what: "Vendors found from listings, checked and filled in, then handed to an outreach step a person approves.",
      },
      {
        name: "Investment screening",
        status: "Building",
        what: "An opportunity scored layer by layer, with the scorecard written to a table for review.",
      },
    ],
    howItRuns: [
      "A lead, a listing or an email arrives from the operator's own channels.",
      "AI reads it and fills in the record in the property system or a table.",
      "It is checked against the operator's rules.",
      "AI drafts the next step: a reply, an outreach note or a scorecard.",
      "Anything that spends money or contacts someone outside waits for a person.",
    ],
    peopleDecide: [
      "Whether an applicant is approved.",
      "Which vendor gets the work, and at what cost.",
      "Whether a property is worth pursuing.",
      "Anything that touches a tenant's housing paperwork or a legal deadline.",
    ],
    next: [
      "Move vendor discovery into a pilot with a reviewed outreach step.",
      "Run the first investment scorecards on real opportunities.",
      "Read the property-management system directly, read-only.",
    ],
    caveat:
      "This is the earliest of our companies. We will add detail as each piece moves from building to running.",
  },
  {
    key: "field-services",
    industry: "Field services",
    industryKey: "home-services",
    headline:
      "A cleaning company that publishes its own website, finds its own customers and is moving its back office onto AI.",
    oneLine: "A nationwide commercial and government cleaning company.",
    startingPoint:
      "The company ran on spreadsheets, forms, chat threads and hand-built workflows. Intake, scheduling, estimates and payroll lived in one database tool, and coordination lived in chat. A small office did it all by hand.",
    built: [
      {
        name: "Self-publishing website",
        status: "Running",
        what: "City and state pages, plus a blog written by a five-step AI chain: researcher, writer, auditor, grader and challenger. Nothing publishes without the auditor, and every article needs sources that resolve.",
      },
      {
        name: "Business-customer targeting",
        status: "Running",
        what: "Picks buildings, prices them, finds the manager and a verified contact, and drafts a short opener. The proposal is built only after the building replies. Quality checks refuse thin proposals and the wrong audience.",
      },
      {
        name: "Back office on AI",
        status: "Building",
        what: "Dispute handling is moving from a vendor's chat tool to our own AI, and payroll is being automated. Cleaner assignment comes next.",
      },
    ],
    howItRuns: [
      "Public records of buildings, owners and managers feed a daily queue.",
      "AI gathers each building's facts, prices it and finds a verified contact.",
      "Quality checks stop thin, off-target or unverified prospects.",
      "A short opener goes out. When a building replies, the proposal is built and a drafted answer goes to the team.",
      "A person approves every customer-facing reply, every price and every spend above a limit.",
    ],
    peopleDecide: [
      "Which replies and proposals go to a customer, and at what price.",
      "Refunds and spend above a limit.",
      "Hiring, payroll and the outcome of any dispute.",
      "When a website change goes live.",
    ],
    next: [
      "Widen targeting from one county to the whole state.",
      "Finish the dispute and payroll work, then add cleaner assignment.",
      "Get more of the site found in search, and make the blog bring in leads.",
    ],
    numbers: [{ value: "5", label: "steps in the article chain, each one a check" }],
  },
  {
    key: "capital-advisory",
    industry: "Capital advisory",
    industryKey: "capital-advisory",
    headline:
      "Advisory firms on one research desk: public facts collected every day, checked, and signed off by a person.",
    oneLine: "M&A, debt and real-estate advisory firms on one intelligence layer.",
    startingPoint:
      "Advisory teams read filings, news and lender activity by hand. Each firm kept its own notes, so the same research was repeated and some of it could not be traced back to a source. The rule from day one: a missing number is better than a wrong one.",
    built: [
      {
        name: "Research engine",
        status: "Running",
        what: "Securities filings and news are collected every day. Each source is scored for credibility, a second pass tries to disprove each claim, and forecasts are later scored against what happened.",
      },
      {
        name: "Public risk desk",
        status: "Running",
        what: "Footnoted notes on jurisdiction changes, licence deadlines and companies whose ownership is hard to see.",
      },
      {
        name: "Firm operating kit",
        status: "Running",
        what: "Six skills, three AI helpers and four tables a firm installs in one step. Shipped August 2026.",
      },
      {
        name: "Sector guides and a data-backed public site",
        status: "Running",
        what: "Plain guides by sector, and a public site whose figures are read from the research tables, so every number traces to a row.",
      },
      {
        name: "Finance runners and a pre-call check",
        status: "Building",
        what: "Background research run before every client call.",
      },
    ],
    howItRuns: [
      "Fixed scripts collect public filings, news and records on a schedule. No AI in this step.",
      "Each fact lands with its source link, a confidence score and a key that stops duplicates.",
      "AI writes the note, but may only copy the facts it was given. It cannot compute a new number.",
      "A sealed check reviews every note: length, sources, banned wording, no price talk, no near-copies of recent notes. If nothing new passes, nothing publishes that day.",
      "A named person approves anything that leaves the firm.",
    ],
    peopleDecide: [
      "Which sources the collectors read.",
      "Whether any client-facing work is released.",
      "What counts as a good enough source for a claim.",
      "Whether a published note stays up.",
    ],
    next: [
      "Finish the pre-call check.",
      "Add more checks that block invented figures before anything is drafted.",
    ],
    numbers: [
      { value: "6 · 3 · 4", label: "skills, AI helpers and tables in the firm kit" },
      { value: "2", label: "sources every published note must cite, at minimum" },
    ],
  },
  {
    key: "commercial-lending",
    industry: "Commercial lending",
    industryKey: "lending",
    headline:
      "Business owners matched to capital, with no hard credit pull to find out where they stand.",
    oneLine: "Businesses matched to capital, no hard credit pull first.",
    startingPoint:
      "Owners who need financing face a maze of loan types and a hard credit pull before they learn anything. The company built a readiness check, a plain-language advisor and a library of guides, so an owner sees where they stand first. A soft check runs only when the owner asks to see real offers.",
    built: [
      {
        name: "Readiness check",
        status: "Running",
        what: "Scores a business on seven weighted factors and shows the owner what drives the result.",
      },
      {
        name: "Advisor chat",
        status: "Running",
        what: "Asks about the business and its goal, then points to a financing structure that fits. It never promises approval or quotes a rate, and it is re-tested against fixed cases on every change.",
      },
      {
        name: "Compliance-checked content",
        status: "Running",
        what: "Drafts tied to a registry of sources. A check blocks any claim without a source before anything publishes.",
      },
      {
        name: "Signal collectors",
        status: "Running",
        what: "Federal notices and disaster declarations open timely drafts, such as what disaster-relief financing means for local owners.",
      },
      {
        name: "Lender-network connection",
        status: "Building",
        what: "Applications created and tracked with a lending partner. Sensitive details are entered on the partner's own secure pages, so the company never stores them.",
      },
    ],
    howItRuns: [
      "Public sources, such as federal notices and disaster declarations, open a topic.",
      "AI drafts from the source registry, and the check blocks any unsourced claim.",
      "An owner reads, takes the readiness check and talks to the advisor.",
      "The advisor starts the application, and every status change flows back to the owner.",
      "A person at the lending partner makes every credit decision.",
    ],
    peopleDecide: [
      "Whether a draft is accurate and ready to publish.",
      "Which lenders and financing structures are offered.",
      "Whether an owner is introduced onward, and only with the owner's consent.",
      "Every credit decision.",
    ],
    next: [
      "Finish the lender-network connection.",
      "Switch the content schedules back on together, once every piece is re-checked.",
    ],
    numbers: [
      { value: "7", label: "factors in the readiness check" },
      { value: "8", label: "financing structures explained in plain words" },
    ],
  },
];

export const caseByKey = (key: string) => CASE_STUDIES.find((c) => c.key === key);
