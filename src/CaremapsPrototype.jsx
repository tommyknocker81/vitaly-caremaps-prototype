import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Repeat, LayoutGrid, Bell, ShieldAlert, UserCog, FileText, BarChart3,
  History, ChevronsLeft, ChevronLeft, ChevronDown, ChevronRight, User, Star,
  Plus, X, Search, Calendar, ClipboardCheck, ClipboardList, UsersRound, FileStack,
  CheckCircle2, XCircle, UserX,
} from "lucide-react";
import vitalyLogo from "./assets/vitaly-logo.png";

// Vitaly RSO design tokens (Figma: OpenLine-Vitaly) — shared with the
// encounters and documents prototypes so all three read as one product.
// Card/row/typography values below are pulled directly from the Caremaps
// Overview dev-mode node (12535-358444) rather than approximated.
const T = {
  primary: "#0080A3",
  secondary: "#00324B",
  dark: "#001E2D",
  success: "#62A752",
  warning: "#FFB853",
  border: "#DEE2E6",
  bodyText: "#212529",
  gray700: "#495057",
  gray600: "#6C757D",
  gray500: "#ADB5BD",
  gray400: "#CED4DA",
  lightBg: "#E9ECEF",
  light: "#F7F8FA",
  cardBg: "#F8F9FA",
  teamItemBorder: "#DCDCDC",
  muted: "#555555",
  black: "#000000",
  fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif",
  cardShadow: "0 1px 2px rgba(0,0,0,0.2)",
};

/* ================= mock data ================= */

const MEMBER_POOL = [
  { id: "m1", name: "Dr. Emily Carter", jobTitle: "Medical Oncology", org: "Erasmus MC – Endoscopy Unit", email: "emily.carter@erasmus.nl" },
  { id: "m2", name: "Dr. Felix Hartmann", jobTitle: "Neurology", org: "St. Antonius Hospital", email: "fhartmann@antonious.nl" },
  { id: "m3", name: "Dr. Ethan Carter", jobTitle: "Medical Oncology", org: "St. Antonius Hospital", email: "ecarter@antonious.nl" },
  { id: "m4", name: "Dr. Sophia Reynolds", jobTitle: "Medical Oncology", org: "St. Antonius Hospital", email: "sreynolds@antonious.nl" },
  { id: "m5", name: "Dr. Clara Mitchell", jobTitle: "Physiotherapist", org: "St. Antonius Hospital", email: "cmitchell@antonious.nl" },
  { id: "m6", name: "Dr. Alex Thompson", jobTitle: "Neurology", org: "St. Antonius Hospital", email: "thompson@antonious.nl" },
  { id: "m7", name: "Dr. Robert Hamilton", jobTitle: "Oncologist", org: "St. Antonius Hospital", email: "rhamilton@antonious.nl" },
  { id: "m8", name: "Mary Brown", jobTitle: "Community Nurse", org: "Regional Homecare", email: "mary.brown@homecare.nl" },
  { id: "m9", name: "Mike Myers", jobTitle: "Physiotherapist", org: "UMC Utrecht - Physiotherapy", email: "mmyers@umcu.nl" },
  { id: "m10", name: "Dr. Mark Southerland", jobTitle: "GP", org: "Huisartsenpraktijk Zuid", email: "msoutherland@gp.nl" },
  { id: "m11", name: "Sanne de Groot", jobTitle: "Physiotherapist", org: "UMC Utrecht - Physiotherapy", email: "sdegroot@umcu.nl" },
  { id: "m12", name: "James Wilson", jobTitle: "Community Nurse", org: "Regional Homecare", email: "james.wilson@homecare.nl" },
  { id: "m13", name: "Anna de Boer", jobTitle: "GP", org: "Huisartsenpraktijk Zuid", email: "adeboer@gp.nl" },
];

// Each provider's own staff, used to populate "Assign to" once a provider
// is selected on an activity — assigning is about who at that provider
// does the work, not who's on the caremap's core team.
function staffForProvider(provider) {
  return MEMBER_POOL.filter((m) => m.org === provider);
}

const ROLE_POOL = ["Community nurse", "Oncologist", "Physiotherapist", "GP", "Social worker", "Spiritual counsellor"];

const ACTIVITY_TYPES = ["Physiotherapy", "Pain management", "Palliative nursing visit", "Spiritual counselling", "Social work consult", "Home care evaluation"];
const PROVIDERS = ["UMC Utrecht - Physiotherapy", "Regional Homecare", "St. Antonius Hospital", "Huisartsenpraktijk Zuid"];

const CARE_UNITS = ["Palliative Care", "Oncology Care", "Chronic Disease Management"];
const TEMPLATES = ["End of life care", "Symptom management", "Bereavement support"];

// The mandatory/optional activities offered in "Set plan and activate caremap"
// (Figma node 12527-337029). This is the single source of truth for the
// caremap's default plan — the Overview's "To do" list (node 12526-335476)
// is generated from these items + the toggle choices made in that modal,
// rather than a separate hardcoded activity list.
const SET_PLAN_ITEMS = [
  { id: "sp1", label: "Assign Case manager", assignee: "Unassigned", sub: "At activation", cadence: "(1/1)", toggle: false },
  { id: "sp2", label: "Initial PZP conversation", assignee: "Case manager", sub: "Due: 2 days", cadence: "(1/1)", toggle: false },
  { id: "sp3", label: "Record patient goals and whishes", assignee: "Unassigned", sub: "Due: 1 week", cadence: "(1/1)", toggle: false },
  { id: "sp4", label: "Record treatment wishes", assignee: "Unassigned", sub: "Due: 2 weeks", cadence: "(1/1)", toggle: false },
  { id: "sp5", label: "Record emergency records", assignee: "Unassigned", sub: "Due: 1 week", cadence: "(1/5)", toggle: true, defaultOn: true },
  { id: "sp6", label: "Review PZP and existing advance directive", assignee: "Unassigned", sub: "Every 3 weeks", cadence: "(1/5)", toggle: true, defaultOn: false },
];

const PLAN_ITEM_IDS = new Set(SET_PLAN_ITEMS.map((i) => i.id));
const CASE_MANAGER_ACTIVITY_ID = "sp1";

function defaultPlanToggles() {
  const t = {};
  SET_PLAN_ITEMS.forEach((i) => { if (i.toggle) t[i.id] = i.defaultOn; });
  return t;
}

// Every activity status belongs to a group (To do vs Resolved) and, once
// picked, reveals its own associated field(s) in the activity modal —
// matches the six status mockups (Requested/Planned/Scheduled/Completed/
// Declined by patient/Cancelled), each with a different field beside it.
const STATUS_CONFIG = {
  undefined: { label: "Undefined", group: "todo", tone: "gray" },
  required: { label: "Requested", group: "todo", tone: "teal", field: { key: "requiredMonth", label: "Set requested month", type: "month" } },
  planned: { label: "Planned", group: "todo", tone: "info", field: { key: "planningMonth", label: "Set planning month", type: "month" } },
  scheduled: { label: "Scheduled", group: "todo", tone: "teal", field: { key: "scheduledDate", label: "Set date", type: "date" }, extra: true },
  completed: { label: "Completed", group: "resolved", field: { key: "completedDate", label: "Set completed date", type: "date" } },
  declined: { label: "Declined by patient", group: "resolved", field: { key: "declinedDate", label: "Set declined date", type: "date" } },
  cancelled: { label: "Cancelled", group: "resolved", field: { key: "cancelledDate", label: "Set cancelled date", type: "date" } },
};
const TODO_STATUSES = ["undefined", "required", "planned", "scheduled"];
const RESOLVED_STATUSES = ["completed", "declined", "cancelled"];
const ALL_STATUSES = [...TODO_STATUSES, ...RESOLVED_STATUSES];

function statusGroup(status) {
  return STATUS_CONFIG[status]?.group ?? "todo";
}

// People who've been assigned an activity but aren't a formal team role —
// they still show up in the Team panel/tab, just without a role label.
function extraActivityAssignees(activities, team) {
  const teamMemberIds = new Set(team.filter((t) => t.memberId).map((t) => t.memberId));
  const seen = new Set();
  const extra = [];
  activities.forEach((a) => {
    if (a.assigneeId && !teamMemberIds.has(a.assigneeId) && !seen.has(a.assigneeId)) {
      const m = MEMBER_POOL.find((x) => x.id === a.assigneeId);
      if (m) {
        seen.add(a.assigneeId);
        extra.push(m);
      }
    }
  });
  return extra;
}

// Builds/refreshes the "To do" activity list from the plan items + current
// toggle choices, preserving status (and any status-specific fields) on any
// item that already existed, and keeping custom activities untouched.
function mergePlanIntoActivities(existingActivities, toggles) {
  const custom = existingActivities.filter((a) => !PLAN_ITEM_IDS.has(a.id));
  const planItems = SET_PLAN_ITEMS.filter((item) => !item.toggle || toggles[item.id]).map((item) => {
    const prior = existingActivities.find((a) => a.id === item.id);
    return (
      prior || {
        id: item.id,
        title: item.label,
        cadence: item.cadence,
        status: "undefined",
        mandatory: !item.toggle,
        sub: item.sub,
      }
    );
  });
  return [...planItems, ...custom];
}

// Keeps the "Assign Case manager" to-do item in sync with whether the Case
// Manager role actually has a member assigned yet.
function syncCaseManagerActivity(activities, team) {
  const hasCaseManager = !!team.find((t) => t.label === "Case manager")?.memberId;
  return activities.map((a) =>
    a.id === CASE_MANAGER_ACTIVITY_ID && hasCaseManager && a.status !== "completed"
      ? { ...a, status: "completed", completedDate: a.completedDate || todayISO() }
      : a
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDMY(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
function addMonthsDMY(iso, n) {
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + n);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
function formatFieldValue(type, value) {
  if (!value) return null;
  if (type === "month") {
    const [y, m] = value.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }
  return formatDMY(value);
}

/* ================= building blocks ================= */

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: { backgroundColor: T.gray600, color: "#fff" },
    teal: { backgroundColor: T.primary, color: "#fff" },
    green: { backgroundColor: T.success, color: "#fff" },
    warning: { backgroundColor: T.warning, color: "#fff" },
    info: { backgroundColor: "rgba(0,128,163,0.11)", color: T.primary },
  };
  return (
    <span
      className="px-[8px] py-[4px] rounded-full text-[12px] font-bold tracking-[1px] uppercase shrink-0"
      style={tones[tone]}
    >
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "solid", small, disabled, className = "", type = "button" }) {
  const base = "rounded-[4px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 whitespace-nowrap";
  const size = small ? "px-3.5 py-1.5 text-[14px]" : "px-[13px] py-[7px] text-[15px]";
  const variants = {
    solid: { backgroundColor: T.primary, color: "#fff" },
    green: { backgroundColor: T.success, color: "#fff" },
    outline: { backgroundColor: "#fff", color: T.primary, border: `1px solid ${T.primary}` },
    neutral: { backgroundColor: "#fff", color: T.gray700, border: `1px solid ${T.gray400}` },
  };
  return (
    <button type={type} className={`${base} ${size} ${className}`} style={variants[variant]} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, width = 640 }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(0,50,75,0.55)" }}>
      <div className="bg-white rounded-md shadow-2xl flex flex-col" style={{ width, maxWidth: "94vw", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: T.border }}>
          <h3 className="font-bold tracking-wide text-[15px] uppercase" style={{ color: T.secondary }}>{title}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={18} style={{ color: T.gray600 }} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="mb-4">
      <label className="block text-[15px] font-semibold mb-1.5" style={{ color: T.black }}>
        {label} {required && <span style={{ color: "#DC5B5B" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const selectCls = "w-full border rounded-[4px] px-3 py-2 text-[15px] bg-white outline-none focus:ring-1";
const selectStyle = { borderColor: T.gray400, color: T.bodyText };

// Native <select> arrows sit flush against the box edge with no breathing
// room once padding is customized — this wraps it with appearance:none and
// draws our own chevron with proper right-side spacing.
function Select({ className = "", style, wrapperStyle, children, ...props }) {
  return (
    <div className="relative w-full" style={wrapperStyle}>
      <select className={`${selectCls} appearance-none pr-9 ${className}`} style={style} {...props}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.gray600 }} />
    </div>
  );
}

function ToggleField({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2"
      aria-pressed={on}
    >
      <span className="text-[14px] font-medium" style={{ color: T.bodyText }}>{on ? "On" : "Off"}</span>
      <span
        className="w-9 h-5 rounded-full relative transition-colors shrink-0"
        style={{ backgroundColor: on ? T.primary : T.gray400 }}
      >
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: on ? 18 : 2 }} />
      </span>
    </button>
  );
}

/* ================= chrome: sidebar / header / patient bar ================= */

const NAV_ITEMS = [
  { icon: Users, label: "Patients" },
  { icon: Repeat, label: "Referrals" },
  { icon: LayoutGrid, label: "MDT meetings" },
  { icon: ClipboardCheck, label: "Caremaps", active: true },
  { icon: Bell, label: "Notifications" },
  { icon: ShieldAlert, label: "Care services" },
  { icon: UserCog, label: "User management" },
  { icon: FileText, label: "Integration logs" },
  { icon: BarChart3, label: "Analytics" },
];

function Sidebar() {
  return (
    <div className="w-64 shrink-0 flex flex-col text-white" style={{ backgroundColor: T.secondary }}>
      <div className="flex items-center pt-6 px-4 pb-12">
        <img src={vitalyLogo} alt="OpenLine Vitaly" className="h-9 w-auto" />
      </div>
      <nav className="flex-1">
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className="w-full h-12 flex items-center gap-4 px-4 text-[15px] text-left transition-colors hover:bg-white/10"
            style={active ? { backgroundColor: T.primary, color: "#fff", fontWeight: 600 } : { color: "rgba(255,255,255,0.8)" }}
          >
            <Icon size={20} className="shrink-0" /> {label}
          </button>
        ))}
      </nav>
      <button className="w-full h-12 flex items-center gap-4 px-4 text-[15px] text-left hover:bg-white/10" style={{ color: "rgba(255,255,255,0.8)" }}>
        <History size={20} /> Last view patients
      </button>
      <button className="w-full h-12 flex items-center gap-4 px-4 text-[15px] text-left hover:bg-white/10" style={{ backgroundColor: T.dark }}>
        <ChevronsLeft size={20} /> Collapse menu
      </button>
    </div>
  );
}

function TopHeader() {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b" style={{ borderColor: T.border }}>
      <div className="flex items-center gap-2">
        <h1 className="text-[24px] font-semibold leading-[1.2]" style={{ color: T.black }}>Patients</h1>
        <button aria-label="Add patient">
          <Plus size={24} style={{ color: T.primary }} />
        </button>
      </div>
      <div className="flex items-center gap-9">
        <span
          className="w-12 h-6 rounded-full flex items-center px-[3px] bg-white border-[1.5px]"
          style={{ borderColor: "rgba(0,0,0,0.25)" }}
          aria-hidden
        >
          <span className="w-[18px] h-[18px] rounded-full" style={{ backgroundColor: T.gray400 }} />
        </span>
        <div className="flex items-center gap-4">
          <Star size={24} fill={T.primary} style={{ color: T.primary }} />
          <span className="relative">
            <Bell size={24} style={{ color: T.primary }} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
          </span>
        </div>
        <span className="w-px h-6" style={{ backgroundColor: T.border }} />
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full flex items-center justify-center p-1" style={{ backgroundColor: T.lightBg }}>
            <User size={24} style={{ color: T.gray700 }} />
          </span>
          <span className="text-[15px] font-semibold whitespace-nowrap" style={{ color: T.bodyText }}>Dr. HENLEY, Maria</span>
          <ChevronDown size={24} style={{ color: T.gray700 }} />
        </div>
      </div>
    </div>
  );
}

const PATIENT_TABS = ["PX360", "CONTACTS", "DOCUMENTS", "REFERRAL", "CAREMAPS"];

function PatientBar({ back }) {
  return (
    <div className="flex items-stretch border-b bg-white min-h-[94px]" style={{ borderColor: T.border }}>
      <button onClick={back} className="flex items-center px-1" aria-label="Back">
        <ChevronLeft size={24} style={{ color: T.primary }} />
      </button>
      <div className="flex items-center gap-3 px-6 border-l border-r" style={{ borderColor: T.border }}>
        <span className="rounded-full p-px border" style={{ borderColor: T.primary }}>
          <span className="w-14 h-14 rounded-full flex items-center justify-center p-1 border-[3px] border-white" style={{ backgroundColor: T.lightBg }}>
            <User size={48} style={{ color: T.gray700 }} />
          </span>
        </span>
        <div className="leading-[1.5]">
          <div className="text-[15px] font-semibold" style={{ color: T.bodyText }}>DE VRIES, Jan</div>
          <div className="text-[15px]" style={{ color: T.gray700 }}>ID 161 885 4347</div>
          <div className="text-[15px]" style={{ color: T.gray700 }}>14.03.1953 (73yrs) &#8231; Male</div>
        </div>
      </div>
      <div className="flex-1 flex items-stretch justify-end gap-8 px-8">
        {PATIENT_TABS.map((tab) => {
          const active = tab === "CAREMAPS";
          return (
            <span
              key={tab}
              className={`relative flex items-center text-[14px] tracking-wide ${active ? "font-bold" : "font-normal"}`}
              style={{ color: active ? T.primary : T.gray700 }}
            >
              {tab}
              {active && <span className="absolute left-0 right-0 bottom-0 h-[3px]" style={{ backgroundColor: T.primary }} />}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ================= HIS shell (start screen) ================= */

function EHRSection({ title, children }) {
  return (
    <div className="mb-3">
      <div className="text-white text-[12px] font-semibold px-3 py-1.5 flex items-center justify-between" style={{ backgroundColor: T.secondary }}>
        {title} <span className="opacity-60 text-[11px]">…</span>
      </div>
      <div className="border border-t-0 p-3 text-[12px] space-y-1.5" style={{ borderColor: T.border, color: T.gray700 }}>
        {children}
      </div>
    </div>
  );
}

function LegacyEHRPanel() {
  return (
    <div className="w-[420px] shrink-0 flex flex-col text-[12px]" style={{ backgroundColor: "#F1F3F5", borderRight: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-3 px-3 py-2 text-white text-[11px]" style={{ backgroundColor: T.secondary }}>
        <span>📁</span><span>🔧</span><span>⚙️</span><span>?</span><span className="ml-auto">⏻</span>
      </div>
      <div className="px-3 py-3 border-b" style={{ borderColor: T.border, backgroundColor: "#fff" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gray-300 shrink-0" />
          <div>
            <div className="font-bold text-[13px]" style={{ color: T.bodyText }}>Janssen Demo, A.A.</div>
            <div style={{ color: T.gray600 }}>05-02-1951 (66 jr)</div>
            <div style={{ color: T.gray600 }}>443 &nbsp; ☎ 0612345678</div>
          </div>
        </div>
        <div className="flex mt-3 text-[11px] font-semibold">
          <div className="px-3 py-1.5 border" style={{ borderColor: T.border, color: T.gray700 }}>Favorieten</div>
          <div className="px-3 py-1.5 text-white" style={{ backgroundColor: T.primary }}>Dossier</div>
        </div>
        <div className="mt-2 space-y-1 text-[12px]" style={{ color: T.primary }}>
          <div className="py-0.5">Voorblad</div>
          <div className="py-0.5">Naslag 2.0</div>
          <div className="py-0.5" style={{ color: T.bodyText }}>EPD Dashboard</div>
          <div className="py-1 px-2 mt-1 font-semibold text-white" style={{ backgroundColor: T.primary }}>Consult</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3" style={{ backgroundColor: "#F1F3F5" }}>
        <EHRSection title="Patiëntgegevens">
          <div>Adres&nbsp;&nbsp;: Violenstraat 35, 3551 BB Utrecht</div>
          <div>Telefoon&nbsp;: 0612345678</div>
          <div>Huisarts&nbsp;: J.W. Dommers (Huisarts)</div>
          <div>Verzekering&nbsp;: FBTO (V02110)</div>
        </EHRSection>
        <EHRSection title="Episodelijst">
          <div>1970 &nbsp;Constitutioneel eczeem</div>
          <div>2012 &nbsp;Enkel symptomen/klachten – Enkelfractuur rechts</div>
          <div>2010 &nbsp;Moeheid/zwakte</div>
        </EHRSection>
        <EHRSection title="Aandachtspunten">
          <div>27-02-2017 &nbsp;Familie-anamnese: HVZ+</div>
          <div>27-02-2017 &nbsp;Roken +</div>
        </EHRSection>
        <EHRSection title="Overige voorgeschiedenis">
          <div className="opacity-0">—</div>
        </EHRSection>
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-white text-[11px]" style={{ backgroundColor: T.secondary }}>
        <span>▲ Overige acties</span>
        <span>✕ Sluiten</span>
      </div>
    </div>
  );
}

function AppRow({ icon: Icon, title, desc, children }) {
  return (
    <div className="flex gap-4 py-5 border-b" style={{ borderColor: T.border }}>
      <div className="w-11 h-11 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: T.secondary }}>
        <Icon size={18} color="#fff" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-[14px]" style={{ color: T.secondary }}>{title}</div>
        <div className="text-[13px] mt-0.5 mb-3" style={{ color: T.gray600 }}>{desc}</div>
        <div className="flex items-center gap-4">{children}</div>
      </div>
    </div>
  );
}

function HISShell({ hasCaremap, onCreate, onOpen }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <LegacyEHRPanel />
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: T.light }}>
        <div className="px-8 py-4 flex items-center" style={{ backgroundColor: T.secondary }}>
          <img src={vitalyLogo} alt="OpenLine Vitaly" className="h-8 w-auto" />
        </div>
        <div className="p-10 max-w-2xl">
          <h2 className="text-[20px] font-semibold mb-6" style={{ color: T.bodyText }}>Choose the application you would like to open</h2>
          <div className="bg-white rounded shadow-sm px-6">
            <AppRow icon={ClipboardList} title="Advanced Care Planning (ACP)" desc="Create, manage, and review personalised care plans and patient preferences.">
              <Btn small variant="outline" disabled>Open plan</Btn>
            </AppRow>
            <AppRow icon={UsersRound} title="Multidisciplinary Team Meetings (MDT)" desc="Coordinate and manage collaborative care discussions across healthcare teams.">
              <Btn small variant="outline" disabled><Plus size={13} />New referral to MDT</Btn>
              <span className="text-[13px] font-semibold" style={{ color: T.gray500 }}>Show (3) referrals</span>
            </AppRow>
            <AppRow icon={User} title="Patient 360 (Px360)" desc="Access a complete, unified view of patient information, history, and activity.">
              <Btn small variant="outline" disabled>Open</Btn>
            </AppRow>
            <AppRow icon={FileStack} title="Caremaps" desc="Access patient-related documents and clinical files.">
              <Btn small onClick={onCreate}><Plus size={13} />Create new caremap</Btn>
              {hasCaremap && (
                <button onClick={onOpen} className="text-[13px] font-semibold" style={{ color: T.primary }}>
                  Show (1) active caremap
                </button>
              )}
            </AppRow>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= modals ================= */

function CreateCaremapModal({ onClose, onCreate }) {
  const [unit, setUnit] = useState(CARE_UNITS[0]);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  return (
    <Modal title="Create Caremap" onClose={onClose} width={520}>
      <Field label="Care unit" required>
        <Select style={selectStyle} value={unit} onChange={(e) => setUnit(e.target.value)}>
          {CARE_UNITS.map((u) => <option key={u}>{u}</option>)}
        </Select>
      </Field>
      <Field label="Caremap template">
        <Select style={selectStyle} value={template} onChange={(e) => setTemplate(e.target.value)}>
          {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
        </Select>
      </Field>
      <div className="flex justify-end gap-3 mt-6">
        <Btn variant="neutral" onClick={onClose}>Close</Btn>
        <Btn onClick={() => onCreate(unit, template)}>Create Caremap</Btn>
      </div>
    </Modal>
  );
}

function SetPlanModal({ caremap, onClose, onActivate, onSaveDraft }) {
  const [toggles, setToggles] = useState(() => caremap.planToggles || defaultPlanToggles());
  const [date, setDate] = useState("2026-08-12");
  const locked = caremap.status === "active";

  return (
    <Modal title="Set plan and activate caremap" onClose={onClose} width={760}>
      <div className="mb-5">
        <div className="font-bold text-[15px] mb-1.5" style={{ color: T.secondary }}>Setting the plan</div>
        <div className="text-[13px] leading-relaxed" style={{ color: T.gray600 }}>
          Activate or configure the activities you would like to have in the patient's care map. All mandatory
          activities will be added to the care map plan by default. Once you activate the plan, you will not be
          able to change it anymore.
        </div>
      </div>
      <div className="space-y-2 mb-6">
        {SET_PLAN_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between border rounded px-4 py-3" style={{ borderColor: T.border, backgroundColor: T.light }}>
            <div className="flex items-start gap-3">
              <Calendar size={16} style={{ color: T.primary }} className="mt-0.5" />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: T.bodyText }}>{item.label}</div>
                <div className="text-[13px]" style={{ color: T.gray600 }}>{item.assignee}</div>
              </div>
            </div>
            {item.toggle ? (
              <div className="text-right">
                <ToggleField on={!!toggles[item.id]} onChange={() => !locked && setToggles((t) => ({ ...t, [item.id]: !t[item.id] }))} />
                <div className="text-[12px] mt-1" style={{ color: T.gray600 }}>{item.sub}</div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-[14px] font-semibold" style={{ color: T.bodyText }}>Mandatory</div>
                <div className="text-[12px]" style={{ color: T.gray600 }}>{item.sub}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mb-2">
        <div className="font-bold text-[15px] mb-1.5" style={{ color: T.secondary }}>When will the plan start?</div>
        <div className="text-[13px] mb-2 leading-relaxed" style={{ color: T.gray600 }}>
          All configured activities above will refer to the start date you set below. Start date is generally a
          surgery date or in case of no surgery, MDT meeting date or concluded therapy date.
        </div>
        <input
          type="date"
          value={date}
          disabled={locked}
          onChange={(e) => setDate(e.target.value)}
          className={selectCls}
          style={{ ...selectStyle, maxWidth: 220 }}
        />
      </div>
      <div className="flex justify-between mt-6">
        <Btn variant="neutral" onClick={onClose}>Cancel</Btn>
        {!locked && (
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => { onSaveDraft(toggles); onClose(); }}>Save as Draft</Btn>
            <Btn onClick={() => { onActivate(date, toggles); onClose(); }}>Activate caremap</Btn>
          </div>
        )}
      </div>
    </Modal>
  );
}

function AssignRoleModal({ fixedRole, onClose, onAssign }) {
  const [role, setRole] = useState(fixedRole || ROLE_POOL[0]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const jobTitles = [...new Set(MEMBER_POOL.map((m) => m.jobTitle))];
  const filtered = MEMBER_POOL.filter(
    (m) => m.name.toLowerCase().includes(query.toLowerCase()) && (!jobFilter || m.jobTitle === jobFilter)
  );

  return (
    <Modal title="Assign member a role" onClose={onClose} width={820}>
      <div className="mb-4 text-[14px]" style={{ color: T.bodyText }}>
        Assign member to role:{" "}
        {fixedRole ? (
          <span className="font-bold" style={{ color: T.primary }}>{fixedRole}</span>
        ) : (
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="!w-auto !py-1 !text-[14px] font-bold"
            style={{ borderColor: T.gray400, color: T.primary }}
            wrapperStyle={{ display: "inline-block", width: "auto" }}
          >
            {ROLE_POOL.map((r) => <option key={r}>{r}</option>)}
          </Select>
        )}
      </div>
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center border rounded px-3 py-2" style={{ borderColor: T.gray400 }}>
          <Search size={14} style={{ color: T.gray600 }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="ml-2 text-[14px] w-full outline-none" />
        </div>
        <Select style={selectStyle} wrapperStyle={{ maxWidth: 190 }} value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
          <option value="">Job title</option>
          {jobTitles.map((j) => <option key={j}>{j}</option>)}
        </Select>
      </div>
      <div className="border rounded overflow-hidden" style={{ borderColor: T.border }}>
        <div className="grid text-[12px] font-bold uppercase px-4 py-2.5" style={{ gridTemplateColumns: "24px 1.4fr 1fr 1.4fr 1.4fr", backgroundColor: T.light, color: T.gray600 }}>
          <div /><div>First and last name</div><div>Job title</div><div>Organisation</div><div>Contact</div>
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelected(m.id)}
              className="grid items-center px-4 py-3 text-[14px] border-t cursor-pointer"
              style={{ gridTemplateColumns: "24px 1.4fr 1fr 1.4fr 1.4fr", borderColor: T.border, backgroundColor: selected === m.id ? "#DCEEF3" : "#fff" }}
            >
              <input type="radio" readOnly checked={selected === m.id} style={{ accentColor: T.primary }} />
              <div style={{ color: T.bodyText }}>{m.name}</div>
              <div style={{ color: T.gray600 }}>{m.jobTitle}</div>
              <div style={{ color: T.gray600 }}>{m.org}</div>
              <div style={{ color: T.primary }}>{m.email}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px]" style={{ color: T.gray600 }}>No matching members.</div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Btn variant="neutral" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!selected} onClick={() => onAssign(role, selected)}>Assign a member</Btn>
      </div>
    </Modal>
  );
}

// Status select + its associated field(s) — shared by the "Add new
// activity" (progressive disclosure) and "edit activity" (all fields
// visible at once, prefilled) modals, so both stay in sync with the six
// status mockups (Requested/Planned/Scheduled/Completed/Declined/Cancelled).
function StatusFields({ status, setStatus, fields, setField, locked }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Status" required>
          <Select
            style={selectStyle}
            value={status}
            disabled={locked}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="" disabled>Please select</option>
            <optgroup label="To do">
              {TODO_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </optgroup>
            <optgroup label="Resolved">
              {RESOLVED_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </optgroup>
          </Select>
        </Field>
        {cfg?.field && (
          <Field label={cfg.field.label} required>
            <input
              type={cfg.field.type}
              className={selectCls}
              style={selectStyle}
              disabled={locked}
              value={fields[cfg.field.key] || ""}
              onChange={(e) => setField(cfg.field.key, e.target.value)}
            />
          </Field>
        )}
      </div>
      {cfg?.extra && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Hour" required>
            <input
              type="time"
              className={selectCls}
              style={selectStyle}
              disabled={locked}
              value={fields.hour || ""}
              onChange={(e) => setField("hour", e.target.value)}
            />
          </Field>
          <Field label="Location" required>
            <input
              type="text"
              className={selectCls}
              style={selectStyle}
              disabled={locked}
              value={fields.location || ""}
              onChange={(e) => setField("location", e.target.value)}
            />
          </Field>
        </div>
      )}
    </>
  );
}

function AssignToField({ assignee, setAssignee, provider }) {
  const staff = staffForProvider(provider);
  return (
    <Field label="Assign to">
      <Select style={selectStyle} value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled={!provider}>
        <option value="">Unassigned</option>
        {staff.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.jobTitle})</option>)}
      </Select>
      {!provider && (
        <div className="text-[12px] mt-1" style={{ color: T.gray600 }}>Select a provider first to see who's available to assign.</div>
      )}
    </Field>
  );
}

function AddActivityModal({ onClose, onAdd }) {
  const [type, setType] = useState("");
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("");
  const [fields, setFields] = useState({});
  const [comment, setComment] = useState("");
  const [assignee, setAssignee] = useState("");

  const setField = (key, value) => setFields((f) => ({ ...f, [key]: value }));
  const canSubmit = !!type && !!status;

  const submit = () => {
    onAdd({ type, provider, status, fields, comment, assignee });
    onClose();
  };

  return (
    <Modal title="Add new activity" onClose={onClose} width={620}>
      <Field label="Activity type" required>
        <Select style={selectStyle} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="" disabled>Please select</option>
          {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </Select>
      </Field>

      {type && (
        <>
          <StatusFields status={status} setStatus={setStatus} fields={fields} setField={setField} />

          <Field label="Select provider" required>
            <Select
              style={selectStyle}
              value={provider}
              onChange={(e) => { setProvider(e.target.value); setAssignee(""); }}
            >
              <option value="" disabled>Please select</option>
              {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>

          <AssignToField assignee={assignee} setAssignee={setAssignee} provider={provider} />

          <Field label="Write your comment" required>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Autosize height based on content lines"
              className={selectCls}
              style={{ ...selectStyle, minHeight: 90, resize: "vertical" }}
            />
          </Field>
          <button className="flex items-center gap-2 text-[14px] font-semibold mb-2" style={{ color: T.primary }}>
            <Plus size={14} /> Add document
          </button>
        </>
      )}

      <div className="flex justify-between mt-6">
        <Btn variant="neutral" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!canSubmit} onClick={submit}>Add Activity</Btn>
      </div>
    </Modal>
  );
}

const STATUS_FIELD_KEYS = ["requiredMonth", "planningMonth", "scheduledDate", "hour", "location", "completedDate", "declinedDate", "cancelledDate"];

function EditActivityModal({ activity, onClose, onSave }) {
  const [status, setStatus] = useState(activity.status);
  const [fields, setFields] = useState(() => {
    const f = {};
    STATUS_FIELD_KEYS.forEach((k) => { if (activity[k] != null) f[k] = activity[k]; });
    return f;
  });
  const [provider, setProvider] = useState(activity.provider || "");
  const [comment, setComment] = useState(activity.comment || "");
  const [assignee, setAssignee] = useState(activity.assigneeId || "");

  const setField = (key, value) => setFields((f) => ({ ...f, [key]: value }));

  const submit = () => {
    onSave({ status, fields, provider, comment, assigneeId: assignee || null });
    onClose();
  };

  return (
    <Modal title={activity.title} onClose={onClose} width={620}>
      {activity.mandatory && (
        <div className="text-[12px] mb-4" style={{ color: T.gray600 }}>
          This is a mandatory plan activity — its status can still be changed at any time.
        </div>
      )}
      <StatusFields status={status} setStatus={setStatus} fields={fields} setField={setField} />

      <Field label="Select provider">
        <Select
          style={selectStyle}
          value={provider}
          onChange={(e) => { setProvider(e.target.value); setAssignee(""); }}
        >
          <option value="">Unspecified</option>
          {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
        </Select>
      </Field>

      <AssignToField assignee={assignee} setAssignee={setAssignee} provider={provider} />

      <Field label="Write your comment">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Autosize height based on content lines"
          className={selectCls}
          style={{ ...selectStyle, minHeight: 90, resize: "vertical" }}
        />
      </Field>

      <div className="flex justify-end gap-3 mt-6">
        <Btn variant="neutral" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!status} onClick={submit}>Save</Btn>
      </div>
    </Modal>
  );
}

/* ================= activities / team panels ================= */

function ResolvedIcon({ status }) {
  if (status === "completed") return <CheckCircle2 size={22} style={{ color: T.success }} />;
  if (status === "declined") return <UserX size={22} style={{ color: "#DC5B5B" }} />;
  return <XCircle size={22} style={{ color: "#DC5B5B" }} />;
}

function ActivityRow({ activity, onClick }) {
  const memberName = MEMBER_POOL.find((m) => m.id === activity.assigneeId)?.name;
  const cfg = STATUS_CONFIG[activity.status] || STATUS_CONFIG.undefined;
  const isResolved = cfg.group === "resolved";
  const fieldValue = cfg.field ? activity[cfg.field.key] : null;
  const displayDate = fieldValue ? formatFieldValue(cfg.field.type, fieldValue) : null;
  const Icon = activity.link ? FileText : Calendar;

  // Right-hand subtext under the badge: the status-specific date/time/
  // location when set, otherwise the plan item's own due/cadence label
  // (e.g. "Due: 2 weeks", "At activation") when it hasn't been touched yet.
  const rightSubtext = displayDate
    ? `${displayDate}${cfg.extra && activity.hour ? ` · ${activity.hour}` : ""}${cfg.extra && activity.location ? ` · ${activity.location}` : ""}`
    : activity.sub || null;

  // Who/where line under the title: assignee (+ provider if both are set),
  // provider alone if only that's set, or "Unassigned" as the fallback.
  const assignedLine = [memberName, activity.provider].filter(Boolean).join(" · ") || "Unassigned";

  return (
    <button
      onClick={onClick}
      className="w-full text-left border min-h-[48px] pl-[25px] pr-[11px] py-[13px] rounded-[8px] flex items-center justify-between gap-3 transition-shadow hover:shadow-sm"
      style={{ borderColor: T.border, backgroundColor: T.cardBg }}
    >
      <div className="flex items-start gap-[16px] min-w-0">
        <Icon size={20} style={{ color: T.gray500 }} className="shrink-0" />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold leading-[1.5]">
            <span style={{ color: "rgba(0,0,0,0.5)" }}>{activity.cadence} </span>
            <span style={{ color: T.muted }}>{activity.title}</span>
          </div>
          {activity.link ? (
            <div className="text-[15px] underline" style={{ color: T.primary }}>{activity.link}</div>
          ) : (
            !isResolved && <div className="text-[15px] underline" style={{ color: T.primary }}>{assignedLine}</div>
          )}
        </div>
      </div>

      {isResolved ? (
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            {displayDate && <div className="text-[14px] font-medium" style={{ color: T.bodyText }}>{displayDate}</div>}
            {memberName && <div className="text-[13px]" style={{ color: T.muted }}>{memberName}</div>}
          </div>
          <ResolvedIcon status={activity.status} />
        </div>
      ) : (
        <div className="text-right shrink-0">
          <Badge tone={cfg.tone}>{cfg.label}</Badge>
          {rightSubtext && <div className="text-[13px] mt-1.5" style={{ color: T.muted }}>{rightSubtext}</div>}
        </div>
      )}
    </button>
  );
}

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2 font-bold text-[20px] tracking-[0.8px] uppercase mb-6" style={{ color: T.black }}>
      {children} <ChevronRight size={18} />
    </div>
  );
}

function ActivitiesPanel({ activities, planConfigured, onAdd, onOpenSetPlan, onEditActivity }) {
  const todo = activities.filter((a) => statusGroup(a.status) === "todo");
  const resolved = activities.filter((a) => statusGroup(a.status) === "resolved");
  const nothingYet = !planConfigured && activities.length === 0;

  return (
    <div className="bg-white rounded-[4px] p-6 pb-10" style={{ boxShadow: T.cardShadow }}>
      <div className="flex items-center justify-between mb-6">
        <SectionHeading>ACTIVITIES</SectionHeading>
        <button onClick={onAdd} className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: T.primary }} aria-label="Add activity">
          <Plus size={16} />
        </button>
      </div>

      {nothingYet ? (
        <div className="text-[15px] leading-[1.5] mb-2" style={{ color: T.muted }}>
          It looks like you haven't added any active tasks, to do so please configure a care plan by clicking on{" "}
          <button onClick={onOpenSetPlan} className="font-semibold underline" style={{ color: T.primary }}>
            Set plan and activate
          </button>{" "}
          button.
        </div>
      ) : (
        <>
          <div className="text-[16px] font-semibold mb-4" style={{ color: T.black }}>To do</div>
          <div className="space-y-4">
            {todo.map((a) => <ActivityRow key={a.id} activity={a} onClick={() => onEditActivity(a.id)} />)}
            {todo.length === 0 && <div className="text-[15px]" style={{ color: T.muted }}>Nothing to do right now.</div>}
          </div>
        </>
      )}

      <div className="mt-8 mb-4 text-[16px] font-semibold" style={{ color: T.black }}>Resolved</div>
      {resolved.length === 0 ? (
        <div className="text-[15px]" style={{ color: T.muted }}>There are no resolved activities on your agenda.</div>
      ) : (
        <div className="space-y-4">
          {resolved.map((a) => <ActivityRow key={a.id} activity={a} onClick={() => onEditActivity(a.id)} />)}
        </div>
      )}
    </div>
  );
}

// A single team-panel row. The Case Manager is the only role rendered with
// the prominent teal avatar — everyone else (other roles, or someone just
// picked up via an activity assignment) gets the neutral gray treatment.
function TeamMemberRow({ name, label, prominent }) {
  return (
    <div
      className="flex items-center justify-between border min-h-[48px] px-[17px] py-4 rounded-[4px] relative overflow-hidden"
      style={{ borderColor: T.teamItemBorder, backgroundColor: T.cardBg }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: prominent ? T.primary : "#DCE3E8" }}
        >
          <User size={26} color={prominent ? "#fff" : T.gray500} />
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold truncate" style={{ color: T.black }}>{name}</div>
          <div className="text-[15px]" style={{ color: T.muted }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function TeamSummary({ team, activities, onAddTeam }) {
  const filled = team.filter((t) => t.memberId);
  const extra = extraActivityAssignees(activities, team);
  return (
    <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
      <SectionHeading>TEAM</SectionHeading>
      {filled.length === 0 && (
        <div className="rounded-[4px] p-4 mb-4" style={{ backgroundColor: T.cardBg }}>
          <div className="font-semibold text-[16px] mb-1" style={{ color: T.black }}>Please define the core team</div>
          <div className="text-[15px] mb-3 leading-[1.5]" style={{ color: T.muted }}>
            Every plan needs a core team. Do so by clicking on the button below or go to the Team tab.
          </div>
          <Btn small variant="outline" onClick={onAddTeam}>Add team members</Btn>
        </div>
      )}
      {(filled.length > 0 || extra.length > 0) && (
        <div className="space-y-4">
          {filled.map((t) => {
            const m = MEMBER_POOL.find((x) => x.id === t.memberId);
            return (
              <TeamMemberRow
                key={t.id}
                name={m.name}
                label={t.label}
                prominent={t.label === "Case manager"}
              />
            );
          })}
          {extra.map((m) => (
            <TeamMemberRow key={m.id} name={m.name} label={m.jobTitle} prominent={false} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoleCard({ role, roleLabel, onOpenAssign }) {
  const m = role?.memberId ? MEMBER_POOL.find((x) => x.id === role.memberId) : null;
  const prominent = !!m && role.label === "Case manager";
  return (
    <div
      className="w-64 border rounded-[4px] p-6 flex flex-col items-center text-center"
      style={{
        borderColor: m ? T.teamItemBorder : T.gray400,
        borderStyle: m ? "solid" : "dashed",
        backgroundColor: m ? T.cardBg : "#fff",
      }}
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: prominent ? T.primary : "#DCE3E8" }}>
        <User size={26} color={prominent ? "#fff" : T.gray500} />
      </div>
      <div className="font-semibold text-[15px] mb-0.5" style={{ color: T.black }}>{m ? m.name : "Add additional roles"}</div>
      <div className="text-[15px] mb-4" style={{ color: T.muted }}>{m ? role.label : "Please assign member a role"}</div>
      <Btn small variant="outline" onClick={() => onOpenAssign(roleLabel)}>{m ? "Re-Assign member" : "Select a role"}</Btn>
    </div>
  );
}

// Someone picked up via an activity assignment rather than a formal role —
// shown alongside the role cards, but read-only (no role slot to reassign).
function AssigneeCard({ member }) {
  return (
    <div className="w-64 border rounded-[4px] p-6 flex flex-col items-center text-center" style={{ borderColor: T.teamItemBorder, backgroundColor: T.cardBg }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "#DCE3E8" }}>
        <User size={26} color={T.gray500} />
      </div>
      <div className="font-semibold text-[15px] mb-0.5" style={{ color: T.black }}>{member.name}</div>
      <div className="text-[15px]" style={{ color: T.muted }}>{member.jobTitle}</div>
      <div className="text-[12px] mt-2" style={{ color: T.gray500 }}>Assigned via activity</div>
    </div>
  );
}

function TeamTab({ team, activities, onOpenAssign }) {
  const mandatory = team.filter((t) => t.group === "mandatory");
  const others = team.filter((t) => t.group === "others");
  const extra = extraActivityAssignees(activities, team);
  return (
    <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
      <div className="flex items-center justify-between mb-6">
        <div className="font-bold text-[20px] tracking-[0.8px] uppercase" style={{ color: T.black }}>TEAM</div>
        <button onClick={() => onOpenAssign(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: T.primary }} aria-label="Add role">
          <Plus size={16} />
        </button>
      </div>
      <div className="text-[16px] font-semibold mb-4" style={{ color: T.black }}>Mandatory</div>
      <div className="flex gap-6 mb-8 flex-wrap">
        {mandatory.map((r) => <RoleCard key={r.id} role={r} roleLabel={r.label} onOpenAssign={onOpenAssign} />)}
      </div>
      <div className="text-[16px] font-semibold mb-4" style={{ color: T.black }}>Others</div>
      <div className="flex gap-6 mb-8 flex-wrap">
        {others.map((r) => <RoleCard key={r.id} role={r} roleLabel={r.label} onOpenAssign={onOpenAssign} />)}
        <RoleCard role={null} roleLabel={null} onOpenAssign={onOpenAssign} />
      </div>
      {extra.length > 0 && (
        <>
          <div className="text-[16px] font-semibold mb-4" style={{ color: T.black }}>Assigned via activities</div>
          <div className="flex gap-6 flex-wrap">
            {extra.map((m) => <AssigneeCard key={m.id} member={m} />)}
          </div>
        </>
      )}
    </div>
  );
}

function StubCard({ title, desc, cta }) {
  return (
    <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
      <div className="font-bold text-[20px] tracking-[0.8px] uppercase mb-6" style={{ color: T.black }}>{title}</div>
      <div className="rounded-[4px] p-4 flex flex-col items-start gap-[7px]" style={{ backgroundColor: T.cardBg }}>
        <div className="font-semibold text-[18px] leading-[1.5]" style={{ color: T.black }}>{desc}</div>
        <div className="text-[15px] leading-[1.5]" style={{ color: T.muted }}>Not wired in this prototype.</div>
        <Btn small variant="outline" disabled className="mt-1">{cta}</Btn>
      </div>
    </div>
  );
}

/* ================= caremap detail ================= */

const TABS = ["Overview", "PZP", "Questionnaires", "Activities", "Comments", "Team", "Messages"];

function CaremapDetail({ caremap, back, onOpenSetPlan, onOpenAssign, onOpenAddActivity, onOpenEditActivity }) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <PatientBar back={back} />
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: T.light }}>
          <div className="px-8 py-6 flex items-start justify-between gap-6">
            <div className="leading-[1.2]" style={{ color: T.black }}>
              <div className="text-[24px] font-semibold leading-[1.2]">{caremap.title}</div>
              <div className="text-[15px] leading-[1.5] mt-1">
                <span className="font-semibold">Care focus:</span> {caremap.careFocus}
              </div>
            </div>
            {caremap.status === "draft" ? (
              <Btn variant="green" onClick={onOpenSetPlan}>Set plan and activate</Btn>
            ) : (
              <Btn variant="outline" onClick={onOpenSetPlan}>View plan settings</Btn>
            )}
          </div>

          <div className="px-8 flex gap-8 border-b" style={{ borderColor: T.border }}>
            {TABS.map((t) => {
              const key = t.toLowerCase();
              const active = key === tab;
              return (
                <button
                  key={t}
                  onClick={() => setTab(key)}
                  className="relative pb-3 pt-2 text-[15px]"
                  style={{ color: active ? T.primary : T.gray700, fontWeight: active ? 700 : 400 }}
                >
                  {t}
                  {active && (
                    <motion.span layoutId="caremap-tab-underline" className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ backgroundColor: T.primary }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-8">
            <div className="bg-white rounded-[4px] px-5 py-3 flex gap-10 mb-6 text-[15px]" style={{ boxShadow: T.cardShadow }}>
              {caremap.status === "active" ? (
                <>
                  <div><span className="font-semibold" style={{ color: T.black }}>Status&nbsp;&nbsp;</span><Badge tone="green">Active</Badge></div>
                  <div><span className="font-semibold" style={{ color: T.black }}>Start date&nbsp;&nbsp;</span><span style={{ color: T.muted }}>{caremap.startDate}</span></div>
                  <div><span className="font-semibold" style={{ color: T.black }}>Start date&nbsp;&nbsp;</span><span style={{ color: T.muted }}>{caremap.estimatedStartDate}</span></div>
                </>
              ) : (
                <div><span className="font-semibold" style={{ color: T.black }}>Status&nbsp;&nbsp;</span><Badge tone="gray">Draft</Badge></div>
              )}
            </div>

            {(tab === "overview" || tab === "activities") && (
              <div className="grid grid-cols-3 gap-6 items-start">
                <div className="col-span-2">
                  <ActivitiesPanel
                    activities={caremap.activities}
                    planConfigured={caremap.planConfigured}
                    onAdd={onOpenAddActivity}
                    onOpenSetPlan={onOpenSetPlan}
                    onEditActivity={onOpenEditActivity}
                  />
                </div>
                <div className="space-y-6">
                  <TeamSummary team={caremap.team} activities={caremap.activities} onAddTeam={() => onOpenAssign("Case manager")} />
                  <StubCard title="CLINICAL CONSULTANT" desc="Please add clinical consultant's details" cta="Add clinical consultant" />
                  <StubCard title="EMERGENCY CONTACT" desc="Add any emergency contacts if needed" cta="Add emergency contact" />
                  <StubCard title="ADDITIONAL INFORMATION" desc="Patient-related information" cta="Add additional information" />
                </div>
              </div>
            )}

            {tab === "team" && <TeamTab team={caremap.team} activities={caremap.activities} onOpenAssign={onOpenAssign} />}

            {["pzp", "questionnaires", "comments", "messages"].includes(tab) && (
              <div className="bg-white rounded border p-12 text-center text-[14px]" style={{ borderColor: T.border, color: T.gray600 }}>
                Not part of this prototype — mocked for the flow described in the brief.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= root app ================= */

export default function CaremapsPrototype() {
  const [screen, setScreen] = useState("start");
  const [caremap, setCaremap] = useState(null);
  const [modal, setModal] = useState(null); // 'create' | 'setPlan' | 'assign' | 'addActivity' | 'editActivity'
  const [assignFixedRole, setAssignFixedRole] = useState(null);
  const [editingActivityId, setEditingActivityId] = useState(null);

  const createCaremap = (unit, template) => {
    setCaremap({
      unit,
      template,
      title: `${template} Caremap`,
      careFocus: "Quality of life and symptom management, alongside ongoing medical follow-up",
      status: "draft",
      startDate: null,
      estimatedStartDate: null,
      planConfigured: false,
      planToggles: defaultPlanToggles(),
      activities: [],
      team: [{ id: "t-case-manager", label: "Case manager", group: "mandatory", memberId: null }],
    });
    setModal(null);
    setScreen("detail");
  };

  // "Save as Draft" and "Activate caremap" both apply the plan's mandatory +
  // toggled-on items to the Overview's activity list — this is what keeps
  // the Set Plan settings and the Overview in sync.
  const saveDraft = (toggles) => {
    setCaremap((c) => ({
      ...c,
      planConfigured: true,
      planToggles: toggles,
      activities: syncCaseManagerActivity(mergePlanIntoActivities(c.activities, toggles), c.team),
    }));
  };

  const activatePlan = (date, toggles) => {
    setCaremap((c) => {
      const start = formatDMY(date);
      const estimated = `${addMonthsDMY(date, 2)} (Estimated)`;
      return {
        ...c,
        status: "active",
        startDate: start,
        estimatedStartDate: estimated,
        planConfigured: true,
        planToggles: toggles,
        activities: syncCaseManagerActivity(mergePlanIntoActivities(c.activities, toggles), c.team),
      };
    });
  };

  const openAssign = (roleLabel) => {
    setAssignFixedRole(roleLabel);
    setModal("assign");
  };

  const handleAssign = (roleLabel, memberId) => {
    setCaremap((c) => {
      const existing = c.team.find((t) => t.label === roleLabel);
      let team;
      if (existing) {
        team = c.team.map((t) => (t.id === existing.id ? { ...t, memberId } : t));
      } else {
        team = [
          ...c.team,
          { id: `t-${Date.now()}`, label: roleLabel, group: roleLabel === "Case manager" ? "mandatory" : "others", memberId },
        ];
      }

      const activities = syncCaseManagerActivity(c.activities, team);

      return { ...c, team, activities };
    });
    setModal(null);
  };

  const addActivity = (form) => {
    setCaremap((c) => ({
      ...c,
      activities: [
        ...c.activities,
        {
          id: `a-${Date.now()}`,
          title: form.type,
          cadence: "(1/1)",
          status: form.status,
          assigneeId: form.assignee || null,
          comment: form.comment,
          provider: form.provider,
          ...form.fields,
        },
      ],
    }));
  };

  // Any activity — mandatory plan item or custom — can have its status (and
  // status-specific field) changed at any time via the edit modal.
  const updateActivity = (id, patch) => {
    setCaremap((c) => ({
      ...c,
      activities: c.activities.map((a) =>
        a.id === id
          ? { ...a, status: patch.status, provider: patch.provider, comment: patch.comment, assigneeId: patch.assigneeId, ...patch.fields }
          : a
      ),
    }));
  };

  const openEditActivity = (id) => {
    setEditingActivityId(id);
    setModal("editActivity");
  };

  const editingActivity = caremap?.activities.find((a) => a.id === editingActivityId) || null;

  return (
    <div style={{ fontFamily: T.fontFamily }}>
      {screen === "start" && (
        <HISShell hasCaremap={!!caremap} onCreate={() => setModal("create")} onOpen={() => setScreen("detail")} />
      )}
      {screen === "detail" && caremap && (
        <CaremapDetail
          caremap={caremap}
          back={() => setScreen("start")}
          onOpenSetPlan={() => setModal("setPlan")}
          onOpenAssign={openAssign}
          onOpenAddActivity={() => setModal("addActivity")}
          onOpenEditActivity={openEditActivity}
        />
      )}

      {modal === "create" && <CreateCaremapModal onClose={() => setModal(null)} onCreate={createCaremap} />}
      {modal === "setPlan" && caremap && (
        <SetPlanModal caremap={caremap} onClose={() => setModal(null)} onActivate={activatePlan} onSaveDraft={saveDraft} />
      )}
      {modal === "assign" && (
        <AssignRoleModal fixedRole={assignFixedRole} onClose={() => setModal(null)} onAssign={handleAssign} />
      )}
      {modal === "addActivity" && caremap && (
        <AddActivityModal onClose={() => setModal(null)} onAdd={addActivity} />
      )}
      {modal === "editActivity" && caremap && editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => setModal(null)}
          onSave={(patch) => updateActivity(editingActivity.id, patch)}
        />
      )}
    </div>
  );
}
