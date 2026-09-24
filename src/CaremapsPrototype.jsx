import { useState, useEffect, useCallback, useRef, useContext, createContext } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserSearch, Repeat, LayoutGrid, Bell, Stethoscope, UsersRound, FileText, BarChart3,
  History, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronDown, ChevronUp, ChevronRight, User,
  Plus, X, Search, Calendar, CalendarDays, FolderPlus, ClipboardList, Monitor, FileStack,
  CheckCircle2, XCircle, UserX, Pencil, Trash2, MoreHorizontal, CircleAlert,
  Check, Bold, Italic, Underline, Link2, ListOrdered, List, RotateCcw,
  MinusCircle, AlertTriangle, AlertCircle, ExternalLink, RefreshCw, ArrowUpDown, Filter, ArrowDown,
  HelpCircle, MessageSquare, ShieldAlert, ClipboardCheck, FileSignature, FlaskConical,
  ShieldCheck, FileX, LayoutList, LoaderCircle, Pill, ClipboardPlus, BriefcaseMedical, Flag,
  Accessibility, HeartPulse, House, Users, Armchair, Syringe, IdCard, Wallet, Settings, Grip,
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
  danger: "#DC5B5B",
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

// The single logged-in persona shown in TopHeader and attributed as the
// author of any comment this session posts.
const CURRENT_USER_NAME = "Dr. HENLEY, Maria";

/* ================= i18n (English / Dutch) ================= */
// Lightweight identity-key translation: t("English source text") looks up
// the Dutch string keyed by the exact English source and falls back to that
// same English text when missing or when `lang === "en"` — no i18n library,
// no separate key namespace to maintain. `t(str, context)` adds an optional
// scope prefix for the rare case where the same English word needs two
// different Dutch translations depending on where it's used (see "To").
// Product/module names (Caremap, PZP, Px360, MDT-as-abbreviation-in-titles)
// and proper nouns (patient/staff names, organisation names) are
// deliberately left untranslated, matching how Dutch healthcare software
// commonly keeps English module names even in a Dutch-language UI.
const LANG_STORAGE_KEY = "vitaly-caremaps-lang";

function loadSavedLang() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === "nl" ? "nl" : "en";
  } catch {
    return "en";
  }
}

function saveLang(lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // ignore — language just won't persist across reloads
  }
}

const NL = {
  // Sidebar / nav
  "Patients": "Patiënten",
  "Referrals": "Verwijzingen",
  "MDT meetings": "MDO-bijeenkomsten",
  "Tasks": "Taken",
  "Notifications": "Meldingen",
  "Unread": "Ongelezen",
  "No notifications yet.": "Nog geen meldingen.",
  "Select a notification to view it.": "Selecteer een melding om deze te bekijken.",
  "View caremap overview": "Caremap-overzicht bekijken",
  "Open in Messages": "Openen in Berichten",
  "Care services": "Zorgdiensten",
  "User management": "Gebruikersbeheer",
  "Integration logs": "Integratielogboeken",
  "Analytics": "Analyses",
  "Last view patients": "Laatst bekeken patiënten",
  "Collapse menu": "Menu inklappen",
  "Expand menu": "Menu uitklappen",

  // Account menu
  "Language": "Taal",
  "Switch persona": "Wissel van rol",
  "Reset demo": "Demo resetten",
  "Reset the demo? Everything you've entered will be cleared and the app will return to its starting state.":
    "Demo resetten? Alles wat u heeft ingevoerd wordt gewist en de app keert terug naar de beginstatus.",

  // Patient bar
  "CONTACTS": "CONTACTPERSONEN",
  "DOCUMENTS": "DOCUMENTEN",
  "REFERRAL": "VERWIJZING",
  "Back": "Terug",
  "14.03.1953 (73yrs) ‧ Male": "14.03.1953 (73 jaar) ‧ Man",

  // HIS shell (start screen)
  "Choose the application you would like to open": "Kies de applicatie die u wilt openen",
  "Create, manage, and review personalised care plans and patient preferences.":
    "Maak, beheer en bekijk persoonlijke zorgplannen en patiëntvoorkeuren.",
  "Advanced Care Planning (ACP)": "Proactieve Zorgplanning (PZP)",
  "Open plan": "Plan openen",
  "Multidisciplinary Team Meetings (MDT)": "Multidisciplinair teamoverleg (MDO)",
  "Coordinate and manage collaborative care discussions across healthcare teams.":
    "Coördineer en beheer gezamenlijke zorgoverleggen tussen zorgteams.",
  "New referral to MDT": "Nieuwe verwijzing naar MDO",
  "Show (3) referrals": "Toon (3) verwijzingen",
  "Access a complete, unified view of patient information, history, and activity.":
    "Krijg een volledig, samenhangend overzicht van patiëntinformatie, geschiedenis en activiteit.",
  "Open": "Openen",
  "Access patient-related documents and clinical files.": "Toegang tot patiëntgerelateerde documenten en klinische dossiers.",
  "Create new caremap": "Nieuw Caremap aanmaken",
  "Show (1) active caremap": "Toon (1) actieve Caremap",

  // Create Caremap modal
  "Create Caremap": "Caremap aanmaken",
  "Care unit": "Zorgeenheid",
  "Caremap template": "Caremap-sjabloon",
  "Close": "Sluiten",
  "Palliative Care": "Palliatieve zorg",
  "Oncology Care": "Oncologische zorg",
  "Chronic Disease Management": "Chronische ziekten management",
  "End of life care": "Zorg rond levenseinde",
  "End of Life care": "Zorg rond levenseinde",
  "Symptom management": "Symptoommanagement",
  "Bereavement support": "Rouwbegeleiding",
  "End of life care Caremap": "Zorg rond levenseinde Caremap",
  "Symptom management Caremap": "Symptoommanagement Caremap",
  "Bereavement support Caremap": "Rouwbegeleiding Caremap",
  "Quality of life and symptom management, alongside ongoing medical follow-up":
    "Kwaliteit van leven en symptoommanagement, naast doorlopende medische opvolging",

  // Set Plan modal
  "Set plan and activate caremap": "Plan instellen en Caremap activeren",
  "Setting the plan": "Het plan instellen",
  "Activate or configure the activities you would like to have in the patient's care map. All mandatory activities will be added to the care map plan by default. Once you activate the plan, you will not be able to change it anymore.":
    "Activeer of configureer de activiteiten die u in het zorgpad van de patiënt wilt opnemen. Alle verplichte activiteiten worden standaard aan het plan toegevoegd. Zodra u het plan activeert, kunt u het niet meer wijzigen.",
  "Mandatory": "Verplicht",
  "When will the plan start?": "Wanneer gaat het plan van start?",
  "All configured activities above will refer to the start date you set below. Start date is generally a surgery date or in case of no surgery, MDT meeting date or concluded therapy date.":
    "Alle hierboven geconfigureerde activiteiten verwijzen naar de startdatum die u hieronder instelt. De startdatum is doorgaans een operatiedatum, of bij het ontbreken daarvan de datum van het MDO of de afgeronde behandeling.",
  "Cancel": "Annuleren",
  "Save as Draft": "Opslaan als concept",
  "Activate caremap": "Caremap activeren",
  "Assign Case manager": "Casemanager toewijzen",
  "Record patient goals and whishes": "Doelen en wensen patiënt vastleggen",
  "Record treatment wishes": "Behandelwensen vastleggen",
  "Record emergency records": "Noodgegevens vastleggen",
  "Review PZP and existing advance directive": "PZP en bestaande wilsverklaring beoordelen",
  "Unassigned": "Niet toegewezen",
  "Case manager": "Casemanager",
  "At activation": "Bij activering",
  "Due: 2 days": "Termijn: 2 dagen",
  "Due: 1 week": "Termijn: 1 week",
  "Due: 2 weeks": "Termijn: 2 weken",
  "Every 3 weeks": "Elke 3 weken",

  // Assign role modal
  "Assign member a role": "Lid een rol toewijzen",
  "Assign member to role:": "Wijs lid toe aan rol:",
  "Search": "Zoeken",
  "Job title": "Functietitel",
  "First and last name": "Voor- en achternaam",
  "Organisation": "Organisatie",
  "Contact": "Contact",
  "No matching members.": "Geen overeenkomende leden.",
  "Assign a member": "Lid toewijzen",
  "Community nurse": "Wijkverpleegkundige",
  "Oncologist": "Oncoloog",
  "Physiotherapist": "Fysiotherapeut",
  "GP": "Huisarts",
  "Social worker": "Maatschappelijk werker",
  "Spiritual counsellor": "Geestelijk verzorger",
  "Medical Oncology": "Medische oncologie",
  "Neurology": "Neurologie",
  "Community Nurse": "Wijkverpleegkundige",

  // Status fields / activity modals
  "Please select": "Selecteer",
  "To do": "Te doen",
  "Resolved": "Afgerond",
  "Hour": "Tijd",
  "Location": "Locatie",
  "Undefined": "Niet gedefinieerd",
  "Requested": "Aangevraagd",
  "Planned": "Gepland",
  "Scheduled": "Ingepland",
  "Completed": "Voltooid",
  "Declined by patient": "Geweigerd door patiënt",
  "Cancelled": "Geannuleerd",
  "Set requested month": "Aangevraagde maand instellen",
  "Set planning month": "Geplande maand instellen",
  "Set date": "Datum instellen",
  "Set completed date": "Voltooiingsdatum instellen",
  "Set declined date": "Weigeringsdatum instellen",
  "Set cancelled date": "Annuleringsdatum instellen",
  "Assign to": "Toewijzen aan",
  "Select a provider first to see who's available to assign.": "Selecteer eerst een zorgaanbieder om te zien wie beschikbaar is.",
  "Add new activity": "Nieuwe activiteit toevoegen",
  "Activity type": "Type activiteit",
  "Select provider": "Zorgaanbieder selecteren",
  "Write your comment": "Schrijf uw opmerking",
  "Autosize height based on content lines": "Hoogte past zich automatisch aan",
  "Add document": "Document toevoegen",
  "Add Activity": "Activiteit toevoegen",
  "This is a mandatory plan activity — its status can still be changed at any time.":
    "Dit is een verplichte planactiviteit — de status kan nog altijd worden gewijzigd.",
  "Unspecified": "Niet gespecificeerd",
  "Save": "Opslaan",
  "Physiotherapy": "Fysiotherapie",
  "Pain management": "Pijnbestrijding",
  "Palliative nursing visit": "Palliatief verpleegkundig bezoek",
  "Spiritual counselling": "Geestelijke verzorging",
  "Social work consult": "Consult maatschappelijk werk",
  "Home care evaluation": "Evaluatie thuiszorg",
  "Refer the patient to the Multidisciplinary meeting (MDT)": "Patiënt doorverwijzen naar het multidisciplinair overleg (MDO)",

  // Clinical consultant
  "Clinical consultant": "Klinisch consulent",
  "Name": "Voornaam",
  "Surname": "Achternaam",
  "Phone number": "Telefoonnummer",
  "Email address": "E-mailadres",
  "Select job title": "Selecteer functietitel",
  "Remove": "Verwijderen",
  "Remove from team": "Verwijderen uit team",
  "Burns care": "Brandwondenzorg",
  "Oncology": "Oncologie",
  "Cardiology": "Cardiologie",
  "Palliative care": "Palliatieve zorg",
  "Surgery": "Chirurgie",
  "Other": "Overig",
  "CLINICAL CONSULTANT": "KLINISCH CONSULENT",
  "Please add clinical consultant's details": "Voeg de gegevens van de klinisch consulent toe",
  "Add clinical consultant": "Klinisch consulent toevoegen",
  "Not wired in this prototype.": "Niet functioneel in dit prototype.",

  // Emergency contact
  "Edit contact person": "Contactpersoon bewerken",
  "Add contact person": "Contactpersoon toevoegen",
  "Relation to patient": "Relatie tot patiënt",
  "First name": "Voornaam",
  "Last name": "Achternaam",
  "Telephone number": "Telefoonnummer",
  "Address": "Adres",
  "Spouse/Partner": "Echtgeno(o)t(e)/Partner",
  "Child": "Kind",
  "Parent": "Ouder",
  "Sibling": "Broer/zus",
  "Other family member": "Ander familielid",
  "Friend": "Vriend(in)",
  "Neighbour": "Buur",
  "EMERGENCY CONTACT": "NOODCONTACT",
  "Emergency contact": "Noodcontact",
  "Add any emergency contacts if needed": "Voeg indien nodig noodcontacten toe",
  "Add emergency contact": "Noodcontact toevoegen",
  "ADDITIONAL INFORMATION": "AANVULLENDE INFORMATIE",
  "Patient-related information": "Patiëntgerelateerde informatie",
  "Add additional information": "Aanvullende informatie toevoegen",

  // Overview / activities
  "ACTIVITIES": "ACTIVITEITEN",
  "It looks like you haven't added any active tasks, to do so please configure a care plan by clicking on":
    "Het lijkt erop dat u nog geen actieve taken heeft toegevoegd. Configureer een zorgplan door op de knop",
  "Set plan and activate": "Plan instellen en activeren",
  "button.": "te klikken.",
  "Nothing to do right now.": "Op dit moment niets te doen.",
  "There are no resolved activities on your agenda.": "Er zijn geen afgeronde activiteiten op uw agenda.",
  "My tasks": "Mijn taken",
  "All tasks": "Alle taken",

  // Team
  "Add team members": "Teamleden toevoegen",
  "Add additional members": "Extra leden toevoegen",
  "Please assign additional members": "Wijs extra leden toe",
  "Select a member": "Lid selecteren",
  "Assign a case manager": "Casemanager toewijzen",
  "Please assign a Case manager": "Wijs een casemanager toe",
  "Please assign member for a role": "Wijs een lid toe aan deze rol",
  "Re-Assign member": "Lid opnieuw toewijzen",
  "Assigned via activity": "Toegewezen via activiteit",
  "Created this care map": "Heeft deze Caremap aangemaakt",
  "Not defined": "Niet gedefinieerd",
  "Team member": "Teamlid",
  "Email": "E-mail",
  "Phone": "Telefoon",

  // PZP tab — sections
  "General information": "Algemene informatie",
  "Clinical context": "Klinische context",
  "Capacity and representation": "Wilsbekwaamheid en vertegenwoordiging",
  "What matters to the patient": "Wat is belangrijk voor de patiënt",
  "Treatment wishes and boundaries": "Behandelwensen en grenzen",
  "Anticipatory care arrangements": "Anticiperende zorgafspraken",

  // PZP tab — content (general)
  "Palliative phase marked": "Palliatieve fase gemarkeerd",
  "12 August 2026": "12 augustus 2026",
  "Reason for referral": "Reden voor verwijzing",
  "Progressive metastatic disease and declining functional status; goals-of-care conversation initiated by GP":
    "Progressieve gemetastaseerde ziekte en afnemende functionele status; gesprek over zorgdoelen gestart door huisarts",
  "Estimated life expectancy": "Geschatte levensverwachting",
  "Weeks to a few months": "Weken tot enkele maanden",
  "Preferred place of care": "Gewenste plaats van zorg",
  "At home, for as long as possible": "Thuis, zo lang mogelijk",
  "Preferred place of death": "Gewenste plaats van overlijden",
  "Home; hospice as fallback if home care becomes unsafe": "Thuis; hospice als terugvaloptie indien thuiszorg onveilig wordt",

  // PZP tab — content (clinical)
  "Main diagnosis": "Hoofddiagnose",
  "Metastatic non-small-cell lung cancer with recent progression": "Gemetastaseerd niet-kleincellig longcarcinoom met recente progressie",
  "Relevant comorbidity": "Relevante comorbiditeit",
  "Moderate COPD": "Matige COPD",
  "Current condition": "Huidige toestand",
  "Increasing breathlessness and fatigue, reduced appetite, weight loss and declining mobility":
    "Toenemende benauwdheid en vermoeidheid, verminderde eetlust, gewichtsverlies en afnemende mobiliteit",
  "Expected scenarios": "Verwachte scenario's",
  "Worsening breathlessness, respiratory infection, reduced mobility, increasing dependency and inability to remain safely at home":
    "Verergerende benauwdheid, luchtweginfectie, verminderde mobiliteit, toenemende afhankelijkheid en het niet langer veilig thuis kunnen blijven",
  "Patient's understanding": "Begrip van de patiënt",
  "Patient understands that the illness is not curable and that care is increasingly focused on comfort and quality of life":
    "Patiënt begrijpt dat de ziekte niet te genezen is en dat de zorg zich steeds meer richt op comfort en kwaliteit van leven",

  // PZP tab — content (capacity)
  "Mental capacity": "Wilsbekwaamheid",
  "Full decision-making capacity at present; to be reassessed if condition changes":
    "Op dit moment volledig wilsbekwaam; opnieuw te beoordelen bij verandering van toestand",
  "Legal representative": "Wettelijk vertegenwoordiger",
  "None formally appointed": "Niet formeel aangewezen",
  "Representative / contact person": "Vertegenwoordiger / contactpersoon",
  "Petra de Vries (spouse) — informal representative for medical decisions":
    "Petra de Vries (echtgenote) — informele vertegenwoordiger voor medische beslissingen",
  "Advance directive on file": "Wilsverklaring aanwezig",
  "Yes — treatment directive and euthanasia declaration registered with GP, 2024":
    "Ja — behandelverklaring en euthanasieverklaring geregistreerd bij huisarts, 2024",

  // PZP tab — content (wishes)
  "Priorities": "Prioriteiten",
  "Staying at home with his wife, remaining as independent as possible, avoiding hospital admission":
    "Thuis blijven bij zijn vrouw, zo zelfstandig mogelijk blijven, ziekenhuisopname vermijden",
  "Important relationships": "Belangrijke relaties",
  "Wife Petra, daughter Anne, and grandchildren": "Echtgenote Petra, dochter Anne, en kleinkinderen",
  "Meaningful activities": "Betekenisvolle activiteiten",
  "Reading, watching football, short walks in the garden": "Lezen, voetbal kijken, korte wandelingen in de tuin",
  "Main concerns": "Belangrijkste zorgen",
  "Becoming a burden on his family, and uncontrolled breathlessness or pain":
    "Een last worden voor zijn familie, en oncontroleerbare benauwdheid of pijn",

  // PZP tab — content (treatment)
  "Resuscitation (CPR)": "Reanimatie",
  "Not for resuscitation — agreed with patient and GP": "Niet reanimeren — afgesproken met patiënt en huisarts",
  "Hospital admission": "Ziekenhuisopname",
  "To be avoided where possible; acceptable only for a symptom crisis that can't be managed at home":
    "Waar mogelijk te vermijden; alleen acceptabel bij een symptoomcrisis die niet thuis kan worden behandeld",
  "Artificial nutrition and hydration": "Kunstmatige voeding en vocht",
  "Declined": "Geweigerd",
  "Antibiotics": "Antibiotica",
  "Oral antibiotics acceptable for comfort; IV antibiotics or hospital admission for infection declined":
    "Orale antibiotica acceptabel voor comfort; intraveneuze antibiotica of ziekenhuisopname voor infectie geweigerd",
  "Euthanasia": "Euthanasie",
  "Written declaration on file; no active request at this time": "Schriftelijke verklaring aanwezig; op dit moment geen actief verzoek",

  // PZP tab — content (anticipatory)
  "Emergency medication at home": "Noodmedicatie thuis",
  "Morphine and midazolam rescue kit prescribed and stored at the patient's home":
    "Morfine- en midazolam-noodset voorgeschreven en bewaard bij de patiënt thuis",
  "Out-of-hours plan": "Plan voor buiten kantooruren",
  "GP out-of-hours service and regional palliative advice line briefed": "Huisartsenpost en regionale palliatieve advieslijn geïnformeerd",
  "Key contacts on file": "Belangrijke contacten geregistreerd",
  "GP, Community Nurse, and Case manager": "Huisarts, wijkverpleegkundige en casemanager",
  "Next review": "Volgende evaluatie",
  "Reassess PZP monthly, or sooner after any hospital contact or MDT referral":
    "PZP maandelijks herbeoordelen, of eerder na ziekenhuiscontact of MDO-verwijzing",

  // Comments
  "Comments": "Opmerkingen",
  "No comments yet.": "Nog geen opmerkingen.",
  "Add comment": "Opmerking toevoegen",
  "Here you can write your thoughts regarding the patient treatment, ask questions, log calls or comment about anything else related to this caremap.":
    "Hier kunt u uw gedachten over de behandeling van de patiënt noteren, vragen stellen, telefoongesprekken loggen of iets anders over deze Caremap vermelden.",
  "Comment": "Opmerking",
  "Mark as important": "Markeren als belangrijk",
  "Submit": "Versturen",
  "Important": "Belangrijk",
  "Critical": "Kritiek",

  // Messages
  "Messages": "Berichten",
  "New message": "Nieuw bericht",
  "Awaiting response": "Wacht op reactie",
  "Show only critical": "Toon alleen kritiek",
  "No open threads.": "Geen open gesprekken.",
  "No resolved threads.": "Geen afgeronde gesprekken.",
  "No threads awaiting a response.": "Geen gesprekken die op een reactie wachten.",
  "Select a thread, or start a new message.": "Selecteer een gesprek, of start een nieuw bericht.",
  "Subject": "Onderwerp",
  "Subject title...": "Onderwerptitel...",
  "Message": "Bericht",
  "Type your message here...": "Typ hier uw bericht...",
  "Send": "Verzenden",
  "Resolve": "Afronden",
  "Type your reply...": "Typ uw antwoord...",
  "Send reply": "Antwoord verzenden",
  "Reply": "Reageren",
  "dateFilter:To": "Tot",
  "To": "Aan",
  "messageStatus:Open": "Open",

  // Caremap detail chrome
  "Start date": "Startdatum",
  "View plan settings": "Planinstellingen bekijken",
  "Care focus:": "Zorgfocus:",
  "Overview": "Overzicht",
  "Questionnaires": "Vragenlijsten",
  "Not part of this prototype — mocked for the flow described in the brief.":
    "Geen onderdeel van dit prototype — nagebootst voor de flow uit de briefing.",

  // Caremaps / Tasks list screens
  "My Caremaps": "Mijn Caremaps",
  "My Tasks": "Mijn Taken",
  "Active": "Actief",
  "Closed": "Gesloten",
  "Draft": "Concept",
  "Patient": "Patiënt",
  "Start": "Startdatum",
  "Task": "Taak",
  "Responsible person": "Verantwoordelijke",
  "Date": "Datum",
  "From": "Van",
  "All": "Alle",
  "Due:": "Termijn:",
  "Treatment summary appointment": "Afspraak behandelsamenvatting",
  "Virtual follow-up review": "Digitale vervolgcontrole",
  "Palliative Caremap": "Palliatieve Caremap",
  "No active caremaps match these filters.": "Geen actieve Caremaps komen overeen met deze filters.",
  "No closed caremaps match these filters.": "Geen gesloten Caremaps komen overeen met deze filters.",
  "No draft caremaps match these filters.": "Geen concept-Caremaps komen overeen met deze filters.",
  "No active tasks match these filters.": "Geen actieve taken komen overeen met deze filters.",
  "No resolved tasks match these filters.": "Geen afgeronde taken komen overeen met deze filters.",

  // PX360 — category headings and left rail (KLACHTEN EN DIAGNOSES already
  // shipped Dutch-only from the port; given an English base + NL pair here
  // so it actually follows the language toggle instead of always being Dutch)
  "Encounters": "Contactmomenten",
  "Complaints and diagnoses": "Klachten en diagnoses",
  "Treatment restrictions": "Behandelbeperkingen",

  // PX360 — sources panel
  "Sources": "Bronnen",
  "loaded": "geladen",
  "Fetch failed": "Ophalen mislukt",
  "No records found for this patient": "Geen gegevens gevonden voor deze patiënt",
  "fetching…": "ophalen…",
  "fetching more…": "meer ophalen…",

  // PX360 — status pills / sort / filters toolbar
  "Past": "Verleden",
  "Sort:": "Sorteren:",
  "Newest first": "Nieuwste eerst",
  "Oldest first": "Oudste eerst",
  "Filters": "Filters",
  "FILTERS": "FILTERS",
  "Arrived": "Aangekomen",
  "Encounter type": "Type contact",
  "Care provider": "Zorgverlener",
  "Search care provider": "Zoek zorgverlener",
  "Clear all filters": "Alle filters wissen",
  "Type": "Type",
  "No encounters match the selected filters.": "Geen contactmomenten komen overeen met de geselecteerde filters.",
  "No entries match the selected filters.": "Geen items komen overeen met de geselecteerde filters.",
  "Clear filters": "Filters wissen",
  "Show more": "Meer weergeven",
  "New entries available — click to update": "Nieuwe items beschikbaar — klik om bij te werken",
  "Loading first results…": "Eerste resultaten laden…",
  "Close filters": "Filters sluiten",
  "Refresh": "Vernieuwen",
  "Retry": "Opnieuw proberen",

  // PX360 — "All organisations" / "All time" dropdowns
  "All organisations": "Alle organisaties",
  "No organisations": "Geen organisaties",
  "organisations selected": "organisaties geselecteerd",
  "All time": "Alle tijd",
  "Last month": "Afgelopen maand",
  "Last 6 months": "Afgelopen 6 maanden",
  "Last year": "Afgelopen jaar",
  "Last 5 years": "Afgelopen 5 jaar",

  // PX360 — sources header summary line
  "Complete as of": "Volledig sinds",
  "Updated:": "Bijgewerkt:",

  // PX360 — encounter type filter checkboxes
  "Outpatient visits": "Poliklinische bezoeken",
  "Emergency": "Spoedeisende hulp",
  "Day treatment": "Dagbehandeling",
  "Therapy session": "Therapiesessie",
  "Teleconsult": "Teleconsult",

  // PX360 — diagnoses/treatment "Type" filter checkboxes (derived from the
  // part of each entry's label before "|", so these are the bare type words)
  "Diagnosis": "Diagnose",
  "Complaint": "Klacht",
  "Cardiopulmonary resuscitation": "Cardiopulmonale reanimatie",

  // PX360 — expanded-card field labels (Encounters/Diagnoses/Treatment share
  // DetailRow, so these cover all three)
  "Problem": "Probleem",
  "Vital signs": "Vitale functies",
  "Outcome": "Uitkomst",
  "Additional info": "Aanvullende informatie",
  "Status": "Status",
  "Explanation": "Toelichting",
  "Anatom. location": "Anatom. locatie",
  "Laterality": "Lateraliteit",
  "Verification status": "Verificatiestatus",
  "Limits": "Beperkingen",
  "Verified By": "Geverifieerd door",
  "Verification date": "Verificatiedatum",
  "ARRIVED": "AANGEKOMEN",
  "ACTIVE": "ACTIEF",
  "COMPLETED": "VOLTOOID",
  "Confirmed": "Bevestigd",
  "Right": "Rechts",
  "Patient and GP": "Patiënt en huisarts",

  // PX360 — mock encounter records (SOURCE_CONFIG entries), "Type | Detail"
  // format kept intact so genericDetail() can still split the translated
  // string the same way it splits the English one
  "Outpatient visit | Hypertension monitoring": "Poliklinisch bezoek | Bloeddrukcontrole",
  "Outpatient visit | Annual check-up": "Poliklinisch bezoek | Jaarlijkse controle",
  "Emergency | Acute breathlessness": "Spoedeisende hulp | Acute kortademigheid",
  "Outpatient visit | Pulmonology follow-up": "Poliklinisch bezoek | Longziekten controle",
  "Outpatient visit | Cardiology check": "Poliklinisch bezoek | Cardiologische controle",
  "Teleconsult | Medication adjustment": "Teleconsult | Medicatieaanpassing",
  "Outpatient visit | Endocrinology consultation": "Poliklinisch bezoek | Endocrinologisch consult",
  "Outpatient visit | Oncology follow-up": "Poliklinisch bezoek | Oncologische controle",
  "Day treatment | Chemotherapy session": "Dagbehandeling | Chemotherapiesessie",
  "Outpatient visit | Dermatology consultation": "Poliklinisch bezoek | Dermatologisch consult",
  "Imaging | CT chest": "Beeldvorming | CT thorax",
  "Outpatient visit | Geriatrics consultation": "Poliklinisch bezoek | Geriatrisch consult",
  "Teleconsult | Follow-up call": "Teleconsult | Vervolggesprek",
  "Outpatient visit | ENT consultation": "Poliklinisch bezoek | KNO-consult",
  "Emergency | Fall assessment": "Spoedeisende hulp | Valbeoordeling",
  "Outpatient visit | General internal medicine": "Poliklinisch bezoek | Interne geneeskunde",
  "Outpatient visit | COPD review": "Poliklinisch bezoek | COPD-controle",
  "Teleconsult | Vaccination advice": "Teleconsult | Vaccinatieadvies",
  "Outpatient visit | Rheumatology consultation": "Poliklinisch bezoek | Reumatologisch consult",
  "Outpatient visit | Cardiology consultation": "Poliklinisch bezoek | Cardiologisch consult",
  "Day treatment | Knee arthroscopy": "Dagbehandeling | Kniearthroscopie",

  // PX360 — hand-authored encounter details (m1, e1) and the generic fallback
  "Acute breathlessness, admitted for observation": "Acute kortademigheid, opgenomen ter observatie",
  "BP 140/85, weight 81 kg": "BD 140/85, gewicht 81 kg",
  "Oxygen therapy started, follow-up in 3 weeks": "Zuurstoftherapie gestart, controle over 3 weken",
  "Patient reports worsening breathlessness over several days": "Patiënt meldt toenemende kortademigheid gedurende enkele dagen",
  "Chest X-ray shows signs of infection": "Thoraxfoto toont tekenen van infectie",
  "Dr. R. Verhoeven (Emergency Medicine)": "Dr. R. Verhoeven (Spoedeisende geneeskunde)",
  "BP 130/85, weight 81 kg": "BD 130/85, gewicht 81 kg",
  "Hypertension monitoring": "Bloeddrukcontrole",
  "BP 138/86, weight 79 kg": "BD 138/86, gewicht 79 kg",
  "No changes in meds, follow-up in 3 weeks": "Geen wijzigingen in medicatie, controle over 3 weken",
  "Patient adherent to medication": "Patiënt therapietrouw",
  "Lifestyle advice reinforced": "Leefstijladvies herhaald",
  "Dr. A. Dijkstra (General Practitioner)": "Dr. A. Dijkstra (Huisarts)",
  "No changes, follow-up as scheduled": "Geen wijzigingen, controle volgens planning",

  // PX360 — Diagnoses/Treatment mock content
  "Diagnosis | Metastatic non-small-cell lung carcinoma": "Diagnose | Gemetastaseerd niet-kleincellig longcarcinoom",
  "Diagnosis | Moderate COPD": "Diagnose | Matige COPD",
  "Diagnosis | Type 2 Diabetes Mellitus": "Diagnose | Diabetes mellitus type 2",
  "Complaint | Chronic pain limiting mobility": "Klacht | Chronische pijn met mobiliteitsbeperking",
  "Metastatic non-small-cell lung cancer with recent progression, discussed at MDT.":
    "Gemetastaseerd niet-kleincellig longcarcinoom met recente progressie, besproken in MDO.",
  "Lung, right upper lobe": "Long, rechter bovenkwab",
  "Moderate COPD, GOLD stage II-III, oxygen-dependent on exertion.": "Matige COPD, GOLD-stadium II-III, zuurstofafhankelijk bij inspanning.",
  "Lungs (bilateral)": "Longen (beiderzijds)",
  "Type 2 diabetes mellitus, diet and oral medication controlled.": "Diabetes mellitus type 2, onder controle met dieet en orale medicatie.",
  "Chronic pain limiting mobility.": "Chronische pijn met mobiliteitsbeperking.",
  "Knee": "Knie",
  "Cardiopulmonary resuscitation | Yes, but with limitations": "Cardiopulmonale reanimatie | Ja, met beperkingen",
  "Cardiopulmonary resuscitation | Not for resuscitation": "Cardiopulmonale reanimatie | Niet reanimeren",
  "First consult with wife": "Eerst overleg met echtgenote",
  "Agreed with patient and GP as part of the palliative care plan": "Overeengekomen met patiënt en huisarts als onderdeel van het palliatieve zorgplan",

  // Documents tab — screen chrome, filters, table
  "Documents": "Documenten",
  "Document name": "Documentnaam",
  "Document type": "Documenttype",
  "Author": "Auteur",
  "Format": "Formaat",
  "Type search term": "Typ zoekterm",
  "No documents match the selected filters.": "Geen documenten komen overeen met de geselecteerde filters.",
  "New documents available — click to update": "Nieuwe documenten beschikbaar — klik om bij te werken",

  // Documents tab — left-rail categories
  "Allergies & Safety": "Allergieën & Veiligheid",
  "Assessments": "Beoordelingen",
  "Clinical Notes": "Klinische notities",
  "Care Plans & Orders": "Zorgplannen & Opdrachten",
  "Consents & Legal": "Toestemmingen & Juridisch",
  "Diagnostics & Results": "Diagnostiek & Resultaten",
  "Encounters & Episodes": "Contactmomenten & Episodes",
  "Insurance & Coverage": "Verzekering & Dekking",
  "Post-Mortem": "Post-mortem",

  // Documents tab — mock document names (palliative-care-flavored; "Patient
  // consent" and "Professional summary" are the two the user specifically
  // asked to include)
  "CRC MDT report": "CRC MDT-verslag",
  "Uro Onco report": "Uro-onco verslag",
  "X-ray Chest": "Röntgenfoto borstkas",
  "X-ray Lung": "Röntgenfoto longen",
  "Cardiac MDT report": "Cardiaal MDT-verslag",
  "Palliative care admission request": "Aanvraag opname palliatieve zorg",
  "Discharge summary": "Ontslagbrief",
  "Palliative care progress note": "Voortgangsnotitie palliatieve zorg",
  "Allergy list": "Allergieënlijst",
  "Palliative nursing note": "Verpleegkundige notitie palliatieve zorg",
  "Treatment consent form": "Toestemmingsformulier behandeling",
  "Lab results": "Laboratoriumresultaten",
  "Patient consent": "Toestemming patiënt",
  "Insurance card": "Verzekeringspas",
  "Professional summary": "Professionele samenvatting",

  // Documents tab — mock document types
  "MDT final report": "MDT eindverslag",
  "DICOM image": "DICOM-beeld",
  "Admission request": "Aanvraag opname",
  "Clinical note": "Klinische notitie",
  "Allergy record": "Allergieregistratie",
  "Consent record": "Toestemmingsregistratie",
  "Lab report": "Laboratoriumrapport",
  "Insurance record": "Verzekeringsgegevens",
  "Clinical summary": "Klinische samenvatting",
};

const LanguageContext = createContext({ lang: "en", t: (str) => str });

function useLanguage() {
  return useContext(LanguageContext);
}

/* ================= demo persistence (localStorage) ================= */
// Practice-mode persistence for demo rehearsal: the app's real state
// (screen, the live caremap, which persona is switched in) autosaves to the
// browser's localStorage so a reload doesn't lose progress. There's no
// backend, so this is deliberately just a JSON blob under one key — not a
// general-purpose data layer.
const DEMO_STORAGE_KEY = "vitaly-caremaps-demo-v1";

function loadSavedDemoState() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDemoState(state) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — practice session
    // just won't persist across reloads; nothing else depends on it.
  }
}

function clearSavedDemoState() {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/* ================= mock data ================= */

const MEMBER_POOL = [
  { id: "m1", name: "Dr. Emily Carter", jobTitle: "Medical Oncology", org: "Erasmus MC – Endoscopy Unit", email: "emily.carter@erasmus.nl", phone: "+31 6 12 34 56 01" },
  { id: "m2", name: "Dr. Felix Hartmann", jobTitle: "Neurology", org: "St. Antonius Hospital", email: "fhartmann@antonious.nl", phone: "+31 6 12 34 56 02" },
  { id: "m3", name: "Dr. Ethan Carter", jobTitle: "Medical Oncology", org: "St. Antonius Hospital", email: "ecarter@antonious.nl", phone: "+31 6 12 34 56 03" },
  { id: "m4", name: "Dr. Sophia Reynolds", jobTitle: "Medical Oncology", org: "St. Antonius Hospital", email: "sreynolds@antonious.nl", phone: "+31 6 12 34 56 04" },
  { id: "m5", name: "Dr. Clara Mitchell", jobTitle: "Physiotherapist", org: "St. Antonius Hospital", email: "cmitchell@antonious.nl", phone: "+31 6 12 34 56 05" },
  { id: "m6", name: "Dr. Alex Thompson", jobTitle: "Neurology", org: "St. Antonius Hospital", email: "thompson@antonious.nl", phone: "+31 6 12 34 56 06" },
  { id: "m7", name: "Dr. Robert Hamilton", jobTitle: "Oncologist", org: "St. Antonius Hospital", email: "rhamilton@antonious.nl", phone: "+31 6 12 34 56 07" },
  { id: "m8", name: "Mary Brown", jobTitle: "Community Nurse", org: "Regional Homecare", email: "mary.brown@homecare.nl", phone: "+31 6 12 34 56 08" },
  { id: "m9", name: "Mike Myers", jobTitle: "Physiotherapist", org: "UMC Utrecht - Physiotherapy", email: "mmyers@umcu.nl", phone: "+31 6 12 34 56 09" },
  { id: "m10", name: "Dr. Mark Southerland", jobTitle: "GP", org: "Huisartsenpraktijk Zuid", email: "msoutherland@gp.nl", phone: "+31 6 12 34 56 10" },
  { id: "m11", name: "Sanne de Groot", jobTitle: "Physiotherapist", org: "UMC Utrecht - Physiotherapy", email: "sdegroot@umcu.nl", phone: "+31 6 12 34 56 11" },
  { id: "m12", name: "James Wilson", jobTitle: "Community Nurse", org: "Regional Homecare", email: "james.wilson@homecare.nl", phone: "+31 6 12 34 56 12" },
  { id: "m13", name: "Anna de Boer", jobTitle: "GP", org: "Huisartsenpraktijk Zuid", email: "adeboer@gp.nl", phone: "+31 6 12 34 56 13" },
];

// Switchable personas for the account menu — lets the prototype demonstrate
// how different roles see different slices of the same data. "dr-henley" is
// the default, unfiltered view (today's behavior, `org: null` so nothing
// filters against it); the other two are real MEMBER_POOL identities, so
// their `org` lines up with `provider` on activities and
// `PROVIDERS`/staffForProvider elsewhere in the app.
const PERSONAS = [
  { id: "dr-henley", name: CURRENT_USER_NAME, role: "GP", org: null },
  { id: "m8", name: "Mary Brown", role: "Community Nurse", org: "Regional Homecare" },
  { id: "m9", name: "Mike Myers", role: "Physiotherapist", org: "UMC Utrecht - Physiotherapy" },
];

// Each provider's own staff, used to populate "Assign to" once a provider
// is selected on an activity — assigning is about who at that provider
// does the work, not who's on the caremap's core team.
function staffForProvider(provider) {
  return MEMBER_POOL.filter((m) => m.org === provider);
}

// Job titles realistically eligible to act as Case Manager (GPs and
// community nurses, matching who plays that role in the reference
// screenshots) — the "Assign Case manager" task's "Assign to" only offers
// these, not the full staff roster.
const CASE_MANAGER_JOB_TITLES = ["GP", "Community Nurse"];
const CASE_MANAGER_CANDIDATES = MEMBER_POOL.filter((m) => CASE_MANAGER_JOB_TITLES.includes(m.jobTitle));

// Job title options for the free-text "Clinical consultant" stub card — a
// separate, unaffiliated contact, not sourced from MEMBER_POOL.
const CONSULTANT_JOB_TITLES = ["Burns care", "Oncology", "Cardiology", "Neurology", "Palliative care", "Surgery", "Other"];

// Relation options for the "Emergency contact" stub card's add/edit form.
const EMERGENCY_CONTACT_RELATIONS = ["Spouse/Partner", "Child", "Parent", "Sibling", "Other family member", "Friend", "Neighbour", "Other"];

// PZP ("Persoonlijk Zorgplan" / personal care plan) tab — dev-mode node
// 12593-359461. Read-only reference content for the single hardcoded
// patient, same "mock content" treatment as MEMBER_POOL/MOCK_CAREMAPS
// elsewhere; the header's edit icon is decorative, matching other
// not-wired controls in this prototype (see docs/features/pzp-tab.md).
const PZP_SECTIONS = [
  { key: "general", label: "General information" },
  { key: "clinical", label: "Clinical context" },
  { key: "capacity", label: "Capacity and representation" },
  { key: "wishes", label: "What matters to the patient" },
  { key: "treatment", label: "Treatment wishes and boundaries" },
  { key: "anticipatory", label: "Anticipatory care arrangements" },
];

const PZP_CONTENT = {
  general: [
    { label: "Palliative phase marked", value: "12 August 2026" },
    { label: "Reason for referral", value: "Progressive metastatic disease and declining functional status; goals-of-care conversation initiated by GP" },
    { label: "Estimated life expectancy", value: "Weeks to a few months" },
    { label: "Preferred place of care", value: "At home, for as long as possible" },
    { label: "Preferred place of death", value: "Home; hospice as fallback if home care becomes unsafe" },
  ],
  clinical: [
    { label: "Main diagnosis", value: "Metastatic non-small-cell lung cancer with recent progression" },
    { label: "Relevant comorbidity", value: "Moderate COPD" },
    { label: "Current condition", value: "Increasing breathlessness and fatigue, reduced appetite, weight loss and declining mobility" },
    { label: "Expected scenarios", value: "Worsening breathlessness, respiratory infection, reduced mobility, increasing dependency and inability to remain safely at home" },
    { label: "Patient's understanding", value: "Patient understands that the illness is not curable and that care is increasingly focused on comfort and quality of life" },
  ],
  capacity: [
    { label: "Mental capacity", value: "Full decision-making capacity at present; to be reassessed if condition changes" },
    { label: "Legal representative", value: "None formally appointed" },
    { label: "Representative / contact person", value: "Petra de Vries (spouse) — informal representative for medical decisions" },
    { label: "Advance directive on file", value: "Yes — treatment directive and euthanasia declaration registered with GP, 2024" },
  ],
  wishes: [
    { label: "Priorities", value: "Staying at home with his wife, remaining as independent as possible, avoiding hospital admission" },
    { label: "Important relationships", value: "Wife Petra, daughter Anne, and grandchildren" },
    { label: "Meaningful activities", value: "Reading, watching football, short walks in the garden" },
    { label: "Main concerns", value: "Becoming a burden on his family, and uncontrolled breathlessness or pain" },
  ],
  treatment: [
    { label: "Resuscitation (CPR)", value: "Not for resuscitation — agreed with patient and GP" },
    { label: "Hospital admission", value: "To be avoided where possible; acceptable only for a symptom crisis that can't be managed at home" },
    { label: "Artificial nutrition and hydration", value: "Declined" },
    { label: "Antibiotics", value: "Oral antibiotics acceptable for comfort; IV antibiotics or hospital admission for infection declined" },
    { label: "Euthanasia", value: "Written declaration on file; no active request at this time" },
  ],
  anticipatory: [
    { label: "Emergency medication at home", value: "Morphine and midazolam rescue kit prescribed and stored at the patient's home" },
    { label: "Out-of-hours plan", value: "GP out-of-hours service and regional palliative advice line briefed" },
    { label: "Key contacts on file", value: "GP, Community Nurse, and Case manager" },
    { label: "Next review", value: "Reassess PZP monthly, or sooner after any hospital contact or MDT referral" },
  ],
};

const ACTIVITY_TYPES = ["Physiotherapy", "Pain management", "Palliative nursing visit", "Spiritual counselling", "Social work consult", "Home care evaluation", "Refer the patient to the Multidisciplinary meeting (MDT)"];
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
  { id: "sp3", label: "Record patient goals and whishes", assignee: "Unassigned", sub: "Due: 1 week", cadence: "(1/1)", toggle: true, defaultOn: false },
  { id: "sp4", label: "Record treatment wishes", assignee: "Unassigned", sub: "Due: 2 weeks", cadence: "(1/1)", toggle: true, defaultOn: false },
  { id: "sp5", label: "Record emergency records", assignee: "Unassigned", sub: "Due: 1 week", cadence: "(1/5)", toggle: true, defaultOn: false },
  { id: "sp6", label: "Review PZP and existing advance directive", assignee: "Unassigned", sub: "Every 3 weeks", cadence: "(1/5)", toggle: true, defaultOn: false },
];

const PLAN_ITEM_IDS = new Set(SET_PLAN_ITEMS.map((i) => i.id));
const CASE_MANAGER_ACTIVITY_ID = "sp1";

// Decorative rows for the Caremaps list (dev-mode node 12686-376699) — other
// patients this single-patient prototype has no real data for. The live
// caremap created in-session (if any) is prepended on top of these with real
// data, so assigning a Case Manager is reflected in the list for real.
const MOCK_CAREMAPS = [
  { id: "cm-1", patientName: "DE VRIES, Jan", patientMeta: "ID 5402170622  -  18/09/1957", gender: "male", type: "End of Life care", caseManager: null, startISO: "2026-06-26", status: "draft" },
  { id: "cm-2", patientName: "KOWALSKA, Anna", patientMeta: "ID 5402170622  -  18/09/1948", gender: "female", type: "Oncology Care", caseManager: "Mary Brown", startISO: "2026-06-24", status: "active" },
  { id: "cm-3", patientName: "DE VRIES, Jan", patientMeta: "ID 5402170622  -  18/09/1957", gender: "male", type: "Oncology Care", caseManager: "Robert Hamilton", startISO: "2026-06-23", status: "active" },
  { id: "cm-4", patientName: "HARMON, Emilia", patientMeta: "ID 5402170622  -  18/09/1951", gender: "female", type: "End of Life care", caseManager: "Oliver Nelson", startISO: "2026-06-18", status: "active" },
  { id: "cm-5", patientName: "KLEIN, Calvin", patientMeta: "ID 5402170622  -  18/09/1952", gender: "male", type: "End of Life care", caseManager: "Mary Brown", startISO: "2026-05-21", status: "active" },
  { id: "cm-6", patientName: "TIMBERLAND, Alex", patientMeta: "ID 5402170622  -  18/09/1952", gender: "male", type: "End of Life care", caseManager: "Robert Hamilton", startISO: "2026-03-04", status: "closed" },
];

const CAREMAP_LIST_TABS = ["Active", "Closed", "Draft"];

// Decorative rows for the Tasks list (dev-mode node 12595-364368) — same
// pattern as MOCK_CAREMAPS: other patients this prototype has no real
// activities for. `due` is a month string ("2026-09") for month-grain
// statuses (Requested/Planned) or a full ISO date for Scheduled, matching
// STATUS_CONFIG's own field.type per status.
const MOCK_TASKS = [
  { id: "tk-1", patientName: "MATT EVANS, Leroy", patientMeta: "ID 5402170622  -  16/08/1940", gender: "female", task: "Physiotherapy", caremapTitle: "Palliative Caremap", responsible: null, status: "required", due: "2026-09" },
  { id: "tk-2", patientName: "BAUER, Fredric", patientMeta: "ID 5402170622  -  18/09/1957", gender: "male", task: "Treatment summary appointment", caremapTitle: "Palliative Caremap", responsible: "Mary Brown", status: "scheduled", due: "2026-09-21" },
  { id: "tk-3", patientName: "ROSAIRE, Carry", patientMeta: "ID 5402170622  -  18/09/1986", gender: "female", task: "Virtual follow-up review", caremapTitle: "Palliative Caremap", responsible: "Robert Hamilton", status: "scheduled", due: "2026-09-21" },
  { id: "tk-4", patientName: "HARMON, Emilia", patientMeta: "ID 5402170622  -  18/09/1986", gender: "female", task: "Virtual follow-up review", caremapTitle: "Palliative Caremap", responsible: "Oliver Nelson", status: "scheduled", due: "2026-08-16" },
  { id: "tk-5", patientName: "KLEIN, Calvin", patientMeta: "ID 5402170622  -  18/09/1986", gender: "male", task: "Treatment summary appointment", caremapTitle: "Palliative Caremap", responsible: "Mary Brown", status: "scheduled", due: "2026-09-21" },
  { id: "tk-6", patientName: "TIMBERLAND, Alex", patientMeta: "ID 5402170622  -  18/09/1986", gender: "male", task: "Physiotherapy", caremapTitle: "Palliative Caremap", responsible: "Robert Hamilton", status: "scheduled", due: "2026-09-21" },
];

const TASK_LIST_TABS = ["Active", "Resolved"];

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
  scheduled: { label: "Scheduled", group: "todo", tone: "outline", field: { key: "scheduledDate", label: "Set date", type: "date" }, extra: true },
  completed: { label: "Completed", group: "resolved", field: { key: "completedDate", label: "Set completed date", type: "date" } },
  declined: { label: "Declined by patient", group: "resolved", field: { key: "declinedDate", label: "Set declined date", type: "date" } },
  cancelled: { label: "Cancelled", group: "resolved", field: { key: "cancelledDate", label: "Set cancelled date", type: "date" } },
};
const TODO_STATUSES = ["undefined", "required", "planned", "scheduled"];
const RESOLVED_STATUSES = ["completed", "declined", "cancelled"];
const ALL_STATUSES = [...TODO_STATUSES, ...RESOLVED_STATUSES];

// Assignee is available for every task status.
const NO_ASSIGNEE_STATUSES = [];

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

// Keeps the "Assign Case manager" to-do item in sync with whether the Care
// Manager role actually has a member assigned yet — in both directions:
// flips to completed once assigned, and back to undefined if that
// assignment is later removed (see handleRemoveTeamMember), so a removed
// Case Manager doesn't leave a stale "done" task behind.
function syncCaseManagerActivity(activities, team) {
  const hasCaseManager = !!team.find((t) => t.label === "Case manager")?.memberId;
  return activities.map((a) => {
    if (a.id !== CASE_MANAGER_ACTIVITY_ID) return a;
    if (hasCaseManager && a.status !== "completed") {
      return { ...a, status: "completed", completedDate: a.completedDate || todayISO() };
    }
    if (!hasCaseManager && a.status === "completed") {
      const { completedDate, ...rest } = a;
      return { ...rest, status: "undefined" };
    }
    return a;
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDMY(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
function formatFieldValue(type, value, lang = "en") {
  if (!value) return null;
  if (type === "month") {
    const [y, m] = value.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", { month: "long", year: "numeric" });
  }
  return formatDMY(value);
}

// Every comment/message is posted within the current session, so "Today at
// HH:MM" is always accurate — no need for relative-date logic across days.
function formatTimeLabel(iso, lang = "en") {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return lang === "nl" ? `Vandaag om ${hh}:${mm}` : `Today at ${hh}:${mm}`;
}

/* ================= building blocks ================= */

function Badge({ children, tone = "gray" }) {
  const { t } = useLanguage();
  const tones = {
    gray: { backgroundColor: T.gray600, color: "#fff" },
    teal: { backgroundColor: T.primary, color: "#fff" },
    green: { backgroundColor: T.success, color: "#fff" },
    warning: { backgroundColor: T.warning, color: "#fff" },
    info: { backgroundColor: "rgba(0,128,163,0.11)", color: T.primary },
    outline: { backgroundColor: "#fff", color: T.primary, border: `1px solid ${T.primary}` },
  };
  return (
    <span
      className="px-[8px] py-[4px] rounded-full text-[12px] font-bold tracking-[1px] uppercase shrink-0"
      style={tones[tone]}
    >
      {typeof children === "string" ? t(children) : children}
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
    danger: { backgroundColor: "#fff", color: T.danger, border: `1px solid ${T.danger}` },
  };
  return (
    <button type={type} className={`${base} ${size} ${className}`} style={variants[variant]} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, width = 640 }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(0,50,75,0.55)" }}>
      <div className="bg-white rounded-md shadow-2xl flex flex-col" style={{ width, maxWidth: "94vw", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: T.border }}>
          <h3 className="font-bold tracking-wide text-[15px] uppercase" style={{ color: T.secondary }}>{t(title)}</h3>
          <button onClick={onClose} aria-label={t("Close")}>
            <X size={18} style={{ color: T.gray600 }} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  const { t } = useLanguage();
  return (
    <div className="mb-4">
      <label className="block text-[15px] font-semibold mb-1.5" style={{ color: T.black }}>
        {t(label)} {required && <span style={{ color: "#DC5B5B" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// Smaller, gray-600 label variant used above the Caremaps list's filter row —
// visually distinct from Field's black modal-form label per the dev-mode spec.
// Always scoped as "dateFilter" so its "To" label (a date-range end) doesn't
// collide with NewMessageForm's unrelated "To" (message recipient) — the
// only two labels that share literal English text but need different Dutch
// translations anywhere in this app.
function FilterField({ label, children }) {
  const { t } = useLanguage();
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-[14px] font-semibold mb-1" style={{ color: T.gray600 }}>{t(label, "dateFilter")}</label>
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

// Order and icons pulled from the Caremap-navigation dev-mode node
// (12988-9661) rather than approximated.
const NAV_ITEMS = [
  { icon: UserSearch, label: "Patients" },
  { icon: Repeat, label: "Referrals" },
  { icon: LayoutGrid, label: "MDT meetings" },
  { icon: FolderPlus, label: "Caremaps" },
  { icon: ClipboardList, label: "Tasks" },
  { icon: Bell, label: "Notifications" },
  { icon: Stethoscope, label: "Care services" },
  { icon: UsersRound, label: "User management" },
  { icon: Monitor, label: "Integration logs" },
  { icon: BarChart3, label: "Analytics" },
];

// `activeLabel` highlights whichever nav item matches the current screen
// (Caremaps detail/list both count as "Caremaps"); `onNavigate(label)` fires
// for every item, but only labels the root app actually wires up (Caremaps,
// Tasks, Notifications) do anything — the rest stay inert stubs, same as
// before. The logo itself also fires `onNavigate("Home")`, for demo purposes
// only — jumping back to the HIS/EMR start screen without resetting any demo
// progress.
//
// `collapsed`/`onToggleCollapse` come from root state (like `persona` does)
// rather than being local to this component, so the collapsed/expanded
// choice survives navigating between top-level screens — each one mounts
// its own fresh `<Sidebar>` instance (they're mutually exclusive `screen`
// values), so component-local state here would silently reset on every
// navigation instead of feeling like a persistent layout preference. Not
// written to `localStorage`, though — resets on a page reload, same as most
// other transient UI state in this app (unlike the actual demo-progress
// fields `demo-persistence.md` covers).
function Sidebar({ activeLabel = "Caremaps", onNavigate, unreadCount = 0, collapsed, onToggleCollapse }) {
  const { t } = useLanguage();
  return (
    <div
      className={`${collapsed ? "w-20" : "w-64"} shrink-0 flex flex-col text-white transition-[width] duration-200`}
      style={{ backgroundColor: T.secondary }}
    >
      <button
        className={`flex items-center pt-6 pb-12 ${collapsed ? "justify-center px-0" : "px-4"}`}
        onClick={() => onNavigate?.("Home")}
        aria-label="Back to start screen"
      >
        {collapsed ? (
          // Crops the same PNG down to just its square teal symbol (the
          // wordmark sits to the right in the source asset) rather than
          // shipping a second logo file — a fixed-width `overflow-hidden`
          // window onto the full image, left-aligned so only the symbol
          // shows. 36px wide covers it with a hair of margin before the
          // wordmark would start (checked against the actual asset).
          <div className="w-9 h-9 overflow-hidden shrink-0">
            <img src={vitalyLogo} alt="OpenLine Vitaly" className="h-9 w-auto max-w-none" />
          </div>
        ) : (
          <img src={vitalyLogo} alt="OpenLine Vitaly" className="h-9 w-auto" />
        )}
      </button>
      <nav className="flex-1">
        {NAV_ITEMS.map(({ icon: Icon, label }) => {
          const active = label === activeLabel;
          return (
            <button
              key={label}
              onClick={() => onNavigate?.(label)}
              aria-label={t(label)}
              className={`w-full h-12 flex items-center text-[15px] text-left transition-colors hover:bg-white/10 ${collapsed ? "justify-center px-0" : "gap-4 px-4"}`}
              style={active ? { backgroundColor: T.primary, color: "#fff", fontWeight: 600 } : { color: "rgba(255,255,255,0.8)" }}
            >
              <span className="relative shrink-0">
                <Icon size={24} />
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </span>
              {!collapsed && t(label)}
            </button>
          );
        })}
      </nav>
      <button
        aria-label={t("Last view patients")}
        className={`w-full h-12 flex items-center text-[15px] text-left hover:bg-white/10 ${collapsed ? "justify-center px-0" : "gap-4 px-4"}`}
        style={{ color: "rgba(255,255,255,0.8)" }}
      >
        <History size={24} className="shrink-0" /> {!collapsed && t("Last view patients")}
      </button>
      <button
        onClick={onToggleCollapse}
        aria-label={t(collapsed ? "Expand menu" : "Collapse menu")}
        className={`w-full h-12 flex items-center text-[15px] text-left hover:bg-white/10 ${collapsed ? "justify-center px-0" : "gap-4 px-4"}`}
        style={{ backgroundColor: T.dark }}
      >
        {collapsed ? <ChevronsRight size={24} className="shrink-0" /> : <ChevronsLeft size={24} className="shrink-0" />}
        {!collapsed && t("Collapse menu")}
      </button>
    </div>
  );
}

// Simple EN/NL segmented toggle — lives inside the account menu, under its
// own "Language" section.
function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center rounded-full border overflow-hidden text-[13px] font-bold shrink-0" style={{ borderColor: T.border }}>
      {["en", "nl"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-2.5 py-1"
          style={lang === l ? { backgroundColor: T.primary, color: "#fff" } : { color: T.gray600, backgroundColor: "#fff" }}
          aria-pressed={lang === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Click-to-open switcher standing in for real auth — swaps which persona is
// "logged in" so the Tasks/Caremaps lists can demonstrate role-based
// filtering (see TasksListScreen/CaremapsListScreen's `persona` handling).
function AccountMenu({ persona, onSwitchPersona, onReset, caseManagerPersonaId }) {
  const [open, setOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const { t } = useLanguage();
  const caseManagerPersona = caseManagerPersonaId ? PERSONAS.find((p) => p.id === caseManagerPersonaId) : null;
  return (
    <div className="relative">
      <button className="flex items-center gap-3" onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}>
        <span className="w-8 h-8 rounded-full flex items-center justify-center p-1" style={{ backgroundColor: T.lightBg }}>
          <User size={24} style={{ color: T.gray700 }} />
        </span>
        <span className="text-[15px] font-semibold whitespace-nowrap" style={{ color: T.bodyText }}>{persona.name}</span>
        <ChevronDown size={24} style={{ color: T.gray700 }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[4px] border overflow-hidden z-50"
            style={{ borderColor: T.border, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
          >
            <div className="px-4 py-2 text-[12px] font-bold uppercase tracking-wide border-b" style={{ color: T.gray600, backgroundColor: T.light, borderColor: T.border }}>
              {t("Case manager")}
            </div>
            {caseManagerPersona ? (
              <button
                onClick={() => { onSwitchPersona(caseManagerPersona.id); setOpen(false); }}
                className="w-full text-left px-4 py-3 flex flex-col hover:bg-[rgba(0,0,0,0.03)] border-b"
                style={{ borderColor: T.border, ...(caseManagerPersona.id === persona.id ? { backgroundColor: "rgba(0,128,163,0.08)" } : {}) }}
              >
                <span className="text-[14px] font-semibold" style={{ color: caseManagerPersona.id === persona.id ? T.primary : T.black }}>
                  {caseManagerPersona.name}
                </span>
                <span className="text-[12px]" style={{ color: T.gray600 }}>
                  {t(caseManagerPersona.role)}{caseManagerPersona.org ? ` · ${caseManagerPersona.org}` : ""}
                </span>
              </button>
            ) : (
              <div className="px-4 py-3 text-[13px] border-b" style={{ color: T.muted, borderColor: T.border }}>
                {t("Please assign a Case manager")}
              </div>
            )}
            <div className="px-4 py-2 text-[12px] font-bold uppercase tracking-wide" style={{ color: T.gray600, backgroundColor: T.light }}>
              {t("Switch persona")}
            </div>
            {PERSONAS.map((p) => {
              const active = p.id === persona.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { onSwitchPersona(p.id); setOpen(false); }}
                  className="w-full text-left px-4 py-3 flex flex-col hover:bg-[rgba(0,0,0,0.03)]"
                  style={active ? { backgroundColor: "rgba(0,128,163,0.08)" } : {}}
                >
                  <span className="text-[14px] font-semibold" style={{ color: active ? T.primary : T.black }}>{p.name}</span>
                  <span className="text-[12px]" style={{ color: T.gray600 }}>{t(p.role)}{p.org ? ` · ${p.org}` : ""}</span>
                </button>
              );
            })}
            <div className="px-4 py-2 text-[12px] font-bold uppercase tracking-wide border-t" style={{ color: T.gray600, backgroundColor: T.light, borderColor: T.border }}>
              {t("Language")}
            </div>
            <div className="px-4 py-3 border-b" style={{ borderColor: T.border }}>
              <LanguageToggle />
            </div>
            <div className="border-t" style={{ borderColor: T.border }}>
              <button
                onClick={() => {
                  setOpen(false);
                  setConfirmingReset(true);
                }}
                className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-[rgba(0,0,0,0.03)]"
              >
                <RotateCcw size={16} style={{ color: T.danger }} />
                <span className="text-[14px] font-semibold" style={{ color: T.danger }}>{t("Reset demo")}</span>
              </button>
            </div>
          </div>
        </>
      )}
      {confirmingReset && (
        <Modal title="Reset demo" onClose={() => setConfirmingReset(false)} width={420}>
          <div className="text-[14px] leading-relaxed mb-6" style={{ color: T.bodyText }}>
            {t("Reset the demo? Everything you've entered will be cleared and the app will return to its starting state.")}
          </div>
          <div className="flex justify-end gap-3">
            <Btn variant="neutral" onClick={() => setConfirmingReset(false)}>{t("Cancel")}</Btn>
            <Btn variant="danger" onClick={() => { setConfirmingReset(false); onReset(); }}>{t("Reset demo")}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TopHeader({ title = "Patients", onAdd, persona = PERSONAS[0], onSwitchPersona, onReset, unreadCount = 0, onOpenNotifications, caseManagerPersonaId }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b" style={{ borderColor: T.border }}>
      <div className="flex items-center gap-2">
        <h1 className="text-[24px] font-semibold leading-[1.2]" style={{ color: T.black }}>{t(title)}</h1>
        {onAdd && (
          <button aria-label={`Add ${title.toLowerCase()}`} onClick={onAdd}>
            <Plus size={24} style={{ color: T.primary }} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-9">
        <div className="flex items-center gap-4">
          <button className="relative" onClick={onOpenNotifications} aria-label={t("Notifications")}>
            <Bell size={24} style={{ color: T.primary }} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />}
          </button>
        </div>
        <span className="w-px h-6" style={{ backgroundColor: T.border }} />
        <AccountMenu persona={persona} onSwitchPersona={onSwitchPersona} onReset={onReset} caseManagerPersonaId={caseManagerPersonaId} />
      </div>
    </div>
  );
}

const PATIENT_TABS = ["PX360", "CONTACTS", "DOCUMENTS", "REFERRAL", "CAREMAPS"];

// `activeTab` defaults to "CAREMAPS" (the original, only-ever-active state);
// `onTabClick(tab)` fires for every tab, but only "PX360" is wired anywhere
// (navigates to the Px360Screen) — the rest stay inert, same convention as
// Sidebar's NAV_ITEMS.
function PatientBar({ back, activeTab = "CAREMAPS", onTabClick }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-stretch border-b bg-white min-h-[94px]" style={{ borderColor: T.border }}>
      <button onClick={back} className="flex items-center px-1" aria-label={t("Back")}>
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
          <div className="text-[15px]" style={{ color: T.gray700 }}>{t("14.03.1953 (73yrs) ‧ Male")}</div>
        </div>
      </div>
      <div className="flex-1 flex items-stretch justify-end gap-8 px-8">
        {PATIENT_TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabClick?.(tab)}
              className={`relative flex items-center text-[14px] tracking-wide ${active ? "font-bold" : "font-normal"}`}
              style={{ color: active ? T.primary : T.gray700 }}
            >
              {t(tab)}
              {active && <span className="absolute left-0 right-0 bottom-0 h-[3px]" style={{ backgroundColor: T.primary }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================= PX360 (ported from vitaly-encounters-prototype) =================
   Native port of that sibling prototype's Encounters simulation — same source-loading
   mechanics (delays, pagination, merge-on-arrival), reusing this app's own
   Sidebar/TopHeader/PatientBar chrome instead of duplicating a second one. Mock encounter
   content was adjusted from the original (a 16-year-old's sports-injury/pediatric visits)
   to fit De Vries, Jan — dates/delays/counts/org names are otherwise untouched so the
   loading behavior demonstrated is identical. The other BgZ categories are static record
   lists (PX360_CATEGORIES) — see docs/features/px360-tab.md. */

// Each fetch returns at most FETCH_PAGE of a source's entries (latest first),
// mimicking server-side pagination. `entries` is the full server-side dataset.
const FETCH_PAGE = 10;

const SOURCE_CONFIG = [
  {
    id: "gp-linde",
    name: "GP Practice de Linde, Amersfoort",
    delayMs: () => 3000 + Math.random() * 2000,
    outcome: "loaded",
    entries: [
      { id: "e1", date: "22/08/2025", sortDate: "2025-08-22", label: "Outpatient visit | Hypertension monitoring", source: "GP Practice de Linde, Amersfoort" },
      { id: "e11", date: "12/01/2024", sortDate: "2024-01-12", label: "Outpatient visit | Annual check-up", source: "GP Practice de Linde, Amersfoort" },
    ],
  },
  {
    // Primary hospital for this patient — has more records than one fetch returns
    id: "maastricht",
    name: "Maastricht UMC+",
    delayMs: () => 4500 + Math.random() * 2500,
    outcome: "loaded",
    entries: [
      { id: "m1", date: "16/08/2025 - 20/08/2025", sortDate: "2025-08-20", label: "Emergency | Acute breathlessness", source: "Maastricht UMC+ (+1)" },
      { id: "m2", date: "02/07/2025", sortDate: "2025-07-02", label: "Outpatient visit | Pulmonology follow-up", source: "Maastricht UMC+" },
      { id: "m3", date: "18/03/2025", sortDate: "2025-03-18", label: "Outpatient visit | Cardiology check", source: "Maastricht UMC+" },
      { id: "m4", date: "05/01/2025", sortDate: "2025-01-05", label: "Teleconsult | Medication adjustment", source: "Maastricht UMC+" },
      { id: "m5", date: "22/11/2024", sortDate: "2024-11-22", label: "Outpatient visit | Endocrinology consultation", source: "Maastricht UMC+" },
      { id: "m6", date: "09/06/2024", sortDate: "2024-06-09", label: "Outpatient visit | Oncology follow-up", source: "Maastricht UMC+" },
      { id: "m7", date: "15/04/2024", sortDate: "2024-04-15", label: "Day treatment | Chemotherapy session", source: "Maastricht UMC+" },
      { id: "m8", date: "28/01/2024", sortDate: "2024-01-28", label: "Outpatient visit | Dermatology consultation", source: "Maastricht UMC+" },
      { id: "m9", date: "12/10/2023", sortDate: "2023-10-12", label: "Imaging | CT chest", source: "Maastricht UMC+" },
      { id: "m10", date: "03/08/2023", sortDate: "2023-08-03", label: "Outpatient visit | Geriatrics consultation", source: "Maastricht UMC+" },
      { id: "m11", date: "19/05/2023", sortDate: "2023-05-19", label: "Teleconsult | Follow-up call", source: "Maastricht UMC+" },
      { id: "m12", date: "07/02/2023", sortDate: "2023-02-07", label: "Outpatient visit | ENT consultation", source: "Maastricht UMC+" },
      { id: "m13", date: "21/09/2022", sortDate: "2022-09-21", label: "Emergency | Fall assessment", source: "Maastricht UMC+" },
      { id: "m14", date: "30/04/2022", sortDate: "2022-04-30", label: "Outpatient visit | General internal medicine", source: "Maastricht UMC+" },
      { id: "m15", date: "12/11/2021", sortDate: "2021-11-12", label: "Outpatient visit | COPD review", source: "Maastricht UMC+" },
      { id: "m16", date: "03/06/2021", sortDate: "2021-06-03", label: "Teleconsult | Vaccination advice", source: "Maastricht UMC+" },
    ],
  },
  {
    // Used to always fail on first fetch, succeeding only on a manual retry
    // — deliberately reverted to a plain success. This app isn't meant to
    // demonstrate what a failed fetch looks like; that's covered by the
    // sibling vitaly-encounters-prototype repo instead. See decision log.
    id: "umcu",
    name: "UMC Utrecht",
    delayMs: () => 6000 + Math.random() * 2500,
    outcome: "loaded",
    entries: [
      { id: "u1", date: "05/09/2024", sortDate: "2024-09-05", label: "Outpatient visit | Rheumatology consultation", source: "UMC Utrecht" },
    ],
  },
  {
    id: "mumc",
    name: "MUMC+",
    delayMs: () => 3500 + Math.random() * 2000,
    outcome: "empty",
    entries: [],
  },
  {
    id: "erasmus",
    name: "Erasmus MC",
    delayMs: () => 14000 + Math.random() * 10000,
    outcome: "loaded",
    entries: [
      { id: "e14", date: "30/09/2024", sortDate: "2024-09-30", label: "Outpatient visit | Cardiology consultation", source: "Erasmus MC" },
      { id: "e3", date: "14/07/2023", sortDate: "2023-07-14", label: "Day treatment | Knee arthroscopy", source: "Erasmus MC" },
    ],
  },
];

// Mock clinical detail data shown when an encounter card is expanded.
// Multi-source merges (e.g. "Maastricht UMC+ (+1)") get one detail block per
// contributing organization; conflicting values get a hover comparison.
const ENCOUNTER_DETAILS = {
  m1: [
    {
      org: "MAASTRICHT UMC+",
      date: "16/08/2025",
      problem: "Acute breathlessness, admitted for observation",
      vitals: "BP 140/85, weight 81 kg",
      vitalsConflict: [
        { org: "Maastricht UMC+", value: "140/85" },
        { org: "Tergooi", value: "130/85" },
      ],
      outcome: "Oxygen therapy started, follow-up in 3 weeks",
      additional1: "Patient reports worsening breathlessness over several days",
      additional2: "Chest X-ray shows signs of infection",
      careProvider: "Dr. R. Verhoeven (Emergency Medicine)",
      status: "ARRIVED",
    },
    {
      org: "TERGOOI",
      date: "16/08/2025",
      problem: "Acute breathlessness, admitted for observation",
      vitals: "BP 130/85, weight 81 kg",
      vitalsConflict: [
        { org: "Maastricht UMC+", value: "140/85" },
        { org: "Tergooi", value: "130/85" },
      ],
      outcome: "/",
      additional1: "/",
      additional2: "/",
      careProvider: "/",
      status: "ARRIVED",
    },
  ],
  e1: [
    {
      org: "GP PRACTICE DE LINDE, AMERSFOORT",
      date: "22/08/2025",
      problem: "Hypertension monitoring",
      vitals: "BP 138/86, weight 79 kg",
      outcome: "No changes in meds, follow-up in 3 weeks",
      additional1: "Patient adherent to medication",
      additional2: "Lifestyle advice reinforced",
      careProvider: "Dr. A. Dijkstra (General Practitioner)",
      status: "ARRIVED",
    },
  ],
};

// Fallback for encounters without hand-authored detail data above.
// `t` is passed in (rather than calling useLanguage() here — this is a
// plain function, not a component) so the fallback "problem" text is built
// from the *translated* label, splitting on "|" the same way the English
// version does; every NL label translation above deliberately keeps "|" in
// the same position for exactly this reason.
function genericDetail(item, t) {
  const parts = t(item.label).split("|").map((s) => s.trim());
  const org = item.source.replace(/\s*\(\+\d+\)\s*$/, "");
  return [
    {
      org: org.toUpperCase(),
      date: item.date.split(" - ")[0],
      problem: parts[1] || parts[0],
      vitals: null,
      outcome: "No changes, follow-up as scheduled",
      additional1: "—",
      additional2: "—",
      careProvider: "Dr. A. Dijkstra (General Practitioner)",
      status: "ARRIVED",
    },
  ];
}

// Encounter-type checkboxes offered in the filter drawer, and how they map
// onto the "Type | Detail" label prefix each mock entry already has.
const FILTER_TYPES = [
  { key: "outpatient", label: "Outpatient visits", test: (p) => p.startsWith("Outpatient visit") },
  { key: "emergency", label: "Emergency", test: (p) => p.startsWith("Emergency") },
  { key: "day-treatment", label: "Day treatment", test: (p) => p.startsWith("Day treatment") },
  { key: "therapy", label: "Therapy session", test: (p) => p.startsWith("Therapy session") },
  { key: "teleconsult", label: "Teleconsult", test: (p) => p.startsWith("Teleconsult") },
];

function encounterTypeKey(item) {
  const prefix = item.label.split("|")[0].trim();
  return FILTER_TYPES.find((t) => t.test(prefix))?.key ?? null;
}

// Which SOURCE_CONFIG source contributed a given item — used by the
// "All organisations" global filter (looked up rather than stored on the
// item, so the merge-on-arrival data shape doesn't need to change).
// Every encounter on the server across all sources — the "Past (N)" pill count.
// (All mock encounters are in the past.) Used to be a hardcoded 24 carried over
// from the original prototype, which didn't match the 19 records actually here.
const ENCOUNTER_TOTAL = SOURCE_CONFIG.reduce((sum, s) => sum + s.entries.length, 0);

function sourceIdForItem(item) {
  return SOURCE_CONFIG.find((s) => s.entries.some((e) => e.id === item.id))?.id;
}

const TIME_OPTIONS = [
  { key: "all", label: "All time" },
  { key: "month", label: "Last month" },
  { key: "6months", label: "Last 6 months" },
  { key: "year", label: "Last year" },
  { key: "5years", label: "Last 5 years" },
];

function withinTimeWindow(item, timeFilter) {
  if (timeFilter === "all") return true;
  const days = { month: 31, "6months": 186, year: 366, "5years": 366 * 5 }[timeFilter];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(item.sortDate) >= cutoff;
}

function orgFilterLabel(selected, t) {
  if (selected.size === SOURCE_CONFIG.length) return t("All organisations");
  if (selected.size === 0) return t("No organisations");
  if (selected.size <= 2) return SOURCE_CONFIG.filter((s) => selected.has(s.id)).map((s) => s.name).join(", ");
  return `${selected.size} ${t("organisations selected")}`;
}

// Shared close-on-outside-click behavior for the header dropdowns.
function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [active, ref, onOutside]);
}

function formatClock(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const iconSpring = { type: "spring", stiffness: 550, damping: 30 };
const cardSpring = { type: "spring", stiffness: 420, damping: 34 };

// Crossfades between per-state icons in a fixed 17px box so rows never shift.
function StatusIcon({ state }) {
  const icons = {
    loading: <span className="block w-[17px] h-[17px] border-2 border-[#CED4DA] border-t-[#0080A3] rounded-full animate-spin" />,
    loaded: <CheckCircle2 size={17} style={{ color: T.success }} />,
    empty: <MinusCircle size={17} style={{ color: T.gray500 }} />,
    failed: <AlertTriangle size={17} className="text-red-600" />,
  };
  return (
    <span className="relative block w-[17px] h-[17px] shrink-0">
      <AnimatePresence initial={false}>
        <motion.span
          key={state}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.3 }}
          transition={iconSpring}
        >
          {icons[state]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Crossfades inline content (e.g. "fetching…" → timestamp) keyed by state.
function FadeSwap({ id, className, children }) {
  return (
    <span className={className}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={id}
          className="inline-flex items-center"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Renders "Maastricht UMC+ (+1)" with the "(+1)" count in bold primary,
// signalling that this card merges records from more than one organization.
function SourceLabel({ source }) {
  const match = source.match(/^(.*?)\s*(\(\+\d+\))$/);
  if (!match) return <span>{source}</span>;
  return (
    <span>
      {match[1]} <span className="font-bold" style={{ color: T.primary }}>{match[2]}</span>
    </span>
  );
}

// Hover comparison shown on a vital-sign value that disagrees across the
// organizations contributing to a merged encounter.
function VitalsWarning({ comparisons }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <AlertCircle size={16} style={{ color: T.warning, fill: T.warning, stroke: "#fff" }} />
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 rounded-md text-white text-[13px] whitespace-nowrap shadow-lg"
            style={{ backgroundColor: T.secondary }}
          >
            {comparisons.map((c, i) => (
              <div key={i}>{c.org}: {c.value}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function DetailRow({ label, children }) {
  const { t } = useLanguage();
  if (children === null || children === undefined) return null;
  return (
    <div className="flex items-start gap-4 py-1 text-[13px]">
      <span className="w-[120px] shrink-0" style={{ color: T.gray600 }}>{t(label)}</span>
      <span className="flex items-center gap-1.5 flex-wrap" style={{ color: T.bodyText }}>{children}</span>
    </div>
  );
}

// `muted` is for ended states (resolved/stopped) — gray instead of green.
function StatusBadge({ children, muted }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
      style={{ backgroundColor: muted ? T.lightBg : "#E4F0E0", color: muted ? T.gray600 : T.success }}
    >
      {children}
    </span>
  );
}

// One organization's contribution to an (expanded) encounter card. Merged
// encounters render one of these per contributing source.
function OrgDetailBlock({ detail, isFirst }) {
  const { t } = useLanguage();
  return (
    <div className={`px-4 py-3 ${isFirst ? "" : "border-t border-white"}`} style={{ backgroundColor: T.light }}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[12px] font-bold tracking-wide" style={{ color: T.bodyText }}>{detail.org}</span>
        <span className="text-[13px]" style={{ color: T.gray600 }}>{detail.date}</span>
      </div>
      <DetailRow label="Problem">
        {t(detail.problem)}
        {detail.problem && <ExternalLink size={13} style={{ color: T.primary }} />}
      </DetailRow>
      <DetailRow label="Vital signs">
        {detail.vitals && (
          <>
            {t(detail.vitals)}
            <ExternalLink size={13} style={{ color: T.primary }} />
            {detail.vitalsConflict && <VitalsWarning comparisons={detail.vitalsConflict} />}
          </>
        )}
      </DetailRow>
      <div className="my-2 border-t" style={{ borderColor: T.border }} />
      <DetailRow label="Outcome">{t(detail.outcome)}</DetailRow>
      <DetailRow label="Additional info">{t(detail.additional1)}</DetailRow>
      <DetailRow label="Additional info">{t(detail.additional2)}</DetailRow>
      <DetailRow label="Care provider">{t(detail.careProvider)}</DetailRow>
      <div className="flex items-start gap-4 py-1 text-[13px]">
        <span className="w-[120px] shrink-0" style={{ color: T.gray600 }}>{t("Status")}</span>
        <StatusBadge>{t(detail.status)}</StatusBadge>
      </div>
    </div>
  );
}

// PX360's left-rail categories follow the Dutch BgZ (Basisgegevensset Zorg)
// sections — the same list the "Edit dashboard" Figma frame (12326-242709)
// offers. Order puts the categories the two user-research groups ranked as
// most relevant (doctors; nurses/administration) first, then the rest of BgZ.
// Encounters is the only live-paginated category (SOURCE_CONFIG above); every
// other category is a static record list, but all of them share Encounters'
// 5-source fetch simulation for the loading/settled experience (SourcesHeader).
//
// Record shape: `label` is "Type | Detail" (the part before "|" doubles as the
// Filters drawer's "Type" unless `type` overrides it — every NL translation
// keeps the "|" in place), `source` must be one of SOURCE_CONFIG's names so
// the Sources panel can count it (MUMC+ always returns empty, so nothing
// here comes from it), `phase` picks which status pill the record sits under,
// and `detail` is the expanded card's field list, rendered generically by
// RecordDetailBlock. Content is authored around this patient's palliative
// story — metastatic lung cancer + COPD, the PZP tab's treatment wishes,
// his wife Petra and daughter Anne — so every category reads as one person.
const DIAGNOSIS_ENTRIES = [
  {
    id: "d1",
    date: "18/03/2026",
    source: "Erasmus MC",
    label: "Diagnosis | Metastatic non-small-cell lung carcinoma",
    phase: "active",
    detail: [
      { label: "Explanation", value: "Metastatic non-small-cell lung cancer with recent progression, discussed at MDT." },
      { label: "Anatom. location", value: "Lung, right upper lobe" },
      { label: "Laterality", value: "Right" },
      { label: "Verification status", value: "Confirmed" },
      { label: "Status", value: "ACTIVE" },
      { label: "Date", value: "18/03/2026" },
    ],
  },
  {
    id: "d2",
    date: "12/11/2021",
    source: "Maastricht UMC+",
    label: "Diagnosis | Moderate COPD",
    phase: "active",
    detail: [
      { label: "Explanation", value: "Moderate COPD, GOLD stage II-III, oxygen-dependent on exertion." },
      { label: "Anatom. location", value: "Lungs (bilateral)" },
      { label: "Verification status", value: "Confirmed" },
      { label: "Status", value: "ACTIVE" },
      { label: "Date", value: "12/11/2021" },
    ],
  },
  {
    id: "d3",
    date: "08/10/2025",
    source: "UMC Utrecht",
    label: "Diagnosis | Type 2 Diabetes Mellitus",
    phase: "active",
    detail: [
      { label: "Explanation", value: "Type 2 diabetes mellitus, diet and oral medication controlled." },
      { label: "Verification status", value: "Confirmed" },
      { label: "Status", value: "ACTIVE" },
      { label: "Date", value: "08/10/2025" },
    ],
  },
  {
    id: "d5",
    date: "16/08/2025",
    source: "Maastricht UMC+",
    label: "Diagnosis | Community-acquired pneumonia",
    phase: "resolved",
    detail: [
      { label: "Explanation", value: "Right lower lobe pneumonia during an admission for acute breathlessness; treated with oral antibiotics." },
      { label: "Anatom. location", value: "Lung, right lower lobe" },
      { label: "Laterality", value: "Right" },
      { label: "Verification status", value: "Confirmed" },
      { label: "Status", value: "RESOLVED" },
      { label: "Date", value: "16/08/2025" },
    ],
  },
  {
    id: "d4",
    date: "10/07/2025",
    source: "UMC Utrecht",
    label: "Complaint | Chronic pain limiting mobility",
    phase: "resolved",
    detail: [
      { label: "Explanation", value: "Chronic pain limiting mobility." },
      { label: "Anatom. location", value: "Knee" },
      { label: "Laterality", value: "Right" },
      { label: "Verification status", value: "Confirmed" },
      { label: "Status", value: "RESOLVED" },
      { label: "Date", value: "10/07/2025" },
    ],
  },
];

// BgZ "Behandelaanwijzingen": a 2023 "with limitations" CPR record superseded
// by the 2026 palliative-phase decisions, which match the PZP tab's "Treatment
// wishes and boundaries" section word-for-word where they overlap.
const RESTRICTION_ENTRIES = [
  {
    id: "r1",
    date: "10/06/2023",
    source: "GP Practice de Linde, Amersfoort",
    label: "Cardiopulmonary resuscitation | Yes, but with limitations",
    phase: "previous",
    permitted: true,
    tone: "danger",
    detail: [
      { label: "Limits", value: "First consult with wife" },
      { label: "Verified By", value: "Patient" },
      { label: "Verification date", value: "10/06/2023" },
    ],
  },
  {
    id: "r2",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Cardiopulmonary resuscitation | Not for resuscitation",
    phase: "current",
    permitted: false,
    tone: "danger",
    detail: [
      { label: "Limits", value: "Agreed with patient and GP as part of the palliative care plan" },
      { label: "Verified By", value: "Patient and GP" },
      { label: "Verification date", value: "12/08/2026" },
    ],
  },
  {
    id: "r3",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Artificial ventilation | Not desired",
    phase: "current",
    tone: "danger",
    detail: [
      { label: "Limits", value: "No intubation or ICU admission" },
      { label: "Verified By", value: "Patient and GP" },
      { label: "Verification date", value: "12/08/2026" },
    ],
  },
  {
    id: "r4",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Artificial nutrition and hydration | Declined",
    phase: "current",
    tone: "danger",
    detail: [
      { label: "Limits", value: "Comfort feeding only" },
      { label: "Verified By", value: "Patient and GP" },
      { label: "Verification date", value: "12/08/2026" },
    ],
  },
  {
    id: "r5",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Antibiotics | Oral only",
    phase: "current",
    tone: "danger",
    detail: [
      { label: "Limits", value: "Oral antibiotics acceptable for comfort; IV antibiotics or hospital admission for infection declined" },
      { label: "Verified By", value: "Patient and GP" },
      { label: "Verification date", value: "12/08/2026" },
    ],
  },
];

const ALLERGY_ENTRIES = [
  {
    id: "alg1",
    date: "14/05/2019",
    source: "GP Practice de Linde, Amersfoort",
    label: "Medication | Penicillin",
    phase: "active",
    severity: "high",
    tone: "danger",
    detail: [
      { label: "Reaction", value: "Urticaria and facial swelling" },
      { label: "Severity", value: "Severe" },
      { label: "Criticality", value: "High" },
      { label: "Verification status", value: "Confirmed" },
      { label: "Status", value: "ACTIVE" },
    ],
  },
  {
    id: "alg2",
    date: "12/10/2023",
    source: "Maastricht UMC+",
    label: "Medication | Iodinated contrast medium",
    phase: "active",
    severity: "moderate",
    detail: [
      { label: "Reaction", value: "Generalised rash after CT chest" },
      { label: "Severity", value: "Moderate" },
      { label: "Criticality", value: "Low" },
      { label: "Verification status", value: "Confirmed" },
      { label: "Status", value: "ACTIVE" },
    ],
  },
  {
    id: "alg3",
    date: "20/02/2024",
    source: "Erasmus MC",
    label: "Medication | Codeine (intolerance)",
    phase: "active",
    severity: "moderate",
    detail: [
      { label: "Reaction", value: "Severe nausea and vomiting" },
      { label: "Severity", value: "Moderate" },
      { label: "Criticality", value: "Low" },
      { label: "Verification status", value: "Confirmed" },
      { label: "Status", value: "ACTIVE" },
    ],
  },
  {
    id: "alg4",
    date: "03/06/2021",
    source: "Maastricht UMC+",
    label: "Environmental | Wasp venom",
    phase: "resolved",
    severity: "low",
    detail: [
      { label: "Reaction", value: "Local swelling" },
      { label: "Severity", value: "Mild" },
      { label: "Criticality", value: "Low" },
      { label: "Verification status", value: "Unconfirmed" },
      { label: "Status", value: "RESOLVED" },
    ],
  },
];

// `type` overrides the label-prefix filter key, since here the prefix is the
// drug name — the Filters drawer groups by drug class instead.
const MEDICATION_ENTRIES = [
  {
    id: "med1",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Morphine oral solution 5 mg/ml | 2.5–5 mg as needed, max 6× per day",
    type: "Opioid",
    phase: "active",
    detail: [
      { label: "Indication", value: "Breathlessness and pain" },
      { label: "Route", value: "Oral" },
      { label: "Prescriber", value: "Dr. M. Henley (General Practitioner)" },
      { label: "Start date", value: "12/08/2026" },
      { label: "Status", value: "ACTIVE" },
    ],
  },
  {
    id: "med2",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Midazolam 5 mg/ml | 2.5–5 mg subcutaneous as needed",
    type: "Benzodiazepine",
    phase: "active",
    detail: [
      { label: "Indication", value: "Anxiety or terminal restlessness (rescue kit at home)" },
      { label: "Route", value: "Subcutaneous" },
      { label: "Prescriber", value: "Dr. M. Henley (General Practitioner)" },
      { label: "Start date", value: "12/08/2026" },
      { label: "Status", value: "ACTIVE" },
    ],
  },
  {
    id: "med3",
    date: "12/11/2021",
    source: "Maastricht UMC+",
    label: "Tiotropium/olodaterol 2.5/2.5 mcg inhaler | 2 puffs once daily",
    type: "Inhaler",
    phase: "active",
    detail: [
      { label: "Indication", value: "Moderate COPD" },
      { label: "Route", value: "Inhalation" },
      { label: "Prescriber", value: "Dr. S. Janssen (Pulmonologist)" },
      { label: "Start date", value: "12/11/2021" },
      { label: "Status", value: "ACTIVE" },
    ],
  },
  {
    id: "med4",
    date: "08/10/2025",
    source: "UMC Utrecht",
    label: "Metformin 500 mg | 1 tablet 2× daily, with meals",
    type: "Oral antidiabetic",
    phase: "active",
    detail: [
      { label: "Indication", value: "Type 2 diabetes mellitus" },
      { label: "Route", value: "Oral" },
      { label: "Prescriber", value: "Dr. L. Bakker (Internist)" },
      { label: "Start date", value: "08/10/2025" },
      { label: "Status", value: "ACTIVE" },
    ],
  },
  {
    id: "med5",
    date: "15/04/2024",
    source: "Maastricht UMC+",
    label: "Carboplatin/pemetrexed | 4 cycles, every 3 weeks",
    type: "Chemotherapy",
    phase: "stopped",
    detail: [
      { label: "Indication", value: "Metastatic non-small-cell lung carcinoma" },
      { label: "Route", value: "Intravenous" },
      { label: "Start date", value: "15/04/2024" },
      { label: "End date", value: "01/07/2024" },
      { label: "Status", value: "STOPPED" },
    ],
  },
];

const PROCEDURE_ENTRIES = [
  {
    id: "proc1",
    date: "02/10/2026",
    source: "Maastricht UMC+",
    label: "Indwelling pleural catheter placement | Right",
    phase: "planned",
    detail: [
      { label: "Indication", value: "Recurrent malignant pleural effusion" },
      { label: "Laterality", value: "Right" },
      { label: "Performed by", value: "Dr. S. Janssen (Pulmonologist)" },
      { label: "Date", value: "02/10/2026" },
    ],
  },
  {
    id: "proc2",
    date: "03/09/2026",
    source: "Erasmus MC",
    label: "Palliative radiotherapy | Bone metastasis, left hip",
    phase: "past",
    detail: [
      { label: "Indication", value: "Pain from bone metastasis" },
      { label: "Laterality", value: "Left" },
      { label: "Performed by", value: "Dr. P. Visser (Radiation Oncology)" },
      { label: "Date", value: "03/09/2026" },
    ],
  },
  {
    id: "proc3",
    date: "18/08/2025",
    source: "Maastricht UMC+",
    label: "Pleural puncture | Right",
    phase: "past",
    detail: [
      { label: "Indication", value: "Pleural effusion during admission for acute breathlessness" },
      { label: "Laterality", value: "Right" },
      { label: "Performed by", value: "Dr. S. Janssen (Pulmonologist)" },
      { label: "Date", value: "18/08/2025" },
    ],
  },
  {
    id: "proc4",
    date: "20/02/2024",
    source: "Erasmus MC",
    label: "Bronchoscopy with biopsy | Right upper lobe",
    phase: "past",
    detail: [
      { label: "Indication", value: "Suspected lung carcinoma" },
      { label: "Laterality", value: "Right" },
      { label: "Performed by", value: "Dr. R. de Wit (Pulmonologist)" },
      { label: "Date", value: "20/02/2024" },
    ],
  },
  {
    id: "proc5",
    date: "14/07/2023",
    source: "Erasmus MC",
    label: "Knee arthroscopy | Right",
    phase: "past",
    detail: [
      { label: "Indication", value: "Chronic pain limiting mobility." },
      { label: "Laterality", value: "Right" },
      { label: "Date", value: "14/07/2023" },
    ],
  },
];

const LAB_ENTRIES = [
  {
    id: "lab1",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Haemoglobin | 7.1 mmol/L",
    detail: [
      { label: "Result", value: "7.1 mmol/L" },
      { label: "Reference range", value: "8.5–11.0 mmol/L" },
      { label: "Interpretation", value: "Low" },
      { label: "Date", value: "10/09/2026" },
    ],
  },
  {
    id: "lab2",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "eGFR | 52 ml/min/1.73m²",
    detail: [
      { label: "Result", value: "52 ml/min/1.73m²" },
      { label: "Reference range", value: "> 60 ml/min/1.73m²" },
      { label: "Interpretation", value: "Low" },
      { label: "Date", value: "10/09/2026" },
    ],
  },
  {
    id: "lab3",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "HbA1c | 58 mmol/mol",
    detail: [
      { label: "Result", value: "58 mmol/mol" },
      { label: "Reference range", value: "< 53 mmol/mol" },
      { label: "Interpretation", value: "High" },
      { label: "Date", value: "10/09/2026" },
    ],
  },
  {
    id: "lab4",
    date: "18/03/2026",
    source: "Erasmus MC",
    label: "Albumin | 31 g/L",
    detail: [
      { label: "Result", value: "31 g/L" },
      { label: "Reference range", value: "35–50 g/L" },
      { label: "Interpretation", value: "Low" },
      { label: "Date", value: "18/03/2026" },
    ],
  },
  {
    id: "lab5",
    date: "16/08/2025",
    source: "Maastricht UMC+",
    label: "CRP | 86 mg/L",
    detail: [
      { label: "Result", value: "86 mg/L" },
      { label: "Reference range", value: "< 10 mg/L" },
      { label: "Interpretation", value: "High" },
      { label: "Date", value: "16/08/2025" },
    ],
  },
];

const PROVIDER_ENTRIES = [
  {
    id: "hcp1",
    date: "12/01/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "General practitioner | Dr. M. Henley",
    detail: [
      { label: "Organisation", value: "GP Practice de Linde, Amersfoort" },
      { label: "Role", value: "Main practitioner" },
      { label: "Phone", value: "+31 33 123 45 67" },
    ],
  },
  {
    id: "hcp2",
    date: "01/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Community nurse | Mary Brown",
    detail: [
      { label: "Organisation", value: "Regional Homecare" },
      { label: "Role", value: "Home care, palliative nursing" },
      { label: "Phone", value: "+31 6 12 34 56 08" },
    ],
  },
  {
    id: "hcp3",
    date: "20/02/2024",
    source: "Erasmus MC",
    label: "Medical oncologist | Dr. E. Carter",
    detail: [
      { label: "Organisation", value: "Erasmus MC" },
      { label: "Role", value: "Treating specialist, lung carcinoma" },
      { label: "Phone", value: "+31 6 12 34 56 01" },
    ],
  },
  {
    id: "hcp4",
    date: "12/11/2021",
    source: "Maastricht UMC+",
    label: "Pulmonologist | Dr. S. Janssen",
    detail: [
      { label: "Organisation", value: "Maastricht UMC+" },
      { label: "Role", value: "Treating specialist, COPD" },
      { label: "Phone", value: "+31 43 387 65 43" },
    ],
  },
  {
    id: "hcp5",
    date: "08/10/2025",
    source: "UMC Utrecht",
    label: "Internist | Dr. L. Bakker",
    detail: [
      { label: "Organisation", value: "UMC Utrecht" },
      { label: "Role", value: "Treating specialist, diabetes" },
      { label: "Phone", value: "+31 88 755 55 55" },
    ],
  },
];

const ALERT_ENTRIES = [
  {
    id: "alr1",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Oxygen at home | No open flames or smoking",
    phase: "active",
    detail: [
      { label: "Explanation", value: "Home oxygen concentrator in use." },
      { label: "Status", value: "ACTIVE" },
      { label: "Start date", value: "12/08/2026" },
    ],
  },
  {
    id: "alr2",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Reduced renal function | Adjust dosing",
    phase: "active",
    detail: [
      { label: "Explanation", value: "eGFR 52; review metformin and opioid dosing." },
      { label: "Status", value: "ACTIVE" },
      { label: "Start date", value: "10/09/2026" },
    ],
  },
  {
    id: "alr3",
    date: "21/09/2022",
    source: "Maastricht UMC+",
    label: "Fall risk | Increased",
    phase: "active",
    detail: [
      { label: "Explanation", value: "Fall at home in 2022; walks with a rollator." },
      { label: "Status", value: "ACTIVE" },
      { label: "Start date", value: "21/09/2022" },
    ],
  },
  {
    id: "alr4",
    date: "12/10/2023",
    source: "Maastricht UMC+",
    label: "MRSA carrier | Negative on rescreening",
    phase: "resolved",
    detail: [
      { label: "Explanation", value: "Positive screening in 2023, negative on three follow-up cultures." },
      { label: "Status", value: "RESOLVED" },
      { label: "Start date", value: "12/10/2023" },
    ],
  },
];

const FUNCTIONAL_ENTRIES = [
  {
    id: "fun1",
    date: "03/09/2026",
    source: "Erasmus MC",
    label: "Performance status | WHO 3",
    detail: [
      { label: "Explanation", value: "In bed or chair more than half of the day; capable of only limited self-care." },
      { label: "Date", value: "03/09/2026" },
    ],
  },
  {
    id: "fun2",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Mobility | Short distances with rollator",
    detail: [
      { label: "Explanation", value: "Walks indoors with a rollator; uses a wheelchair outdoors." },
      { label: "Date", value: "10/09/2026" },
    ],
  },
  {
    id: "fun3",
    date: "01/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Self-care | Needs help washing and dressing",
    detail: [
      { label: "Explanation", value: "Home care visits twice daily." },
      { label: "Date", value: "01/09/2026" },
    ],
  },
  {
    id: "fun4",
    date: "02/07/2025",
    source: "Maastricht UMC+",
    label: "Breathlessness | MRC grade 4",
    detail: [
      { label: "Explanation", value: "Stops for breath after about 100 metres or a few minutes on level ground." },
      { label: "Date", value: "02/07/2025" },
    ],
  },
];

const VITALS_ENTRIES = [
  {
    id: "vit1",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Blood pressure | 124/76 mmHg",
    detail: [
      { label: "Result", value: "124/76 mmHg" },
      { label: "Method", value: "Sitting, left arm" },
      { label: "Date", value: "10/09/2026" },
    ],
  },
  {
    id: "vit2",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Oxygen saturation | 91%",
    detail: [
      { label: "Result", value: "91%" },
      { label: "Method", value: "At rest, room air" },
      { label: "Date", value: "10/09/2026" },
    ],
  },
  {
    id: "vit3",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Heart rate | 92 /min",
    detail: [
      { label: "Result", value: "92 /min" },
      { label: "Method", value: "At rest" },
      { label: "Date", value: "10/09/2026" },
    ],
  },
  {
    id: "vit4",
    date: "10/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Body weight | 71 kg",
    detail: [
      { label: "Result", value: "71 kg" },
      { label: "Explanation", value: "10 kg weight loss in the past year" },
      { label: "Date", value: "10/09/2026" },
    ],
  },
  {
    id: "vit5",
    date: "12/01/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "Body height | 178 cm",
    detail: [
      { label: "Result", value: "178 cm" },
      { label: "Date", value: "12/01/2024" },
    ],
  },
];

const SOCIAL_ENTRIES = [
  {
    id: "soc1",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Living situation | At home with wife",
    detail: [
      { label: "Explanation", value: "Single-family home; bedroom moved to the ground floor." },
      { label: "Date", value: "12/08/2026" },
    ],
  },
  {
    id: "soc2",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Participation | Retired carpenter",
    detail: [
      { label: "Explanation", value: "Informal care from wife Petra and daughter Anne." },
      { label: "Date", value: "12/08/2026" },
    ],
  },
  {
    id: "soc3",
    date: "12/01/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "Tobacco use | Former smoker",
    detail: [
      { label: "Explanation", value: "40 pack-years; quit in 2019." },
      { label: "Date", value: "12/01/2024" },
    ],
  },
  {
    id: "soc4",
    date: "12/01/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "Alcohol use | 1–2 units per week",
    detail: [
      { label: "Date", value: "12/01/2024" },
    ],
  },
  {
    id: "soc5",
    date: "03/09/2026",
    source: "Erasmus MC",
    label: "Nutrition advice | Energy- and protein-rich diet",
    detail: [
      { label: "Explanation", value: "Small frequent meals and sip feeds, per dietitian." },
      { label: "Date", value: "03/09/2026" },
    ],
  },
];

const CONTACT_PERSON_ENTRIES = [
  {
    id: "cp1",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "First contact | Petra de Vries",
    detail: [
      { label: "Relationship", value: "Spouse" },
      { label: "Role", value: "Informal representative for medical decisions" },
      { label: "Phone", value: "+31 6 98 76 54 32" },
    ],
  },
  {
    id: "cp2",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Second contact | Anne de Vries",
    detail: [
      { label: "Relationship", value: "Daughter" },
      { label: "Role", value: "Informal caregiver" },
      { label: "Phone", value: "+31 6 45 67 89 01" },
    ],
  },
  {
    id: "cp3",
    date: "12/08/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Legal representative | None formally appointed",
    detail: [
      { label: "Explanation", value: "Patient has full decision-making capacity at present." },
    ],
  },
];

const DEVICE_ENTRIES = [
  {
    id: "dev1",
    date: "12/08/2026",
    source: "Maastricht UMC+",
    label: "Oxygen concentrator | 2 L/min on exertion and at night",
    detail: [
      { label: "Indication", value: "Moderate COPD" },
      { label: "Location", value: "At home" },
      { label: "Start date", value: "12/08/2026" },
    ],
  },
  {
    id: "dev2",
    date: "01/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Hospital bed | Adjustable",
    detail: [
      { label: "Indication", value: "Reduced mobility, home care" },
      { label: "Location", value: "At home" },
      { label: "Start date", value: "01/09/2026" },
    ],
  },
  {
    id: "dev3",
    date: "21/09/2022",
    source: "Maastricht UMC+",
    label: "Rollator | Walking aid",
    detail: [
      { label: "Indication", value: "Fall risk" },
      { label: "Start date", value: "21/09/2022" },
    ],
  },
  {
    id: "dev4",
    date: "08/10/2025",
    source: "UMC Utrecht",
    label: "Blood glucose meter | Self-monitoring",
    detail: [
      { label: "Indication", value: "Type 2 diabetes mellitus" },
      { label: "Start date", value: "08/10/2025" },
    ],
  },
];

const VACCINATION_ENTRIES = [
  {
    id: "vac1",
    date: "28/10/2025",
    source: "GP Practice de Linde, Amersfoort",
    label: "COVID-19 | Autumn booster 2025",
    detail: [
      { label: "Dose", value: "Booster" },
      { label: "Date", value: "28/10/2025" },
    ],
  },
  {
    id: "vac2",
    date: "14/10/2025",
    source: "GP Practice de Linde, Amersfoort",
    label: "Influenza | Seasonal vaccine 2025",
    detail: [
      { label: "Dose", value: "Annual" },
      { label: "Date", value: "14/10/2025" },
    ],
  },
  {
    id: "vac3",
    date: "16/10/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "Influenza | Seasonal vaccine 2024",
    detail: [
      { label: "Dose", value: "Annual" },
      { label: "Date", value: "16/10/2024" },
    ],
  },
  {
    id: "vac4",
    date: "03/11/2023",
    source: "GP Practice de Linde, Amersfoort",
    label: "Pneumococcal | PPV23",
    detail: [
      { label: "Dose", value: "Single dose" },
      { label: "Date", value: "03/11/2023" },
    ],
  },
];

// Matches the PatientBar and the HIS side panel's own patient record.
const DEMOGRAPHICS_ENTRIES = [
  {
    id: "dem1",
    date: "12/01/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "Name | De Vries, Jan",
    detail: [
      { label: "Date of birth", value: "14/03/1953 (73 years)" },
      { label: "Gender", value: "Male" },
    ],
  },
  {
    id: "dem2",
    date: "12/01/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "Identification | ID 161 885 4347",
    detail: [
      { label: "Verification status", value: "Confirmed" },
    ],
  },
  {
    id: "dem3",
    date: "12/01/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "Address | Violenstraat 35, 3551 BB Utrecht",
    detail: [
      { label: "Phone", value: "0612345678" },
    ],
  },
  {
    id: "dem4",
    date: "12/01/2024",
    source: "GP Practice de Linde, Amersfoort",
    label: "Language | Dutch",
    detail: [
      { label: "Explanation", value: "No interpreter needed." },
    ],
  },
];

const FINANCIAL_ENTRIES = [
  {
    id: "fin1",
    date: "01/01/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Health insurance | FBTO basic insurance",
    detail: [
      { label: "Policy number", value: "V02110" },
      { label: "Start date", value: "01/01/2026" },
    ],
  },
  {
    id: "fin2",
    date: "01/01/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Supplementary insurance | FBTO supplementary module",
    detail: [
      { label: "Policy number", value: "V02110" },
      { label: "Start date", value: "01/01/2026" },
    ],
  },
  {
    id: "fin3",
    date: "01/09/2026",
    source: "GP Practice de Linde, Amersfoort",
    label: "Long-term care (Wlz) | Indication requested",
    detail: [
      { label: "Explanation", value: "Palliative-terminal care indication requested from the CIZ." },
      { label: "Date", value: "01/09/2026" },
    ],
  },
];

// The left rail, in display order. `phases` drives the status pills above
// each list (omitted = a single static "All (N)" pill, for categories where
// no BgZ status split applies). Encounters has no `entries` — it's rendered by
// its own paginated merge-on-arrival branch in EncountersSection.
const PX360_CATEGORIES = [
  { key: "encounters", label: "Encounters", icon: CalendarDays, phases: [{ key: "past", label: "Past" }, { key: "planned", label: "Planned" }] },
  { key: "diagnoses", label: "Complaints and diagnoses", icon: Stethoscope, entries: DIAGNOSIS_ENTRIES, phases: [{ key: "active", label: "Active" }, { key: "resolved", label: "Resolved" }] },
  { key: "treatment", label: "Treatment restrictions", icon: ClipboardList, entries: RESTRICTION_ENTRIES, phases: [{ key: "current", label: "Current" }, { key: "previous", label: "Previous" }] },
  { key: "allergies", label: "Allergies", icon: ShieldAlert, entries: ALLERGY_ENTRIES, phases: [{ key: "active", label: "Active" }, { key: "resolved", label: "Resolved" }] },
  { key: "medication", label: "Medication", icon: Pill, entries: MEDICATION_ENTRIES, phases: [{ key: "active", label: "Active" }, { key: "stopped", label: "Stopped" }] },
  { key: "procedures", label: "Procedures", icon: ClipboardPlus, entries: PROCEDURE_ENTRIES, phases: [{ key: "past", label: "Past" }, { key: "planned", label: "Planned" }] },
  { key: "lab", label: "Laboratory results", icon: FlaskConical, entries: LAB_ENTRIES },
  { key: "providers", label: "Healthcare providers", icon: BriefcaseMedical, entries: PROVIDER_ENTRIES },
  { key: "alerts", label: "Alerts", icon: Flag, entries: ALERT_ENTRIES, phases: [{ key: "active", label: "Active" }, { key: "resolved", label: "Resolved" }] },
  { key: "functional", label: "Functional status", icon: Accessibility, entries: FUNCTIONAL_ENTRIES },
  { key: "vitals", label: "Vital signs", icon: HeartPulse, entries: VITALS_ENTRIES },
  { key: "social", label: "Social history", icon: House, entries: SOCIAL_ENTRIES },
  { key: "contacts", label: "Contact persons", icon: Users, entries: CONTACT_PERSON_ENTRIES },
  { key: "devices", label: "Medical devices", icon: Armchair, entries: DEVICE_ENTRIES },
  { key: "vaccinations", label: "Vaccinations", icon: Syringe, entries: VACCINATION_ENTRIES },
  { key: "demographics", label: "Demographics and identification", icon: IdCard, entries: DEMOGRAPHICS_ENTRIES },
  { key: "financial", label: "Financial information", icon: Wallet, entries: FINANCIAL_ENTRIES },
];

// What the Dashboard sub-tab shows until the viewer customises it — the six
// cards and 2-column layout of the Figma dashboard frame (13561-53679).
// Treatment restrictions' current CPR decision is always pinned as the banner
// above the grid; it's also offered as an ordinary card (off by default).
const DASHBOARD_DEFAULT_VISIBLE = ["encounters", "diagnoses", "allergies", "medication", "procedures", "alerts"];

// Dashboard layout: `columns` is one array per column (1–3), each an ordered
// list of { key, visible } — every category is always in exactly one column,
// hidden or not, so the Customize view can place and toggle all of them.
// Saved with the demo state (survives a reload; Reset demo restores this).
function defaultDashboardLayout() {
  const ordered = [
    ...PX360_CATEGORIES.filter((c) => DASHBOARD_DEFAULT_VISIBLE.includes(c.key)),
    ...PX360_CATEGORIES.filter((c) => !DASHBOARD_DEFAULT_VISIBLE.includes(c.key)),
  ].map((c) => ({ key: c.key, visible: DASHBOARD_DEFAULT_VISIBLE.includes(c.key) }));
  return { columns: dealIntoColumns(ordered, 2) };
}

// Round-robin into n columns, so reading order (left to right, then down)
// is preserved when the column count changes.
function dealIntoColumns(items, n) {
  return Array.from({ length: n }, (_, col) => items.filter((_, i) => i % n === col));
}

// Row-major flatten — the inverse of dealIntoColumns.
function flattenColumns(columns) {
  const out = [];
  const rows = Math.max(...columns.map((c) => c.length));
  for (let r = 0; r < rows; r++) columns.forEach((c) => c[r] && out.push(c[r]));
  return out;
}

// Visible cards are dealt first so they spread evenly across the new columns
// instead of being pushed around by hidden categories in between.
function changeColumnCount(layout, n) {
  const flat = flattenColumns(layout.columns);
  return { columns: dealIntoColumns([...flat.filter((i) => i.visible), ...flat.filter((i) => !i.visible)], n) };
}

// A saved layout from an older build may lack categories added since, or
// name ones that no longer exist — keep it valid rather than discarding it.
function normalizeDashboardLayout(saved) {
  if (!saved?.columns?.length) return defaultDashboardLayout();
  const known = new Set(PX360_CATEGORIES.map((c) => c.key));
  const columns = saved.columns.map((col) => col.filter((item) => known.has(item.key)));
  const present = new Set(columns.flat().map((item) => item.key));
  PX360_CATEGORIES.forEach((c) => {
    if (!present.has(c.key)) columns[columns.length - 1].push({ key: c.key, visible: false });
  });
  return { columns };
}

// Record-list categories' Filters drawer offers one "Type" section, built from
// each record's `type` (or its label prefix before "|").
function simpleTypeKey(item) {
  return item.type ?? item.label.split("|")[0].trim();
}
// [{ key, label }] with the label already translated — taken from the
// translated record label's own prefix, so no separate dictionary entry is
// needed per type (every NL label keeps its "|" in the same place).
function categoryFilterTypes(category, t) {
  const seen = new Map();
  category.entries.forEach((item) => {
    const key = simpleTypeKey(item);
    if (!seen.has(key)) seen.set(key, item.type ? t(item.type) : t(item.label).split("|")[0].trim());
  });
  return [...seen].map(([key, label]) => ({ key, label }));
}

// Record dates are plain "DD/MM/YYYY" strings, unlike Encounters' sortDate
// field (which some entries derive from a date range).
function parseDMY(str) {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d).getTime();
}

// Same windows as Encounters' withinTimeWindow, for "DD/MM/YYYY" records.
function recordWithinTimeWindow(item, timeFilter) {
  if (timeFilter === "all") return true;
  const days = { month: 31, "6months": 186, year: 366, "5years": 366 * 5 }[timeFilter];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return parseDMY(item.date) >= cutoff.getTime();
}

// How many of a category's own entries came from a given organisation —
// used by SourcesHeader so its per-source subtext reflects what's actually
// on screen for a record category (a handful of records) rather than
// reusing Encounters' own fetched/total pagination counts (tens of records),
// which would read as literally the wrong numbers for a 4- or 5-item list.
function countByOrg(entries, orgName) {
  return entries.filter((e) => e.source === orgName).length;
}

// Allergy severity as the Figma dashboard draws it: three dots, filled
// red/orange/blue for high/moderate/low.
function SeverityDots({ severity }) {
  const filled = { high: 3, moderate: 2, low: 1 }[severity] || 0;
  const color = { high: T.danger, moderate: T.warning, low: T.primary }[severity];
  return (
    <span className="inline-flex items-center gap-[3px] ml-2 align-middle">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: i < filled ? color : T.gray400 }} />
      ))}
    </span>
  );
}

// Expanded body of any record-list card: the contributing organisation, then
// the record's own field list. A "Status" field renders as a badge.
function RecordDetailBlock({ item }) {
  const { t } = useLanguage();
  return (
    <div className="px-4 py-3" style={{ backgroundColor: T.light }}>
      <div className="mb-2">
        <span className="text-[12px] font-bold tracking-wide" style={{ color: T.bodyText }}>{item.source}</span>
      </div>
      {item.detail.map((d) =>
        d.label === "Status" ? (
          <div key={d.label} className="flex items-start gap-4 py-1 text-[13px]">
            <span className="w-[120px] shrink-0" style={{ color: T.gray600 }}>{t("Status")}</span>
            <StatusBadge muted={d.value === "RESOLVED" || d.value === "STOPPED"}>{t(d.value)}</StatusBadge>
          </div>
        ) : (
          <DetailRow key={d.label} label={d.label}>{t(d.value)}</DetailRow>
        )
      )}
    </div>
  );
}

// Collapsed/expandable card for one record — the same date + org header line,
// bold label + chevron, and height-animated expand as Encounters' own cards.
function RecordCard({ item, isExpanded, onToggle }) {
  const { t } = useLanguage();
  const color = item.tone === "danger" ? T.danger : T.primary;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={cardSpring}
      className="border rounded-md bg-white overflow-hidden"
      style={{ borderColor: T.border }}
    >
      <button onClick={onToggle} className="w-full text-left px-4 py-3 hover:bg-black/[0.02]">
        <div className="flex items-center justify-between text-[13px] mb-1" style={{ color: T.gray600 }}>
          <span>
            {item.date}
            {item.severity && <SeverityDots severity={item.severity} />}
          </span>
          <span>{item.source}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-semibold" style={{ color }}>{t(item.label)}</span>
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="shrink-0">
            <ChevronDown size={16} style={{ color }} />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="detail"
            className="overflow-hidden border-t"
            style={{ borderColor: T.border }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <RecordDetailBlock item={item} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Dutch for the BgZ categories above. Kept next to the records instead of in
// the main NL dictionary because it's mostly mock content; merged into NL at
// module load, so t() resolves these exactly like every other entry.
// Category names follow the Figma "Edit dashboard" frame's own Dutch labels.
Object.assign(NL, {
  // Category names (left rail + list titles)
  "Allergies": "Allergieën",
  "Medication": "Medicatie",
  "Procedures": "Verrichtingen",
  "Laboratory results": "Laboratoriumuitslagen",
  "Healthcare providers": "Zorgverleners",
  "Alerts": "Waarschuwingen",
  "Functional status": "Functionele status",
  "Social history": "Sociale anamnese",
  "Contact persons": "Contactpersonen",
  "Medical devices": "Medische hulpmiddelen",
  "Vaccinations": "Vaccinaties",
  "Demographics and identification": "Demografie en identificatie",
  "Financial information": "Financiële informatie",

  // Status pills — scoped, since "Resolved" is already "Afgerond" for tasks
  "px360Phase:Past": "Verleden",
  "px360Phase:Planned": "Gepland",
  "px360Phase:Active": "Actueel",
  "px360Phase:Resolved": "Niet actueel",
  "px360Phase:Current": "Actueel",
  "px360Phase:Previous": "Eerder",
  "px360Phase:Stopped": "Gestopt",
  "px360Phase:All": "Alle",
  "No records in this view.": "Geen gegevens in deze weergave.",

  // Dashboard / Detailed information sub-tabs
  "Dashboard": "Dashboard",
  "Detailed information": "Gedetailleerde informatie",
  "Show all": "Alles tonen",
  "Filter": "Filter",
  "Treatment restriction": "Behandelbeperking",
  "Customize view": "Weergave aanpassen",
  "Edit dashboard": "Dashboard bewerken",
  "Select the categories that you like to be visible on the dashboard. To re-order them, just drag & drop each category — also between columns.":
    "Selecteer de categorieën die u op het dashboard wilt zien. Sleep een categorie om de volgorde te wijzigen — ook tussen kolommen.",
  "1 column": "1 kolom",
  "2 columns": "2 kolommen",
  "3 columns": "3 kolommen",

  // Record field labels
  "Reaction": "Reactie",
  "Severity": "Ernst",
  "Criticality": "Kritiek",
  "Indication": "Indicatie",
  "Route": "Toedieningsweg",
  "Prescriber": "Voorschrijver",
  "End date": "Einddatum",
  "Performed by": "Uitgevoerd door",
  "Result": "Uitslag",
  "Reference range": "Referentiewaarde",
  "Interpretation": "Interpretatie",
  "Role": "Rol",
  "Method": "Methode",
  "Relationship": "Relatie",
  "Dose": "Dosis",
  "Date of birth": "Geboortedatum",
  "Gender": "Geslacht",
  "Policy number": "Polisnummer",

  // Record field values
  "RESOLVED": "NIET ACTUEEL",
  "STOPPED": "GESTOPT",
  "Unconfirmed": "Niet bevestigd",
  "Severe": "Ernstig",
  "Moderate": "Matig",
  "Mild": "Licht",
  "High": "Hoog",
  "Low": "Laag",
  "Left": "Links",
  "Male": "Man",
  "Oral": "Oraal",
  "Subcutaneous": "Subcutaan",
  "Inhalation": "Inhalatie",
  "Intravenous": "Intraveneus",
  "Opioid": "Opioïde",
  "Benzodiazepine": "Benzodiazepine",
  "Inhaler": "Inhalator",
  "Oral antidiabetic": "Oraal antidiabeticum",
  "Chemotherapy": "Chemotherapie",
  "At home": "Thuis",
  "At rest": "In rust",
  "At rest, room air": "In rust, zonder zuurstof",
  "Sitting, left arm": "Zittend, linkerarm",
  "Annual": "Jaarlijks",
  "Booster": "Booster",
  "Single dose": "Eenmalig",
  "Spouse": "Echtgenote",
  "Daughter": "Dochter",
  "Informal caregiver": "Mantelzorger",
  "Informal representative for medical decisions": "Informele vertegenwoordiger voor medische beslissingen",
  "Main practitioner": "Hoofdbehandelaar",
  "Home care, palliative nursing": "Thuiszorg, palliatieve verpleging",
  "Treating specialist, lung carcinoma": "Behandelend specialist, longcarcinoom",
  "Treating specialist, COPD": "Behandelend specialist, COPD",
  "Treating specialist, diabetes": "Behandelend specialist, diabetes",
  "Regional Homecare": "Regionale Thuiszorg",
  "Dr. M. Henley (General Practitioner)": "Dr. M. Henley (Huisarts)",
  "Dr. S. Janssen (Pulmonologist)": "Dr. S. Janssen (Longarts)",
  "Dr. R. de Wit (Pulmonologist)": "Dr. R. de Wit (Longarts)",
  "Dr. L. Bakker (Internist)": "Dr. L. Bakker (Internist)",
  "Dr. P. Visser (Radiation Oncology)": "Dr. P. Visser (Radiotherapie)",
  "Type 2 diabetes mellitus": "Diabetes mellitus type 2",
  "Metastatic non-small-cell lung carcinoma": "Gemetastaseerd niet-kleincellig longcarcinoom",
  "Suspected lung carcinoma": "Verdenking longcarcinoom",
  "Fall risk": "Valrisico",

  // Diagnoses
  "Diagnosis | Community-acquired pneumonia": "Diagnose | Buiten het ziekenhuis opgelopen pneumonie",
  "Right lower lobe pneumonia during an admission for acute breathlessness; treated with oral antibiotics.":
    "Pneumonie rechter onderkwab tijdens opname voor acute kortademigheid; behandeld met orale antibiotica.",
  "Lung, right lower lobe": "Long, rechter onderkwab",

  // Treatment restrictions
  "Artificial ventilation | Not desired": "Kunstmatige beademing | Niet gewenst",
  "Artificial nutrition and hydration | Declined": "Kunstmatige voeding en vocht | Afgewezen",
  "Antibiotics | Oral only": "Antibiotica | Alleen oraal",
  "No intubation or ICU admission": "Geen intubatie of IC-opname",
  "Comfort feeding only": "Alleen comfortvoeding",
  
  // Allergies
  "Medication | Penicillin": "Medicatie | Penicilline",
  "Medication | Iodinated contrast medium": "Medicatie | Jodiumhoudend contrastmiddel",
  "Medication | Codeine (intolerance)": "Medicatie | Codeïne (intolerantie)",
  "Environmental | Wasp venom": "Omgeving | Wespengif",
  "Urticaria and facial swelling": "Urticaria en zwelling van het gezicht",
  "Generalised rash after CT chest": "Gegeneraliseerde huiduitslag na CT thorax",
  "Severe nausea and vomiting": "Ernstige misselijkheid en braken",
  "Local swelling": "Lokale zwelling",

  // Medication
  "Morphine oral solution 5 mg/ml | 2.5–5 mg as needed, max 6× per day":
    "Morfine drank 5 mg/ml | 2,5–5 mg zo nodig, max. 6× per dag",
  "Midazolam 5 mg/ml | 2.5–5 mg subcutaneous as needed": "Midazolam 5 mg/ml | 2,5–5 mg subcutaan zo nodig",
  "Tiotropium/olodaterol 2.5/2.5 mcg inhaler | 2 puffs once daily":
    "Tiotropium/olodaterol 2,5/2,5 mcg inhalator | 1× daags 2 inhalaties",
  "Metformin 500 mg | 1 tablet 2× daily, with meals": "Metformine 500 mg | 2× daags 1 tablet, bij de maaltijd",
  "Carboplatin/pemetrexed | 4 cycles, every 3 weeks": "Carboplatine/pemetrexed | 4 kuren, elke 3 weken",
  "Breathlessness and pain": "Kortademigheid en pijn",
  "Anxiety or terminal restlessness (rescue kit at home)": "Angst of terminale onrust (noodset thuis)",

  // Procedures
  "Indwelling pleural catheter placement | Right": "Plaatsing getunnelde pleuracatheter | Rechts",
  "Palliative radiotherapy | Bone metastasis, left hip": "Palliatieve radiotherapie | Botmetastase, linkerheup",
  "Pleural puncture | Right": "Pleurapunctie | Rechts",
  "Bronchoscopy with biopsy | Right upper lobe": "Bronchoscopie met biopt | Rechter bovenkwab",
  "Knee arthroscopy | Right": "Kniearthroscopie | Rechts",
  "Recurrent malignant pleural effusion": "Recidiverend maligne pleuravocht",
  "Pain from bone metastasis": "Pijn door botmetastase",
  "Pleural effusion during admission for acute breathlessness": "Pleuravocht tijdens opname voor acute kortademigheid",

  // Laboratory results
  "Haemoglobin | 7.1 mmol/L": "Hemoglobine | 7,1 mmol/L",
  "eGFR | 52 ml/min/1.73m²": "eGFR | 52 ml/min/1,73m²",
  "HbA1c | 58 mmol/mol": "HbA1c | 58 mmol/mol",
  "Albumin | 31 g/L": "Albumine | 31 g/L",
  "CRP | 86 mg/L": "CRP | 86 mg/L",
  "7.1 mmol/L": "7,1 mmol/L",
  "8.5–11.0 mmol/L": "8,5–11,0 mmol/L",
  "52 ml/min/1.73m²": "52 ml/min/1,73m²",
  "> 60 ml/min/1.73m²": "> 60 ml/min/1,73m²",

  // Healthcare providers
  "General practitioner | Dr. M. Henley": "Huisarts | Dr. M. Henley",
  "Community nurse | Mary Brown": "Wijkverpleegkundige | Mary Brown",
  "Medical oncologist | Dr. E. Carter": "Internist-oncoloog | Dr. E. Carter",
  "Pulmonologist | Dr. S. Janssen": "Longarts | Dr. S. Janssen",
  "Internist | Dr. L. Bakker": "Internist | Dr. L. Bakker",

  // Alerts
  "Oxygen at home | No open flames or smoking": "Zuurstof thuis | Geen open vuur of roken",
  "Reduced renal function | Adjust dosing": "Verminderde nierfunctie | Dosering aanpassen",
  "Fall risk | Increased": "Valrisico | Verhoogd",
  "MRSA carrier | Negative on rescreening": "MRSA-drager | Negatief bij herscreening",
  "Home oxygen concentrator in use.": "Zuurstofconcentrator thuis in gebruik.",
  "eGFR 52; review metformin and opioid dosing.": "eGFR 52; dosering metformine en opioïden herzien.",
  "Fall at home in 2022; walks with a rollator.": "Val thuis in 2022; loopt met een rollator.",
  "Positive screening in 2023, negative on three follow-up cultures.":
    "Positieve screening in 2023, negatief bij drie vervolgkweken.",

  // Functional status
  "Performance status | WHO 3": "Performance status | WHO 3",
  "Mobility | Short distances with rollator": "Mobiliteit | Korte afstanden met rollator",
  "Self-care | Needs help washing and dressing": "Zelfzorg | Hulp nodig bij wassen en aankleden",
  "Breathlessness | MRC grade 4": "Kortademigheid | MRC-graad 4",
  "In bed or chair more than half of the day; capable of only limited self-care.":
    "Meer dan de helft van de dag in bed of stoel; slechts beperkt in staat tot zelfzorg.",
  "Walks indoors with a rollator; uses a wheelchair outdoors.": "Loopt binnen met een rollator; buiten in een rolstoel.",
  "Home care visits twice daily.": "Thuiszorg komt twee keer per dag.",
  "Stops for breath after about 100 metres or a few minutes on level ground.":
    "Moet na ongeveer 100 meter of enkele minuten op vlak terrein stoppen om op adem te komen.",

  // Vital signs
  "Blood pressure | 124/76 mmHg": "Bloeddruk | 124/76 mmHg",
  "Oxygen saturation | 91%": "Zuurstofsaturatie | 91%",
  "Heart rate | 92 /min": "Hartfrequentie | 92 /min",
  "Body weight | 71 kg": "Lichaamsgewicht | 71 kg",
  "Body height | 178 cm": "Lichaamslengte | 178 cm",
  "10 kg weight loss in the past year": "10 kg gewichtsverlies in het afgelopen jaar",

  // Social history
  "Living situation | At home with wife": "Woonsituatie | Thuis met echtgenote",
  "Participation | Retired carpenter": "Participatie | Gepensioneerd timmerman",
  "Tobacco use | Former smoker": "Tabaksgebruik | Voormalig roker",
  "Alcohol use | 1–2 units per week": "Alcoholgebruik | 1–2 eenheden per week",
  "Nutrition advice | Energy- and protein-rich diet": "Voedingsadvies | Energie- en eiwitrijk dieet",
  "Single-family home; bedroom moved to the ground floor.": "Eengezinswoning; slaapkamer verplaatst naar de begane grond.",
  "Informal care from wife Petra and daughter Anne.": "Mantelzorg door echtgenote Petra en dochter Anne.",
  "40 pack-years; quit in 2019.": "40 pakjaren; gestopt in 2019.",
  "Small frequent meals and sip feeds, per dietitian.": "Kleine, frequente maaltijden en drinkvoeding, volgens diëtist.",

  // Contact persons
  "First contact | Petra de Vries": "Eerste contactpersoon | Petra de Vries",
  "Second contact | Anne de Vries": "Tweede contactpersoon | Anne de Vries",
  "Legal representative | None formally appointed": "Wettelijk vertegenwoordiger | Niet formeel benoemd",
  "Patient has full decision-making capacity at present.": "Patiënt is op dit moment volledig wilsbekwaam.",

  // Medical devices
  "Oxygen concentrator | 2 L/min on exertion and at night": "Zuurstofconcentrator | 2 L/min bij inspanning en 's nachts",
  "Hospital bed | Adjustable": "Hoog-laagbed | Verstelbaar",
  "Rollator | Walking aid": "Rollator | Loophulpmiddel",
  "Blood glucose meter | Self-monitoring": "Bloedglucosemeter | Zelfcontrole",
  "Reduced mobility, home care": "Verminderde mobiliteit, thuiszorg",

  // Vaccinations
  "COVID-19 | Autumn booster 2025": "COVID-19 | Najaarsbooster 2025",
  "Influenza | Seasonal vaccine 2025": "Influenza | Griepprik 2025",
  "Influenza | Seasonal vaccine 2024": "Influenza | Griepprik 2024",
  "Pneumococcal | PPV23": "Pneumokokken | PPV23",

  // Demographics and identification
  "Name | De Vries, Jan": "Naam | De Vries, Jan",
  "Identification | ID 161 885 4347": "Identificatie | ID 161 885 4347",
  "Address | Violenstraat 35, 3551 BB Utrecht": "Adres | Violenstraat 35, 3551 BB Utrecht",
  "Language | Dutch": "Taal | Nederlands",
  "14/03/1953 (73 years)": "14/03/1953 (73 jaar)",
  "No interpreter needed.": "Geen tolk nodig.",

  // Financial information
  "Health insurance | FBTO basic insurance": "Zorgverzekering | FBTO basisverzekering",
  "Supplementary insurance | FBTO supplementary module": "Aanvullende verzekering | FBTO aanvullende module",
  "Long-term care (Wlz) | Indication requested": "Langdurige zorg (Wlz) | Indicatie aangevraagd",
  "Palliative-terminal care indication requested from the CIZ.": "Indicatie palliatief-terminale zorg aangevraagd bij het CIZ.",
});

// The left-rail live indicator (n/5 counting up, then a check) — shared by
// all three category rows since they're all populated by the same
// underlying 5-source fetch (see SourcesHeader below): once that fetch
// settles, it settles for Encounters/Diagnoses/Treatment simultaneously.
// No source can fail (see SOURCE_CONFIG), so this only ever ends in the
// settled/"done" state, never a warning icon.
function SourceCountIndicator({ loadedCount, allSettled, isActive }) {
  return (
    <span className="relative block w-[32px] h-[18px] shrink-0">
      <AnimatePresence initial={false}>
        <motion.span
          key={!allSettled ? `n${loadedCount}` : "done"}
          className="absolute inset-0 flex items-center justify-end"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {!allSettled
            ? <span className="text-[13px] font-semibold tabular-nums">{loadedCount}/{SOURCE_CONFIG.length}</span>
            : <Check size={15} strokeWidth={3} />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Category title + the "Sources (N/5 loaded)" collapsible breakdown —
// shared across all three categories for the same reason as
// SourceCountIndicator above: one 5-source fetch feeds all of them, so the
// breakdown (which source loaded or was empty) reads identically no matter
// which category you're looking at. No failed/retry branch — no source can
// ever reach that state (see SOURCE_CONFIG), so that UI would be unreachable
// dead code here, same reasoning as Documents' own DocumentsSourcesPanel.
function SourcesHeader({ title, sourcesOpen, setSourcesOpen, sourceStatus, loadedCount, allSettled, lastUpdated, onRefresh, categoryEntries }) {
  const { t, lang } = useLanguage();
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[22px] font-semibold leading-tight" style={{ color: T.bodyText }}>{t(title)}</h2>
        <div className="flex items-center gap-3 text-sm" style={{ color: T.gray600 }}>
          <button onClick={() => setSourcesOpen((v) => !v)} className="flex items-center gap-1.5">
            <span className="relative block w-[14px] h-[14px]">
              <AnimatePresence initial={false}>
                <motion.span
                  key={allSettled ? "done" : "pending"}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={iconSpring}
                >
                  {allSettled
                    ? <CheckCircle2 size={14} style={{ color: T.success }} />
                    : <AlertCircle size={14} style={{ color: T.warning, fill: T.warning, stroke: "#fff" }} />}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="underline underline-offset-2" style={{ color: T.bodyText }}>
              {t("Sources")} ({loadedCount}/{SOURCE_CONFIG.length} {t("loaded")})
            </span>
            {sourcesOpen ? <ChevronUp size={14} style={{ color: T.primary }} /> : <ChevronDown size={14} style={{ color: T.primary }} />}
          </button>
          <FadeSwap id={allSettled ? "complete" : "updating"}>
            {allSettled
              ? <span>{t("Complete as of")} {lastUpdated ? formatClock(lastUpdated) : "—"}</span>
              : <span>{t("Updated:")} {lastUpdated ? formatClock(lastUpdated) : "—"}</span>}
          </FadeSwap>
          <motion.button onClick={onRefresh} aria-label={t("Refresh")} whileTap={{ scale: 0.85, rotate: 90 }}>
            <RefreshCw size={15} style={{ color: T.primary }} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {sourcesOpen && (
          <motion.div
            key="sources-panel"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="rounded-md overflow-hidden mb-4 border border-[#DEE2E6]">
              {SOURCE_CONFIG.map((source, i) => {
                const status = sourceStatus[source.id] || { state: "loading" };
                // In category mode (Diagnoses/Treatment), the subtext counts
                // that category's own records from this org, not Encounters'
                // fetched/total pagination — "Latest 10 of 16" is correct for
                // Encounters' own 16-record Maastricht history, but wrong
                // (and confusing) next to a 4-entry diagnosis list.
                const categoryTotal = categoryEntries ? countByOrg(categoryEntries, source.name) : null;
                const showSubline =
                  status.state === "empty" ||
                  (status.state === "loaded" && (categoryEntries ? true : status.fetched < status.total));
                const sublineText =
                  status.state === "empty" || (categoryEntries && categoryTotal === 0)
                    ? t("No records found for this patient")
                    : categoryEntries
                      ? (lang === "nl"
                          ? `${categoryTotal} record${categoryTotal === 1 ? "" : "s"} geladen`
                          : `${categoryTotal} record${categoryTotal === 1 ? "" : "s"} loaded`)
                      : (lang === "nl"
                          ? `Laatste ${status.fetched} van ${status.total} records geladen`
                          : `Latest ${status.fetched} of ${status.total} records loaded`);
                return (
                  <div
                    key={source.id}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm ${i > 0 ? "border-t border-white" : ""}`}
                    style={{ backgroundColor: T.lightBg }}
                  >
                    <div className="flex items-center gap-2.5">
                      <StatusIcon state={status.state} />
                      <div>
                        <div className="font-semibold text-[14px]" style={{ color: T.bodyText }}>
                          {source.name}
                        </div>
                        <AnimatePresence initial={false}>
                          {showSubline && (
                            <motion.div
                              key="subline"
                              className="overflow-hidden"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <div className="text-[13px]" style={{ color: T.gray500 }}>
                                {sublineText}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <FadeSwap id={status.state === "loading" ? `loading-${status.phase || "initial"}` : status.state} className="text-sm">
                      {status.state === "loading" && (
                        <span style={{ color: T.gray600 }}>{status.phase === "more" ? t("fetching more…") : t("fetching…")}</span>
                      )}
                      {(status.state === "loaded" || status.state === "empty") && <span style={{ color: T.gray600 }}>{formatClock(status.time)}</span>}
                    </FadeSwap>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// The status pills + Sort + Filters row — identical across every category
// (only one is ever mounted at a time, since categories are mutually
// exclusive), so `sortMenuOpen`/`sortOrder` and the filter drawer they open
// are safely shared EncountersSection state rather than duplicated per
// category. `phases` is [{ key, label, count }]; the pills filter the list.
function CategoryToolbar({ phases, activePhase, onPhaseChange, filterCount, sortOrder, sortMenuOpen, setSortMenuOpen, sortMenuRef, changeSortOrder, onOpenFilters }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3">
      <div className="flex items-center gap-2">
        {phases.map((p) => {
          const active = p.key === activePhase;
          return (
            <button
              key={p.key}
              onClick={() => onPhaseChange(p.key)}
              className={`text-sm px-3 py-1 rounded-full whitespace-nowrap ${active ? "text-white font-semibold" : ""}`}
              style={active ? { backgroundColor: T.primary } : { color: T.gray600 }}
            >
              {t(p.label, "px360Phase")} ({p.count})
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-sm" style={{ color: T.primary }}>
        <div className="relative" ref={sortMenuRef}>
          <button onClick={() => setSortMenuOpen((v) => !v)} className="flex items-center gap-1 whitespace-nowrap">
            <ArrowUpDown size={14} /> {t("Sort:")} {sortOrder === "oldest" ? t("Oldest first") : t("Newest first")}
          </button>
          <AnimatePresence>
            {sortMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-44 rounded-md border bg-white shadow-lg overflow-hidden z-20"
                style={{ borderColor: T.border }}
              >
                {["newest", "oldest"].map((o) => (
                  <button
                    key={o}
                    onClick={() => changeSortOrder(o)}
                    className="w-full text-left px-4 py-2.5 text-[14px]"
                    style={{ color: T.bodyText, backgroundColor: sortOrder === o ? T.light : "#fff" }}
                  >
                    {o === "oldest" ? t("Oldest first") : t("Newest first")}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={onOpenFilters} className="flex items-center gap-1.5">
          <Filter size={14} /> {t("Filters")}
          <AnimatePresence>
            {filterCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={iconSpring}
                className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-white text-[11px] font-bold"
                style={{ backgroundColor: T.primary }}
              >
                {filterCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <button onClick={onChange} className="w-full flex items-center gap-2.5 py-1.5 text-[14px] text-left">
      <span
        className="w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 border-2 transition-colors"
        style={{ backgroundColor: checked ? T.primary : "#fff", borderColor: checked ? T.primary : T.gray400 }}
      >
        <AnimatePresence>
          {checked && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={iconSpring}>
              <Check size={13} strokeWidth={3} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span style={{ color: T.bodyText }}>{label}</span>
    </button>
  );
}

// Collapsible section of the filter drawer ("Status", "Encounter type", …),
// plus icon rotating into an x when expanded.
function FilterAccordion({ title, open, onToggle, children }) {
  return (
    <div className="border-b" style={{ borderColor: T.border }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-3.5 text-[14px]" style={{ color: T.bodyText }}>
        {title}
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
          <Plus size={16} style={{ color: T.gray600 }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="px-5 pb-4 pt-1" style={{ backgroundColor: T.lightBg }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- PX360 Dashboard sub-tab (Figma 13561-53679) ---------- */

// How many of a category's most recent records a Dashboard card shows; the
// rest are one click away via "Show all", which opens the Detailed view.
const DASHBOARD_CARD_LIMIT = 3;

// The pinned red strip above the Dashboard grid: the patient's current CPR
// decision (Figma node 13561-53814). Check for "permitted", X otherwise.
function TreatmentRestrictionBanner({ entry, onOpen }) {
  const { t } = useLanguage();
  const [type, value] = t(entry.label).split("|").map((x) => x.trim());
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-2 text-left rounded-[4px] border px-[17px] pt-[9px] pb-[9px] mb-6"
      style={{ backgroundColor: "#FFEBEB", borderColor: "#C74139" }}
    >
      <span className="flex items-center gap-2 shrink-0">
        <IdCard size={22} style={{ color: "#C74139" }} />
        <span className="text-[16px] font-bold uppercase tracking-[1px] leading-[1.2]" style={{ color: T.bodyText }}>
          {t("Treatment restriction")}
        </span>
      </span>
      <span className="flex-1 min-w-0 flex items-center gap-2 pl-4 text-[16px] font-semibold leading-[1.2]" style={{ color: T.bodyText }}>
        <span className="whitespace-nowrap">{type}</span>
        <span className="px-1" style={{ color: T.gray500 }}>|</span>
        {entry.permitted
          ? <Check size={20} strokeWidth={2.5} style={{ color: "#34C759" }} />
          : <X size={20} strokeWidth={2.5} style={{ color: "#C74139" }} />}
        <span className="truncate">{value}</span>
      </span>
      <span className="text-[14px] shrink-0" style={{ color: T.bodyText }}>{entry.date}</span>
    </button>
  );
}

// One record inside a Dashboard card (Figma "BGZ header" item): date +
// severity, source on the right, then the label and an expand chevron. Rows
// are divided by a rule rather than boxed like the Detailed view's cards.
function DashboardRow({ date, source, label, tone, severity, isExpanded, onToggle, isLast, children }) {
  const color = tone === "danger" ? "#C74139" : T.bodyText;
  return (
    <div className={isLast ? "" : "border-b"} style={{ borderColor: T.border }}>
      <button onClick={onToggle} className="w-full text-left py-2">
        <div className="flex items-center justify-between text-[14px] leading-[1.5]" style={{ color: T.gray600 }}>
          <span className="flex items-center">
            {date}
            {severity && <SeverityDots severity={severity} />}
          </span>
          <span className="text-right">{source}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-semibold leading-[1.2]" style={{ color }}>{label}</span>
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="shrink-0">
            <ChevronDown size={20} style={{ color: T.primary }} />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="detail"
            className="overflow-hidden mb-2 rounded-[4px]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// A Dashboard category card (Figma "BGZ category", 13561-53836): icon + title
// header that collapses the card, the category's status pills + Filter, and
// its most recent records.
function DashboardCard({ category, phases, activePhase, onPhaseChange, collapsed, onToggleCollapsed, onFilter, onShowAll, totalCount, loading, children }) {
  const { t } = useLanguage();
  const Icon = category.icon;
  return (
    <div className="bg-white border rounded-[4px] overflow-hidden" style={{ borderColor: T.border }}>
      <button
        onClick={onToggleCollapsed}
        className={`w-full flex items-center justify-between px-4 pt-4 pb-[17px] text-left ${collapsed ? "" : "border-b"}`}
        style={{ borderColor: T.border }}
      >
        <span className="flex items-center gap-2">
          <Icon size={22} style={{ color: T.primary }} />
          <span className="text-[16px] font-bold uppercase tracking-[1px] leading-[1.2]" style={{ color: T.primary }}>{t(category.label)}</span>
        </span>
        <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
          <ChevronDown size={22} style={{ color: T.primary }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-4 pt-2 pb-3">
              <div className="flex items-center justify-between h-8 mb-1">
                <div className="flex items-center gap-1">
                  {phases.map((p) => {
                    const active = p.key === activePhase;
                    return (
                      <button
                        key={p.key}
                        onClick={() => onPhaseChange(p.key)}
                        className={`text-[14px] leading-[1.5] whitespace-nowrap rounded-full ${active ? "font-semibold px-[9px] py-[3px]" : "px-2 py-[2px]"}`}
                        style={{ color: T.bodyText, backgroundColor: active ? T.lightBg : "transparent" }}
                      >
                        {t(p.label, "px360Phase")} ({p.count})
                      </button>
                    );
                  })}
                </div>
                <button onClick={onFilter} className="flex items-center gap-1 text-[14px]" style={{ color: T.bodyText }}>
                  <Filter size={15} style={{ color: T.primary, fill: T.primary }} /> {t("Filter")}
                </button>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-sm py-4" style={{ color: T.gray500 }}>
                  <LoaderCircle size={16} className="animate-spin" style={{ color: T.primary }} />
                  {t("Loading first results…")}
                </div>
              ) : totalCount === 0 ? (
                <div className="text-sm py-4" style={{ color: T.gray500 }}>{t("No records in this view.")}</div>
              ) : (
                children
              )}
              {!loading && totalCount > DASHBOARD_CARD_LIMIT && (
                <button onClick={onShowAll} className="mt-2 flex items-center gap-1 text-[14px] font-semibold" style={{ color: T.primary }}>
                  {t("Show all")} ({totalCount}) <ChevronRight size={15} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EncountersSection({ scrollRef, sourceFilter, timeFilter, view, onViewChange, layout }) {
  const { t } = useLanguage();
  const [runId, setRunId] = useState(0);
  const [sourceStatus, setSourceStatus] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);
  const [queuedItems, setQueuedItems] = useState(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedIds, setExpandedIds] = useState({});
  const toggleExpand = (id) => setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  // Which left-rail category's content shows in the right column.
  const [activeCategory, setActiveCategory] = useState("encounters");

  // Sort order: a display preference, re-applied to whatever is already
  // merged rather than re-running the simulation.
  const [sortOrder, setSortOrder] = useState("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortOrderRef = useRef("newest");
  const sortMenuRef = useRef(null);

  // Filter drawer state — purely a view over whatever has already arrived;
  // it never touches the merge-on-arrival or pagination logic.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilters, setTypeFilters] = useState(new Set());
  const [statusFilters, setStatusFilters] = useState({ arrived: true, planned: true });
  const [careProviderQuery, setCareProviderQuery] = useState("");
  const [drawerSections, setDrawerSections] = useState({ status: false, encounterType: true, careProvider: false });
  // Record-list categories get the same Filters drawer, scoped to their own
  // (much simpler) type taxonomy — see categoryFilterTypes. Keyed by category.
  const [recordTypeFilters, setRecordTypeFilters] = useState({});
  // Which status pill is selected, per category (defaults to its first one).
  const [phaseByCategory, setPhaseByCategory] = useState({});

  const allItemsRef = useRef([]);
  const timeoutsRef = useRef([]);
  // Read at timeout-fire time (state values here would be stale — the
  // timeouts are scheduled once, before the user has scrolled or expanded).
  const userScrolledRef = useRef(false);
  const queuePendingRef = useRef(false);
  // How many entries each source has delivered so far (server-side cursor).
  const fetchedRef = useRef({});

  const statuses = Object.values(sourceStatus);
  const pendingCount = statuses.filter((s) => s.state === "loading").length;
  // Only sources that actually responded count as loaded (empty = responded, no records)
  const loadedCount = statuses.filter((s) => s.state === "loaded" || s.state === "empty").length;
  const allSettled = statuses.length > 0 && pendingCount === 0;

  const applySort = useCallback((list, order) => {
    const o = order || sortOrderRef.current;
    return [...list].sort((a, b) =>
      o === "oldest" ? new Date(a.sortDate) - new Date(b.sortDate) : new Date(b.sortDate) - new Date(a.sortDate)
    );
  }, []);

  // Sort is a display preference: re-sort whatever has already arrived
  // rather than touching the merge-on-arrival state machine.
  const changeSortOrder = (order) => {
    sortOrderRef.current = order;
    setSortOrder(order);
    setVisibleItems((prev) => applySort(prev, order));
    setQueuedItems((prev) => (prev ? applySort(prev, order) : prev));
    setSortMenuOpen(false);
  };

  // phase: "initial" for the first fetch, "more" for pagination fetches
  // triggered by Show more. Each fetch returns the next FETCH_PAGE entries.
  const runSource = useCallback((source, opts = {}) => {
    const phase = opts.phase || "initial";
    setSourceStatus((prev) => ({ ...prev, [source.id]: { ...prev[source.id], state: "loading", phase } }));
    const t = setTimeout(() => {
      const now = new Date();
      const state = source.outcome === "empty" ? "empty" : "loaded";
      const already = fetchedRef.current[source.id] || 0;
      const slice = state === "loaded" ? source.entries.slice(already, already + FETCH_PAGE) : [];
      if (state === "loaded") fetchedRef.current[source.id] = already + slice.length;
      setSourceStatus((prev) => ({
        ...prev,
        [source.id]: { state, time: now, phase, fetched: fetchedRef.current[source.id] || 0, total: source.entries.length },
      }));
      setLastUpdated(now);

      if (slice.length) {
        allItemsRef.current = [...allItemsRef.current, ...slice];
        const sorted = applySort(allItemsRef.current);
        // Everything fetched is displayed. Arrivals are deferred behind the
        // banner only while the user has scrolled into the page — except
        // records the user explicitly requested via Show more ("more" phase),
        // which merge immediately. A pending queue always absorbs subsequent
        // arrivals so the banner's contents can't leak in early.
        const engaged = userScrolledRef.current && phase !== "more";
        if (queuePendingRef.current || engaged) {
          queuePendingRef.current = true;
          setQueuedItems(sorted);
        } else {
          setVisibleItems(sorted);
        }
      }
    }, opts.delayMs ? opts.delayMs() : source.delayMs());
    timeoutsRef.current.push(t);
  }, []);

  const startSimulation = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    allItemsRef.current = [];
    setVisibleItems([]);
    setQueuedItems(null);
    userScrolledRef.current = false;
    queuePendingRef.current = false;
    fetchedRef.current = {};
    setExpandedIds({});
    setSourceStatus(Object.fromEntries(SOURCE_CONFIG.map((s) => [s.id, { state: "loading" }])));
    SOURCE_CONFIG.forEach(runSource);
  }, [runSource]);

  useEffect(() => {
    startSimulation();
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [runId]);

  // Ask every fully-responded source that still has server-side records for
  // its next page. Their status rows return to a (re)fetching state.
  const fetchMoreFromSources = () => {
    SOURCE_CONFIG.forEach((source) => {
      const st = sourceStatus[source.id];
      const fetched = fetchedRef.current[source.id] || 0;
      if (st?.state === "loaded" && fetched < source.entries.length) {
        runSource(source, { phase: "more", delayMs: () => 3000 + Math.random() * 2000 });
      }
    });
  };

  const applyQueued = () => {
    setVisibleItems(queuedItems);
    setQueuedItems(null);
    queuePendingRef.current = false;
  };

  // Engagement now tracks the page scroll (the whole content column scrolls,
  // not the list itself). Scrolled meaningfully into the page = reading.
  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;
    const onScroll = () => {
      userScrolledRef.current = el.scrollTop > 100;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const onClick = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setSortMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sortMenuOpen]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  const toggleType = (key) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const clearFilters = () => {
    setTypeFilters(new Set());
    setStatusFilters({ arrived: true, planned: true });
    setCareProviderQuery("");
  };

  const activeFilterCount =
    typeFilters.size +
    (!statusFilters.arrived || !statusFilters.planned ? 1 : 0) +
    (careProviderQuery.trim() ? 1 : 0);

  const category = PX360_CATEGORIES.find((c) => c.key === activeCategory);
  const phaseOf = (cat) => phaseByCategory[cat.key] ?? (cat.phases ? cat.phases[0].key : "all");
  const setPhaseOf = (catKey, key) => setPhaseByCategory((prev) => ({ ...prev, [catKey]: key }));
  const typeFiltersOf = (cat) => recordTypeFilters[cat.key] ?? new Set();

  const activePhase = phaseOf(category);
  const setActivePhase = (key) => setPhaseOf(activeCategory, key);
  const activeTypeFilters = typeFiltersOf(category);
  const toggleRecordType = (key) => {
    setRecordTypeFilters((prev) => {
      const next = new Set(prev[activeCategory] ?? []);
      next.has(key) ? next.delete(key) : next.add(key);
      return { ...prev, [activeCategory]: next };
    });
  };
  const clearRecordTypes = () => setRecordTypeFilters((prev) => ({ ...prev, [activeCategory]: new Set() }));

  // A record category's list: the page-level organisation/time dropdowns and
  // the selected status pill, then the drawer's Type filter, then sort. Shared
  // by the Detailed view (active category) and every Dashboard card, so both
  // always show the same records for the same pill.
  const orgNameAllowed = (name) => !sourceFilter || SOURCE_CONFIG.some((s) => s.name === name && sourceFilter.has(s.id));
  const recordListFor = (cat) => {
    const phase = phaseOf(cat);
    const types = typeFiltersOf(cat);
    const inView = cat.entries.filter((item) => orgNameAllowed(item.source) && recordWithinTimeWindow(item, timeFilter));
    const inPhase = inView.filter((item) => phase === "all" || item.phase === phase);
    const displayed = inPhase
      .filter((item) => types.size === 0 || types.has(simpleTypeKey(item)))
      .sort((a, b) => (sortOrder === "oldest" ? parseDMY(a.date) - parseDMY(b.date) : parseDMY(b.date) - parseDMY(a.date)));
    const phases = cat.phases
      ? cat.phases.map((p) => ({ ...p, count: inView.filter((item) => item.phase === p.key).length }))
      : [{ key: "all", label: "All", count: inView.length }];
    return { phases, phase, inPhase, displayed };
  };
  const activeRecords = category.entries ? recordListFor(category) : null;
  const recordsInPhase = activeRecords?.inPhase ?? [];
  const displayedRecords = activeRecords?.displayed ?? [];
  const recordPhases = activeRecords?.phases ?? [];

  // Filters are a pure view over whatever has already merged in — they never
  // change what's fetched, only what's shown. Source/time come from the
  // page-level "All organisations" / "All time" dropdowns.
  const passesFilters = (item) => {
    if (!statusFilters.arrived) return false; // every entry here is "arrived" (this is the Past tab)
    if (sourceFilter && !sourceFilter.has(sourceIdForItem(item))) return false;
    if (!withinTimeWindow(item, timeFilter)) return false;
    if (typeFilters.size > 0) {
      const key = encounterTypeKey(item);
      if (!key || !typeFilters.has(key)) return false;
    }
    if (careProviderQuery.trim()) {
      const q = careProviderQuery.trim().toLowerCase();
      const details = ENCOUNTER_DETAILS[item.id] || genericDetail(item, t);
      if (!details.some((d) => d.careProvider && t(d.careProvider).toLowerCase().includes(q))) return false;
    }
    return true;
  };

  // Every mock encounter is a past one, so the Planned pill shows an empty list.
  const encountersPhase = phaseByCategory.encounters ?? "past";
  const displayedItems = encountersPhase === "planned" ? [] : visibleItems.filter(passesFilters);

  // Records known to exist on the server but not yet fetched (e.g. Maastricht
  // reported total 16 and delivered 10). This is what "Show more" loads —
  // it's hidden entirely once the picture is complete.
  const serverRemaining = SOURCE_CONFIG.reduce((sum, s) => {
    const st = sourceStatus[s.id];
    return st?.state === "loaded" ? sum + (st.total - st.fetched) : sum;
  }, 0);

  // ---- Dashboard sub-tab ----
  const [collapsedCards, setCollapsedCards] = useState({});
  const dashboardColumns = layout.columns.map((col) =>
    col.filter((item) => item.visible).map((item) => PX360_CATEGORIES.find((c) => c.key === item.key))
  );
  const currentCpr = RESTRICTION_ENTRIES
    .filter((e) => e.phase === "current" && e.permitted !== undefined)
    .sort((a, b) => parseDMY(b.date) - parseDMY(a.date))[0];

  // "Show all" / "Filter" / the banner jump into the Detailed view on that
  // category, back at the top of the page.
  const openInDetailed = (catKey, { withFilters = false } = {}) => {
    setActiveCategory(catKey);
    onViewChange("detailed");
    if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    if (withFilters) setFiltersOpen(true);
  };

  const renderDashboardCard = (cat) => {
    const common = {
      category: cat,
      collapsed: !!collapsedCards[cat.key],
      onToggleCollapsed: () => setCollapsedCards((prev) => ({ ...prev, [cat.key]: !prev[cat.key] })),
      onFilter: () => openInDetailed(cat.key, { withFilters: true }),
      onShowAll: () => openInDetailed(cat.key),
    };
    if (cat.key === "encounters") {
      const items = displayedItems.slice(0, DASHBOARD_CARD_LIMIT);
      return (
        <DashboardCard
          key={cat.key}
          {...common}
          phases={[{ key: "past", label: "Past", count: ENCOUNTER_TOTAL }, { key: "planned", label: "Planned", count: 0 }]}
          activePhase={encountersPhase}
          onPhaseChange={(key) => setPhaseOf("encounters", key)}
          loading={encountersPhase === "past" && visibleItems.length === 0}
          // Same known total as the Past pill, so the two never disagree while
          // later sources are still loading.
          totalCount={encountersPhase === "past" ? ENCOUNTER_TOTAL : 0}
        >
          {items.map((item, i) => (
            <DashboardRow
              key={item.id}
              date={item.date}
              source={<SourceLabel source={item.source} />}
              label={t(item.label)}
              isExpanded={!!expandedIds[item.id]}
              onToggle={() => toggleExpand(item.id)}
              isLast={i === items.length - 1}
            >
              {(ENCOUNTER_DETAILS[item.id] || genericDetail(item, t)).map((d, k) => (
                <OrgDetailBlock key={k} detail={d} isFirst={k === 0} />
              ))}
            </DashboardRow>
          ))}
        </DashboardCard>
      );
    }
    const list = recordListFor(cat);
    const items = list.displayed.slice(0, DASHBOARD_CARD_LIMIT);
    return (
      <DashboardCard
        key={cat.key}
        {...common}
        phases={list.phases}
        activePhase={list.phase}
        onPhaseChange={(key) => setPhaseOf(cat.key, key)}
        loading={false}
        totalCount={list.displayed.length}
      >
        {items.map((item, i) => (
          <DashboardRow
            key={item.id}
            date={item.date}
            source={item.source}
            label={t(item.label)}
            tone={item.tone}
            severity={item.severity}
            isExpanded={!!expandedIds[item.id]}
            onToggle={() => toggleExpand(item.id)}
            isLast={i === items.length - 1}
          >
            <RecordDetailBlock item={item} />
          </DashboardRow>
        ))}
      </DashboardCard>
    );
  };

  return (
    <>
    {view === "dashboard" && (
      <div>
        {currentCpr && <TreatmentRestrictionBanner entry={currentCpr} onOpen={() => openInDetailed("treatment")} />}
        <div className="flex items-start gap-4">
          {dashboardColumns.map((cats, col) => (
            <div key={col} className="flex-1 min-w-0 flex flex-col gap-4">
              {cats.map(renderDashboardCard)}
            </div>
          ))}
        </div>
      </div>
    )}

    {view === "detailed" && (
    <div className="grid grid-cols-[300px_1fr] gap-10">
      {/* Tall enough for all BgZ categories to scroll within the rail itself
          when the page is scrolled down a long Encounters list. */}
      <div className="flex flex-col self-start sticky top-6 max-h-[calc(100vh-190px)] overflow-y-auto rounded-sm border border-[#DEE2E6]">
        {PX360_CATEGORIES.map((c, i) => {
          const isActive = activeCategory === c.key;
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`shrink-0 font-semibold text-sm tracking-wide uppercase px-4 py-3 flex items-center justify-between gap-2.5 text-left ${i > 0 ? "border-t border-[#DEE2E6]" : ""}`}
              style={{ backgroundColor: isActive ? T.primary : "#fff", color: isActive ? "#fff" : T.bodyText }}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} className="shrink-0" style={{ color: isActive ? "#fff" : T.primary }} /> {t(c.label)}
              </span>
              <SourceCountIndicator loadedCount={loadedCount} allSettled={allSettled} isActive={isActive} />
            </button>
          );
        })}
      </div>

      <div>
        {activeCategory === "encounters" && (
        <>
        <SourcesHeader
          title="Encounters"
          sourcesOpen={sourcesOpen}
          setSourcesOpen={setSourcesOpen}
          sourceStatus={sourceStatus}
          loadedCount={loadedCount}
          allSettled={allSettled}
          lastUpdated={lastUpdated}
          onRefresh={() => setRunId((r) => r + 1)}
        />

        <CategoryToolbar
          phases={[
            // Past is the encounter history's known server-side total, not
            // what has loaded so far.
            { key: "past", label: "Past", count: ENCOUNTER_TOTAL },
            { key: "planned", label: "Planned", count: 0 },
          ]}
          activePhase={encountersPhase}
          onPhaseChange={(key) => setPhaseByCategory((prev) => ({ ...prev, encounters: key }))}
          filterCount={activeFilterCount}
          sortOrder={sortOrder}
          sortMenuOpen={sortMenuOpen}
          setSortMenuOpen={setSortMenuOpen}
          sortMenuRef={sortMenuRef}
          changeSortOrder={changeSortOrder}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        <AnimatePresence initial={false}>
          {queuedItems && (
            <motion.div
              key="queued-banner"
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <motion.button
                onClick={applyQueued}
                whileTap={{ scale: 0.98 }}
                className="w-full mb-3 flex items-center justify-center gap-2 text-sm rounded-md py-2 border"
                style={{ backgroundColor: T.light, borderColor: T.primary, color: T.primary }}
              >
                <ArrowDown size={14} /> {t("New entries available — click to update")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {visibleItems.length === 0 && encountersPhase !== "planned" && (
              <motion.div
                key="empty-state"
                className="flex items-center justify-center gap-2 text-sm py-6 text-center border rounded-md"
                style={{ color: T.gray500, borderColor: T.border }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <LoaderCircle size={16} className="animate-spin" style={{ color: T.primary }} />
                {t("Loading first results…")}
              </motion.div>
            )}
            {encountersPhase === "planned" && (
              <motion.div
                key="planned-empty"
                className="text-sm py-6 text-center border rounded-md"
                style={{ color: T.gray500, borderColor: T.border }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                {t("No records in this view.")}
              </motion.div>
            )}
            {encountersPhase !== "planned" && visibleItems.length > 0 && displayedItems.length === 0 && (
              <motion.div
                key="filtered-empty"
                className="text-sm py-6 text-center border rounded-md"
                style={{ color: T.gray500, borderColor: T.border }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                {t("No encounters match the selected filters.")}{" "}
                <button onClick={clearFilters} className="underline font-semibold" style={{ color: T.primary }}>
                  {t("Clear filters")}
                </button>
              </motion.div>
            )}
            {displayedItems.map((item) => {
              const isExpanded = !!expandedIds[item.id];
              const details = ENCOUNTER_DETAILS[item.id] || genericDetail(item, t);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                  transition={{ ...cardSpring, opacity: { duration: 0.25 } }}
                  className="border rounded-md bg-white overflow-hidden"
                  style={{ borderColor: T.border }}
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full text-left px-4 py-3 hover:bg-black/[0.02]"
                  >
                    <div className="flex items-center justify-between text-[13px] mb-1" style={{ color: T.gray600 }}>
                      <span>{item.date}</span>
                      <span><SourceLabel source={item.source} /></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold" style={{ color: T.primary }}>{t(item.label)}</span>
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="shrink-0"
                      >
                        <ChevronDown size={16} style={{ color: T.primary }} />
                      </motion.span>
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="detail"
                        className="overflow-hidden border-t"
                        style={{ borderColor: T.border }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        {details.map((d, i) => (
                          <OrgDetailBlock key={i} detail={d} isFirst={i === 0} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>
          {serverRemaining > 0 && encountersPhase !== "planned" && (
            <motion.div
              key="show-more"
              className="flex justify-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                onClick={fetchMoreFromSources}
                whileTap={{ scale: 0.97 }}
                className="border text-sm rounded-md px-6 py-2"
                style={{ borderColor: T.primary, color: T.primary }}
              >
                {t("Show more")}{" "}
                <FadeSwap id={serverRemaining} className="inline-flex">
                  <span>({serverRemaining})</span>
                </FadeSwap>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )}

        {category.entries && (
          <div>
            <SourcesHeader
              title={category.label}
              sourcesOpen={sourcesOpen}
              setSourcesOpen={setSourcesOpen}
              sourceStatus={sourceStatus}
              loadedCount={loadedCount}
              allSettled={allSettled}
              lastUpdated={lastUpdated}
              onRefresh={() => setRunId((r) => r + 1)}
              categoryEntries={category.entries}
            />
            <CategoryToolbar
              phases={recordPhases}
              activePhase={activePhase}
              onPhaseChange={setActivePhase}
              filterCount={activeTypeFilters.size}
              sortOrder={sortOrder}
              sortMenuOpen={sortMenuOpen}
              setSortMenuOpen={setSortMenuOpen}
              sortMenuRef={sortMenuRef}
              changeSortOrder={changeSortOrder}
              onOpenFilters={() => setFiltersOpen(true)}
            />
            {recordsInPhase.length === 0 && (
              <div className="text-sm py-6 text-center border rounded-md" style={{ color: T.gray500, borderColor: T.border }}>
                {t("No records in this view.")}
              </div>
            )}
            {recordsInPhase.length > 0 && displayedRecords.length === 0 && (
              <div className="text-sm py-6 text-center border rounded-md" style={{ color: T.gray500, borderColor: T.border }}>
                {t("No entries match the selected filters.")}{" "}
                <button onClick={clearRecordTypes} className="underline font-semibold" style={{ color: T.primary }}>
                  {t("Clear filters")}
                </button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {displayedRecords.map((item) => (
                <RecordCard key={item.id} item={item} isExpanded={!!expandedIds[item.id]} onToggle={() => toggleExpand(item.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    )}

    {typeof document !== "undefined" && createPortal(
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              key="filters-backdrop"
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              key="filters-drawer"
              className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: T.border }}>
                <span className="text-[13px] font-bold tracking-wide" style={{ color: T.bodyText }}>{t("FILTERS")}</span>
                <button onClick={() => setFiltersOpen(false)} aria-label={t("Close filters")}>
                  <X size={20} style={{ color: T.primary }} />
                </button>
              </div>

              {activeCategory === "encounters" && (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <FilterAccordion
                      title={t("Status")}
                      open={drawerSections.status}
                      onToggle={() => setDrawerSections((p) => ({ ...p, status: !p.status }))}
                    >
                      <FilterCheckbox
                        label={t("Arrived")}
                        checked={statusFilters.arrived}
                        onChange={() => setStatusFilters((p) => ({ ...p, arrived: !p.arrived }))}
                      />
                      <FilterCheckbox
                        label={t("Planned")}
                        checked={statusFilters.planned}
                        onChange={() => setStatusFilters((p) => ({ ...p, planned: !p.planned }))}
                      />
                    </FilterAccordion>

                    <FilterAccordion
                      title={t("Encounter type")}
                      open={drawerSections.encounterType}
                      onToggle={() => setDrawerSections((p) => ({ ...p, encounterType: !p.encounterType }))}
                    >
                      {FILTER_TYPES.map((ft) => (
                        <FilterCheckbox key={ft.key} label={t(ft.label)} checked={typeFilters.has(ft.key)} onChange={() => toggleType(ft.key)} />
                      ))}
                    </FilterAccordion>

                    <FilterAccordion
                      title={t("Care provider")}
                      open={drawerSections.careProvider}
                      onToggle={() => setDrawerSections((p) => ({ ...p, careProvider: !p.careProvider }))}
                    >
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: T.gray500 }} />
                        <input
                          value={careProviderQuery}
                          onChange={(e) => setCareProviderQuery(e.target.value)}
                          placeholder={t("Search care provider")}
                          className="w-full pl-8 pr-3 py-2 text-[14px] rounded border bg-white outline-none"
                          style={{ borderColor: T.gray400, color: T.bodyText }}
                        />
                      </div>
                    </FilterAccordion>
                  </div>

                  {activeFilterCount > 0 && (
                    <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: T.border }}>
                      <button onClick={clearFilters} className="text-[14px] font-semibold" style={{ color: T.primary }}>
                        {t("Clear all filters")}
                      </button>
                    </div>
                  )}
                </>
              )}

              {category.entries && (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <FilterAccordion title={t("Type")} open onToggle={() => {}}>
                      {categoryFilterTypes(category, t).map((ft) => (
                        <FilterCheckbox key={ft.key} label={ft.label} checked={activeTypeFilters.has(ft.key)} onChange={() => toggleRecordType(ft.key)} />
                      ))}
                    </FilterAccordion>
                  </div>

                  {activeTypeFilters.size > 0 && (
                    <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: T.border }}>
                      <button onClick={clearRecordTypes} className="text-[14px] font-semibold" style={{ color: T.primary }}>
                        {t("Clear all filters")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}

// "All organisations" — multi-select checkbox dropdown, global to the page.
function OrgFilterDropdown({ selected, onChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const toggle = (id) => {
    onChange((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-60 flex items-center justify-between border rounded px-3 py-2 text-[14px] bg-white text-left"
        style={{ borderColor: T.gray400, color: T.gray600 }}
      >
        <span className="truncate">{orgFilterLabel(selected, t)}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={15} style={{ color: T.primary }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-72 rounded-md border bg-white shadow-lg p-3 z-20"
            style={{ borderColor: T.border }}
          >
            {SOURCE_CONFIG.map((s) => (
              <FilterCheckbox key={s.id} label={s.name} checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// "All time" — single-select dropdown, global to the page.
function TimeFilterDropdown({ value, onChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const label = t(TIME_OPTIONS.find((o) => o.key === value)?.label ?? "All time");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-60 flex items-center justify-between border rounded px-3 py-2 text-[14px] bg-white"
        style={{ borderColor: T.gray400, color: T.gray600 }}
      >
        {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} style={{ color: T.primary }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-60 rounded-md border bg-white shadow-lg overflow-hidden z-20"
            style={{ borderColor: T.border }}
          >
            {TIME_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-[14px]"
                style={{ color: T.bodyText, backgroundColor: value === o.key ? T.lightBg : "#fff" }}
              >
                {t(o.label)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// On/off switch as the Figma "switch-input" draws it: 32×16, primary fill
// with a white knob when on, white with a 25% black outline/knob when off.
function DashboardSwitch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className="w-8 h-4 rounded-[32px] p-[2px] flex items-center shrink-0 transition-colors"
      style={on ? { backgroundColor: T.primary, justifyContent: "flex-end" } : { backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.25)" }}
    >
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: on ? "#fff" : "rgba(0,0,0,0.25)" }} />
    </button>
  );
}

// Layout picker tile: a miniature of 1/2/3 columns (Figma 12326-242722).
function LayoutTile({ columns, selected, onSelect, label }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-pressed={selected}
      className="bg-white border rounded-[4px] p-4 w-[158px] h-[103px] flex gap-2"
      style={{ borderColor: selected ? T.primary : T.border }}
    >
      {Array.from({ length: columns }, (_, i) => (
        <span key={i} className="flex-1 h-full" style={{ backgroundColor: selected ? "rgba(0,128,163,0.3)" : "#D9D9D9" }} />
      ))}
    </button>
  );
}

// "Customize view" → Edit dashboard modal (Figma 12326-242709): choose 1/2/3
// columns, toggle each category, and drag categories to reorder them within
// a column or move them to another one — each panel is one Dashboard column.
// Edits a draft; nothing changes on the Dashboard until Save. The Figma
// frame's "Timeline" tab and per-category "Set filter" are not built yet.
function CustomizeDashboardModal({ layout, onSave, onClose }) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(layout);
  const [dragKey, setDragKey] = useState(null);
  // Where the dragged row would land: { col, index } (insert before index).
  const [dropAt, setDropAt] = useState(null);

  const toggle = (key) =>
    setDraft((d) => ({ columns: d.columns.map((col) => col.map((item) => (item.key === key ? { ...item, visible: !item.visible } : item))) }));

  const moveTo = (key, col, index) =>
    setDraft((d) => {
      const fromCol = d.columns.findIndex((c) => c.some((item) => item.key === key));
      const fromIndex = d.columns[fromCol].findIndex((item) => item.key === key);
      const moving = d.columns[fromCol][fromIndex];
      const columns = d.columns.map((c) => c.filter((item) => item.key !== key));
      // Removing the row first shifts later rows in the same column up by one.
      const at = fromCol === col && fromIndex < index ? index - 1 : index;
      columns[col].splice(at, 0, moving);
      return { columns };
    });

  const endDrag = () => {
    setDragKey(null);
    setDropAt(null);
  };

  const onRowDragOver = (e, col, index) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    setDropAt({ col, index: after ? index + 1 : index });
  };

  const onDrop = (e) => {
    e.preventDefault();
    // Rows sit inside the panel, which also handles drop — only apply once.
    e.stopPropagation();
    if (dragKey && dropAt) moveTo(dragKey, dropAt.col, dropAt.index);
    endDrag();
  };

  const DropLine = () => <div className="h-[3px] -mt-[5px] mb-[2px] rounded-full relative z-10" style={{ backgroundColor: T.primary }} />;

  return (
    <Modal title="Edit dashboard" onClose={onClose} width={1100}>
      <div className="-m-6 p-6" style={{ backgroundColor: T.light }}>
        <p className="text-[14px] leading-[1.5] mb-6" style={{ color: T.bodyText }}>
          {t("Select the categories that you like to be visible on the dashboard. To re-order them, just drag & drop each category — also between columns.")}
        </p>
        <div className="flex justify-center gap-6 mb-6">
          {[1, 2, 3].map((n) => (
            <LayoutTile
              key={n}
              columns={n}
              selected={draft.columns.length === n}
              onSelect={() => setDraft((d) => (d.columns.length === n ? d : changeColumnCount(d, n)))}
              label={t(n === 1 ? "1 column" : `${n} columns`)}
            />
          ))}
        </div>
        <div className="flex items-start gap-2">
          {draft.columns.map((col, c) => (
            <div
              key={c}
              className="flex-1 min-w-0 bg-white border rounded-[4px] p-6 self-stretch"
              style={{ borderColor: T.border }}
              onDragOver={(e) => {
                e.preventDefault();
                // Over the panel's empty space below the last row → append.
                if (e.target === e.currentTarget) setDropAt({ col: c, index: col.length });
              }}
              onDrop={onDrop}
            >
              {/* Each row's wrapper carries the 8px spacing as padding, so
                  the whole column is covered by drop targets with no gaps. */}
              <div
                className="flex flex-col -my-1 min-h-[48px]"
                onDragOver={(e) => {
                  e.preventDefault();
                  if (e.target === e.currentTarget) setDropAt({ col: c, index: col.length });
                }}
              >
                {col.map((item, i) => {
                  const cat = PX360_CATEGORIES.find((x) => x.key === item.key);
                  return (
                    <div key={item.key} className="py-1" onDragOver={(e) => onRowDragOver(e, c, i)} onDrop={onDrop}>
                      {dropAt && dragKey && dropAt.col === c && dropAt.index === i && <DropLine />}
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", item.key);
                          setDragKey(item.key);
                        }}
                        onDragEnd={endDrag}
                        className="h-10 flex items-center justify-between gap-2 px-3 rounded-[4px] cursor-grab active:cursor-grabbing select-none"
                        style={{ backgroundColor: T.light, opacity: dragKey === item.key ? 0.4 : 1 }}
                      >
                        <span className="flex items-center min-w-0">
                          <span className="w-8 flex justify-center shrink-0">
                            <Grip size={18} style={{ color: T.gray600 }} />
                          </span>
                          <span className="px-2 text-[15px] leading-[1.5] truncate" style={{ color: T.bodyText }}>{t(cat.label)}</span>
                        </span>
                        <span className="px-2 flex items-center">
                          <DashboardSwitch on={item.visible} onChange={() => toggle(item.key)} label={t(cat.label)} />
                        </span>
                      </div>
                    </div>
                  );
                })}
                {dropAt && dragKey && dropAt.col === c && dropAt.index === col.length && <DropLine />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end items-center gap-6 -mx-6 -mb-6 mt-6 px-6 py-3 border-t" style={{ borderColor: T.border }}>
        <button onClick={onClose} className="text-[15px] font-semibold px-2 py-[7px]" style={{ color: T.primary }}>{t("Cancel")}</button>
        <Btn onClick={() => onSave(draft)}>{t("Save")}</Btn>
      </div>
    </Modal>
  );
}

// Segmented "Dashboard | Detailed information" control (Figma 13561-53714).
function Px360ViewSwitch({ value, onChange }) {
  const { t } = useLanguage();
  const options = [
    { key: "dashboard", label: "Dashboard" },
    { key: "detailed", label: "Detailed information" },
  ];
  return (
    <div className="flex items-center gap-6 rounded-[4px] px-3 py-[3px]" style={{ backgroundColor: T.lightBg }}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`text-[14px] leading-[1.5] rounded-[3.2px] whitespace-nowrap ${active ? "font-semibold px-[9px] py-[5px] bg-white border" : "px-2 py-1"}`}
            style={active ? { color: T.bodyText, borderColor: T.light, boxShadow: "0 2px 4px rgba(0,0,0,0.08)" } : { color: T.bodyText }}
          >
            {t(o.label)}
          </button>
        );
      })}
    </div>
  );
}

// The screen shown when PatientBar's PX360 tab is clicked — reuses this
// app's own Sidebar/TopHeader/PatientBar rather than duplicating the
// standalone encounters-prototype's own shell.
function Px360Screen({ hasCaremap, onBack, onNavigate, persona, onSwitchPersona, onReset, unreadCount, onOpenNotifications, caseManagerPersonaId, sidebarCollapsed, onToggleSidebar, dashboardLayout, onDashboardLayoutChange }) {
  const { t } = useLanguage();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const contentScrollRef = useRef(null);
  const [sourceFilter, setSourceFilter] = useState(() => new Set(SOURCE_CONFIG.map((s) => s.id)));
  const [timeFilter, setTimeFilter] = useState("all");
  // "dashboard" (default, per the Figma BGZ viewer frame) or "detailed" —
  // the rail + full-list view that PX360 used to be on its own.
  const [view, setView] = useState("dashboard");

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <Sidebar activeLabel="Patients" onNavigate={onNavigate} unreadCount={unreadCount} collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader persona={persona} onSwitchPersona={onSwitchPersona} onReset={onReset} unreadCount={unreadCount} onOpenNotifications={onOpenNotifications} caseManagerPersonaId={caseManagerPersonaId} />
        <PatientBar back={onBack} activeTab="PX360" onTabClick={onNavigate} />
        <div ref={contentScrollRef} className="flex-1 overflow-y-auto" style={{ backgroundColor: T.light }}>
          <div className="px-8 py-6">
            {/* Title row + Dashboard/Detailed switch, then the page-level
                filters on their own row — Figma 13561-53708 / 13561-53722. */}
            <div className="flex items-center justify-between">
              {/* "Patient 360" is a product/module name, like "CAREMAPS" elsewhere — deliberately not translated */}
              <h2 className="text-[24px] font-semibold leading-[1.2]" style={{ color: T.black }}>Patient 360</h2>
              <div className="flex items-center gap-6">
                {view === "dashboard" && (
                  <button onClick={() => setCustomizeOpen(true)} className="flex items-center gap-[2px] text-[14px] leading-[1.5]" style={{ color: T.primary }}>
                    <Settings size={20} style={{ color: T.primary }} /> {t("Customize view")}
                  </button>
                )}
                <Px360ViewSwitch value={view} onChange={setView} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-6 mt-4 mb-6">
              <OrgFilterDropdown selected={sourceFilter} onChange={setSourceFilter} />
              <TimeFilterDropdown value={timeFilter} onChange={setTimeFilter} />
            </div>
            <EncountersSection scrollRef={contentScrollRef} sourceFilter={sourceFilter} timeFilter={timeFilter} view={view} onViewChange={setView} layout={dashboardLayout} />
          </div>
        </div>
      </div>
      {customizeOpen && (
        <CustomizeDashboardModal
          layout={dashboardLayout}
          onSave={(next) => {
            onDashboardLayoutChange(next);
            setCustomizeOpen(false);
          }}
          onClose={() => setCustomizeOpen(false)}
        />
      )}
    </div>
  );
}

/* ================= documents tab (native port of vitaly-documents-prototype) ================= */

const DOCUMENT_CATEGORIES = [
  { key: "allergies", label: "Allergies & Safety", icon: ShieldAlert },
  { key: "assessments", label: "Assessments", icon: ClipboardCheck },
  { key: "clinical-notes", label: "Clinical Notes", icon: FileText },
  { key: "care-plans", label: "Care Plans & Orders", icon: FolderPlus },
  { key: "consents", label: "Consents & Legal", icon: FileSignature },
  { key: "diagnostics", label: "Diagnostics & Results", icon: FlaskConical },
  { key: "encounters", label: "Encounters & Episodes", icon: CalendarDays },
  { key: "insurance", label: "Insurance & Coverage", icon: ShieldCheck },
  { key: "post-mortem", label: "Post-Mortem", icon: FileX },
];

// Each fetch returns at most this many of a source's documents (latest
// first), mimicking server-side pagination — same contract as PX360's
// Encounters simulation.
const DOC_FETCH_PAGE = 10;

// Unlike PX360's Encounters sources (one of which always fails until
// retried, to demonstrate that state), every Documents source is scripted
// to succeed — both on first entry and on every subsequent visit/refresh —
// per explicit request: this tab shouldn't ever show a failed-fetch state.
// "empty" (XDS, genuinely 0 records) stays as a distinct, non-alarming
// outcome — it's a successful response that just found nothing, not a
// failure — so there's still visible variety across the three sources.
const DOC_SOURCES = [
  {
    // The primary document exchange network for this patient — has more
    // records than a single fetch returns.
    id: "zorgplatform",
    name: "ZorgPlatform",
    delayMs: () => 2500 + Math.random() * 2000,
    outcome: "loaded",
    entries: [
      { id: "d1", name: "CRC MDT report", type: "MDT final report", date: "20/12/2025", sortDate: "2025-12-20", author: "Dr. Emily Carter, MD", org: "GP Practice de Linde, Amersfoort", format: ".docx", category: "assessments" },
      { id: "d2", name: "CRC MDT report", type: "MDT final report", date: "18/11/2025", sortDate: "2025-11-18", author: "Dr. James Thompson, MD", org: "GP Practice de Linde, Amersfoort", format: ".pdf", category: "assessments" },
      { id: "d3", name: "Uro Onco report", type: "MDT final report", date: "24/10/2025", sortDate: "2025-10-24", author: "Dr. Sarah Johnson, MD", org: "Maastricht UMC+", format: ".xlsx", category: "assessments" },
      { id: "d4", name: "X-ray Chest", type: "DICOM image", date: "08/08/2025", sortDate: "2025-08-08", author: "Dr. Michael Brown, MD", org: "Maastricht UMC+", format: ".txt", category: "diagnostics" },
      { id: "d5", name: "X-ray Lung", type: "DICOM image", date: "12/11/2024", sortDate: "2024-11-12", author: "Dr. Linda Smith, MD", org: "Maastricht UMC+", format: ".jpg", category: "diagnostics" },
      { id: "d6", name: "Cardiac MDT report", type: "MDT final report", date: "22/09/2024", sortDate: "2024-09-22", author: "Dr. Robert Wilson, MD", org: "UMC Utrecht", format: ".pdf", category: "assessments" },
      { id: "d7", name: "Cardiac MDT report", type: "MDT final report", date: "21/09/2024", sortDate: "2024-09-21", author: "Dr. Jessica Lee, MD", org: "UMC Utrecht", format: ".csv", category: "assessments" },
      { id: "d8", name: "Palliative care admission request", type: "Admission request", date: "20/09/2024", sortDate: "2024-09-20", author: "Dr. David Martinez, MD", org: "Maastricht UMC+", format: ".pdf", category: "care-plans" },
      { id: "d9", name: "Palliative care admission request", type: "Admission request", date: "18/09/2024", sortDate: "2024-09-18", author: "Dr. Karen Davis, MD", org: "Maastricht UMC+", format: ".xml", category: "care-plans" },
      { id: "d10", name: "Discharge summary", type: "Discharge summary", date: "15/07/2024", sortDate: "2024-07-15", author: "Dr. Emily Carter, MD", org: "GP Practice de Linde, Amersfoort", format: ".pdf", category: "encounters" },
      { id: "d11", name: "Palliative care progress note", type: "Clinical note", date: "05/06/2024", sortDate: "2024-06-05", author: "Dr. Karen Davis, MD", org: "GP Practice de Linde, Amersfoort", format: ".pdf", category: "clinical-notes" },
      { id: "d12", name: "Allergy list", type: "Allergy record", date: "02/05/2024", sortDate: "2024-05-02", author: "Dr. Sarah Johnson, MD", org: "Maastricht UMC+", format: ".pdf", category: "allergies" },
      { id: "d13", name: "Palliative nursing note", type: "Clinical note", date: "11/04/2024", sortDate: "2024-04-11", author: "Dr. Robert Wilson, MD", org: "Maastricht UMC+", format: ".pdf", category: "clinical-notes" },
      { id: "d14", name: "Treatment consent form", type: "Consent record", date: "14/03/2024", sortDate: "2024-03-14", author: "Dr. James Thompson, MD", org: "GP Practice de Linde, Amersfoort", format: ".pdf", category: "consents" },
      { id: "d15", name: "Lab results", type: "Lab report", date: "09/01/2024", sortDate: "2024-01-09", author: "Dr. Michael Brown, MD", org: "Maastricht UMC+", format: ".pdf", category: "diagnostics" },
      { id: "d16", name: "Lab results", type: "Lab report", date: "22/11/2023", sortDate: "2023-11-22", author: "Dr. Sarah Johnson, MD", org: "Maastricht UMC+", format: ".pdf", category: "diagnostics" },
      // The two documents the user specifically asked to include — dated
      // close to the caremap's own creation (12/8/2026), tying them to
      // entering palliative care rather than sitting arbitrarily in the past.
      { id: "d18", name: "Patient consent", type: "Consent record", date: "12/08/2026", sortDate: "2026-08-12", author: "Dr. HENLEY, Maria", org: "GP Practice de Linde, Amersfoort", format: ".pdf", category: "consents" },
    ],
  },
  {
    id: "xds",
    name: "XDS",
    delayMs: () => 2000 + Math.random() * 1500,
    outcome: "empty",
    entries: [],
  },
  {
    id: "other",
    name: "Other source",
    delayMs: () => 4000 + Math.random() * 2000,
    outcome: "loaded",
    entries: [
      { id: "d17", name: "Insurance card", type: "Insurance record", date: "30/06/2023", sortDate: "2023-06-30", author: "Dr. Linda Smith, MD", org: "UMC Utrecht", format: ".pdf", category: "insurance" },
      { id: "d19", name: "Professional summary", type: "Clinical summary", date: "20/08/2026", sortDate: "2026-08-20", author: "Dr. Emily Carter, MD", org: "Maastricht UMC+", format: ".pdf", category: "assessments" },
    ],
  },
];

// The Sources breakdown panel — same visual language as PX360's SourcesHeader
// (StatusIcon/FadeSwap, "Latest N of M records loaded"), but deliberately
// without a "failed"/retry branch: no `DOC_SOURCES` entry can ever reach that
// state, so the UI for it would be dead code here, unlike PX360 where it's a
// real, reachable outcome.
function DocumentsSourcesPanel({ sourcesOpen, setSourcesOpen, sourceStatus, loadedCount, allSettled, lastUpdated, onRefresh }) {
  const { t, lang } = useLanguage();
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[22px] font-semibold leading-tight" style={{ color: T.bodyText }}>{t("Documents")}</h2>
        <div className="flex items-center gap-3 text-sm" style={{ color: T.gray600 }}>
          <button onClick={() => setSourcesOpen((v) => !v)} className="flex items-center gap-1.5">
            <span className="relative block w-[14px] h-[14px]">
              <AnimatePresence initial={false}>
                <motion.span
                  key={allSettled ? "done" : "pending"}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={iconSpring}
                >
                  {allSettled
                    ? <CheckCircle2 size={14} style={{ color: T.success }} />
                    : <AlertCircle size={14} style={{ color: T.warning, fill: T.warning, stroke: "#fff" }} />}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="underline underline-offset-2" style={{ color: T.bodyText }}>
              {t("Sources")} ({loadedCount}/{DOC_SOURCES.length} {t("loaded")})
            </span>
            {sourcesOpen ? <ChevronUp size={14} style={{ color: T.primary }} /> : <ChevronDown size={14} style={{ color: T.primary }} />}
          </button>
          <FadeSwap id={allSettled ? "complete" : "updating"}>
            {allSettled
              ? <span>{t("Complete as of")} {lastUpdated ? formatClock(lastUpdated) : "—"}</span>
              : <span>{t("Updated:")} {lastUpdated ? formatClock(lastUpdated) : "—"}</span>}
          </FadeSwap>
          <motion.button onClick={onRefresh} aria-label={t("Refresh")} whileTap={{ scale: 0.85, rotate: 90 }}>
            <RefreshCw size={15} style={{ color: T.primary }} />
          </motion.button>
          <button className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded" style={{ backgroundColor: T.primary }}>
            <Plus size={15} /> {t("Add document")}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {sourcesOpen && (
          <motion.div
            key="doc-sources-panel"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="rounded-md overflow-hidden mb-4 border border-[#DEE2E6]">
              {DOC_SOURCES.map((source, i) => {
                const status = sourceStatus[source.id] || { state: "loading" };
                const showSubline = status.state === "empty" || (status.state === "loaded" && status.fetched < status.total);
                return (
                  <div
                    key={source.id}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm ${i > 0 ? "border-t border-white" : ""}`}
                    style={{ backgroundColor: T.lightBg }}
                  >
                    <div className="flex items-center gap-2.5">
                      <StatusIcon state={status.state} />
                      <div>
                        <div className="font-semibold text-[14px]" style={{ color: T.bodyText }}>{source.name}</div>
                        <AnimatePresence initial={false}>
                          {showSubline && (
                            <motion.div
                              key="subline"
                              className="overflow-hidden"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <div className="text-[13px]" style={{ color: T.gray500 }}>
                                {status.state === "empty"
                                  ? t("No records found for this patient")
                                  : (lang === "nl"
                                      ? `Laatste ${status.fetched} van ${status.total} records geladen`
                                      : `Latest ${status.fetched} of ${status.total} records loaded`)}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <FadeSwap id={status.state === "loading" ? `loading-${status.phase || "initial"}` : status.state} className="text-sm">
                      {status.state === "loading" && (
                        <span style={{ color: T.gray600 }}>{status.phase === "more" ? t("fetching more…") : t("fetching…")}</span>
                      )}
                      {(status.state === "loaded" || status.state === "empty") && <span style={{ color: T.gray600 }}>{formatClock(status.time)}</span>}
                    </FadeSwap>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Main Documents view — a filterable/sortable document table fed by the same
// progressive multi-source loading pattern PX360's Encounters uses, ported
// from vitaly-documents-prototype. Reuses this app's own chrome (see
// `DocumentsScreen` below) rather than the source repo's own duplicate shell,
// same rationale as the PX360 port.
function DocumentsSection({ scrollRef }) {
  const { t, lang } = useLanguage();
  const [runId, setRunId] = useState(0);
  const [sourceStatus, setSourceStatus] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);
  const [queuedItems, setQueuedItems] = useState(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [nameQuery, setNameQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const sortOrderRef = useRef("newest");

  const allItemsRef = useRef([]);
  const timeoutsRef = useRef([]);
  const userScrolledRef = useRef(false);
  const queuePendingRef = useRef(false);
  const fetchedRef = useRef({});

  const statuses = Object.values(sourceStatus);
  const pendingCount = statuses.filter((s) => s.state === "loading").length;
  const loadedCount = statuses.filter((s) => s.state === "loaded" || s.state === "empty").length;
  const allSettled = statuses.length > 0 && pendingCount === 0;

  const applySort = useCallback((list, order) => {
    const o = order || sortOrderRef.current;
    return [...list].sort((a, b) =>
      o === "oldest" ? new Date(a.sortDate) - new Date(b.sortDate) : new Date(b.sortDate) - new Date(a.sortDate)
    );
  }, []);

  const toggleSortOrder = () => {
    const next = sortOrder === "newest" ? "oldest" : "newest";
    sortOrderRef.current = next;
    setSortOrder(next);
    setVisibleItems((prev) => applySort(prev, next));
    setQueuedItems((prev) => (prev ? applySort(prev, next) : prev));
  };

  // phase: "initial" for the first fetch, "more" for pagination fetches
  // triggered by Show more. Every source resolves to "loaded" or "empty" —
  // never "failed" (see DOC_SOURCES).
  const runSource = useCallback((source, opts = {}) => {
    const phase = opts.phase || "initial";
    setSourceStatus((prev) => ({ ...prev, [source.id]: { ...prev[source.id], state: "loading", phase } }));
    const t = setTimeout(() => {
      const now = new Date();
      const state = source.outcome === "empty" ? "empty" : "loaded";
      const already = fetchedRef.current[source.id] || 0;
      const slice = state === "loaded" ? source.entries.slice(already, already + DOC_FETCH_PAGE) : [];
      if (state === "loaded") fetchedRef.current[source.id] = already + slice.length;
      setSourceStatus((prev) => ({
        ...prev,
        [source.id]: { state, time: now, phase, fetched: fetchedRef.current[source.id] || 0, total: source.entries.length },
      }));
      setLastUpdated(now);

      if (slice.length) {
        allItemsRef.current = [...allItemsRef.current, ...slice];
        const sorted = applySort(allItemsRef.current);
        const engaged = userScrolledRef.current && phase !== "more";
        if (queuePendingRef.current || engaged) {
          queuePendingRef.current = true;
          setQueuedItems(sorted);
        } else {
          setVisibleItems(sorted);
        }
      }
    }, opts.delayMs ? opts.delayMs() : source.delayMs());
    timeoutsRef.current.push(t);
  }, [applySort]);

  const startSimulation = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    allItemsRef.current = [];
    setVisibleItems([]);
    setQueuedItems(null);
    userScrolledRef.current = false;
    queuePendingRef.current = false;
    fetchedRef.current = {};
    setSourceStatus(Object.fromEntries(DOC_SOURCES.map((s) => [s.id, { state: "loading" }])));
    DOC_SOURCES.forEach((s) => runSource(s));
  }, [runSource]);

  useEffect(() => {
    startSimulation();
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [runId]);


  // Ask every fully-responded source that still has server-side records for
  // its next page. Their status rows return to a (re)fetching state.
  const fetchMoreFromSources = () => {
    DOC_SOURCES.forEach((source) => {
      const st = sourceStatus[source.id];
      const fetched = fetchedRef.current[source.id] || 0;
      if (st?.state === "loaded" && fetched < source.entries.length) {
        runSource(source, { phase: "more", delayMs: () => 3000 + Math.random() * 2000 });
      }
    });
  };

  const applyQueued = () => {
    setVisibleItems(queuedItems);
    setQueuedItems(null);
    queuePendingRef.current = false;
  };

  // Engagement tracks the page scroll (the whole content column scrolls).
  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;
    const onScroll = () => {
      userScrolledRef.current = el.scrollTop > 100;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  // Records known to exist on the server but not yet fetched. Hidden
  // entirely once the picture is complete.
  const serverRemaining = DOC_SOURCES.reduce((sum, s) => {
    const st = sourceStatus[s.id];
    return st?.state === "loaded" ? sum + (st.total - st.fetched) : sum;
  }, 0);

  // Live per-category counts over whatever has already merged in.
  const categoryCounts = visibleItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const authorOptions = [...new Set(visibleItems.map((d) => d.author))].sort();
  const orgOptions = [...new Set(visibleItems.map((d) => d.org))].sort();

  const passesFilters = (item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (authorFilter && item.author !== authorFilter) return false;
    if (orgFilter && item.org !== orgFilter) return false;
    if (dateFrom && item.sortDate < dateFrom) return false;
    if (dateTo && item.sortDate > dateTo) return false;
    if (nameQuery.trim()) {
      const q = nameQuery.trim().toLowerCase();
      if (!t(item.name).toLowerCase().includes(q) && !t(item.type).toLowerCase().includes(q)) return false;
    }
    return true;
  };

  const displayedItems = visibleItems.filter(passesFilters);

  const clearFilters = () => {
    setCategoryFilter("all");
    setNameQuery("");
    setAuthorFilter("");
    setOrgFilter("");
    setDateFrom("");
    setDateTo("");
  };
  const filtersActive = categoryFilter !== "all" || nameQuery || authorFilter || orgFilter || dateFrom || dateTo;

  return (
    <div>
      <DocumentsSourcesPanel
        sourcesOpen={sourcesOpen}
        setSourcesOpen={setSourcesOpen}
        sourceStatus={sourceStatus}
        loadedCount={loadedCount}
        allSettled={allSettled}
        lastUpdated={lastUpdated}
        onRefresh={() => setRunId((r) => r + 1)}
      />

      <div className="grid grid-cols-[260px_1fr] gap-6 items-start">
        <div className="border rounded-md overflow-hidden bg-white sticky top-6" style={{ borderColor: T.border }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: T.border }}>
            <span className="text-[13px] font-bold tracking-wide" style={{ color: T.bodyText }}>{t("FILTERS")}</span>
          </div>
          <button
            onClick={() => setCategoryFilter("all")}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] font-semibold"
            style={categoryFilter === "all" ? { backgroundColor: T.primary, color: "#fff" } : { color: T.bodyText }}
          >
            <LayoutList size={16} /> {t("All")}
          </button>
          {DOCUMENT_CATEGORIES.map(({ key, label, icon: Icon }) => {
            const active = categoryFilter === key;
            const count = categoryCounts[key] || 0;
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                disabled={count === 0}
                className={`w-full flex items-center justify-between gap-2.5 px-4 py-2.5 text-[14px] border-t ${count === 0 ? "cursor-default" : ""}`}
                style={{
                  borderColor: T.border,
                  backgroundColor: active ? T.primary : "#fff",
                  color: active ? "#fff" : count === 0 ? T.gray400 : T.bodyText,
                }}
              >
                <span className="flex items-center gap-2.5 text-left">
                  <Icon size={16} style={{ color: active ? "#fff" : count === 0 ? T.gray400 : T.primary }} className="shrink-0" />
                  {t(label)}
                </span>
                <FadeSwap id={count} className="text-[13px] tabular-nums shrink-0">
                  <span>({count})</span>
                </FadeSwap>
              </button>
            );
          })}
        </div>

        <div className="min-w-0">
          <div className="bg-white rounded-[4px] p-6 mb-6" style={{ boxShadow: T.cardShadow }}>
            <div className="flex items-end gap-6 flex-wrap">
              <FilterField label="Document name">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: T.gray500 }} />
                  <input
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    placeholder={t("Type search term")}
                    className="pl-8 pr-3 py-2 text-[14px] rounded border bg-white outline-none w-52"
                    style={{ borderColor: T.gray400, color: T.bodyText }}
                  />
                </div>
              </FilterField>
              <FilterField label="Author">
                <Select style={selectStyle} value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)}>
                  <option value="">{t("Please select")}</option>
                  {authorOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select>
              </FilterField>
              <FilterField label="Organisation">
                <Select style={selectStyle} value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)}>
                  <option value="">{t("Please select")}</option>
                  {orgOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              </FilterField>
              <div style={{ width: 160 }}>
                <FilterField label="From">
                  <input type="date" className={selectCls} style={selectStyle} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </FilterField>
              </div>
              <div style={{ width: 160 }}>
                <FilterField label="To">
                  <input type="date" className={selectCls} style={selectStyle} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </FilterField>
              </div>
              {filtersActive && (
                <button onClick={clearFilters} className="text-[14px] font-semibold pb-2" style={{ color: T.primary }}>
                  {t("Clear filters")}
                </button>
              )}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {queuedItems && (
              <motion.div
                key="queued-banner"
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <motion.button
                  onClick={applyQueued}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mb-3 flex items-center justify-center gap-2 text-sm rounded-md py-2 border"
                  style={{ backgroundColor: T.light, borderColor: T.primary, color: T.primary }}
                >
                  <ArrowDown size={14} /> {t("New documents available — click to update")}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border rounded-md overflow-hidden bg-white" style={{ borderColor: T.border }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: T.border, backgroundColor: T.light }}>
                  <th className="px-4 py-2.5 text-[13px] font-semibold" style={{ color: T.gray600 }}>{t("Document name")}</th>
                  <th className="px-4 py-2.5 text-[13px] font-semibold" style={{ color: T.gray600 }}>{t("Document type")}</th>
                  <th className="px-4 py-2.5 text-[13px] font-semibold">
                    <button onClick={toggleSortOrder} className="flex items-center gap-1" style={{ color: T.gray600 }}>
                      {t("Date")}
                      <motion.span animate={{ rotate: sortOrder === "oldest" ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ArrowUpDown size={12} />
                      </motion.span>
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-[13px] font-semibold" style={{ color: T.gray600 }}>{t("Author")}</th>
                  <th className="px-4 py-2.5 text-[13px] font-semibold" style={{ color: T.gray600 }}>{t("Organisation")}</th>
                  <th className="px-4 py-2.5 text-[13px] font-semibold" style={{ color: T.gray600 }}>{t("Format")}</th>
                  <th className="px-2 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {visibleItems.length === 0 && (
                    <motion.tr key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={7} className="text-sm py-8 text-center" style={{ color: T.gray500 }}>
                        <span className="inline-flex items-center gap-2">
                          <LoaderCircle size={16} className="animate-spin" style={{ color: T.primary }} />
                          {t("Loading first results…")}
                        </span>
                      </td>
                    </motion.tr>
                  )}
                  {visibleItems.length > 0 && displayedItems.length === 0 && (
                    <motion.tr key="filtered-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={7} className="text-sm py-8 text-center" style={{ color: T.gray500 }}>
                        {t("No documents match the selected filters.")}{" "}
                        <button onClick={clearFilters} className="underline font-semibold" style={{ color: T.primary }}>
                          {t("Clear filters")}
                        </button>
                      </td>
                    </motion.tr>
                  )}
                  {displayedItems.map((doc) => (
                    <motion.tr
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ ...cardSpring, opacity: { duration: 0.25 } }}
                      className="border-b hover:bg-black/[0.015]"
                      style={{ borderColor: T.border }}
                    >
                      <td className="px-4 py-3 text-[14px] font-semibold" style={{ color: T.bodyText }}>{t(doc.name)}</td>
                      <td className="px-4 py-3 text-[14px]" style={{ color: T.gray700 }}>{t(doc.type)}</td>
                      <td className="px-4 py-3 text-[14px]" style={{ color: T.gray700 }}>{doc.date}</td>
                      <td className="px-4 py-3 text-[14px]" style={{ color: T.gray700 }}>{doc.author}</td>
                      <td className="px-4 py-3 text-[14px]" style={{ color: T.gray700 }}>{doc.org}</td>
                      <td className="px-4 py-3 text-[14px]" style={{ color: T.gray700 }}>{doc.format}</td>
                      <td className="px-2 py-3 text-center">
                        <button aria-label={t("More actions")}><MoreHorizontal size={16} style={{ color: T.gray500 }} /></button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <AnimatePresence initial={false}>
            {serverRemaining > 0 && (
              <motion.div
                key="show-more"
                className="flex justify-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  onClick={fetchMoreFromSources}
                  whileTap={{ scale: 0.97 }}
                  className="border text-sm rounded-md px-6 py-2"
                  style={{ borderColor: T.primary, color: T.primary }}
                >
                  {t("Show more")}{" "}
                  <FadeSwap id={serverRemaining} className="inline-flex">
                    <span>({serverRemaining})</span>
                  </FadeSwap>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DocumentsScreen({ hasCaremap, onBack, onNavigate, persona, onSwitchPersona, onReset, unreadCount, onOpenNotifications, caseManagerPersonaId, sidebarCollapsed, onToggleSidebar }) {
  const contentScrollRef = useRef(null);
  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <Sidebar activeLabel="Patients" onNavigate={onNavigate} unreadCount={unreadCount} collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader persona={persona} onSwitchPersona={onSwitchPersona} onReset={onReset} unreadCount={unreadCount} onOpenNotifications={onOpenNotifications} caseManagerPersonaId={caseManagerPersonaId} />
        <PatientBar back={onBack} activeTab="DOCUMENTS" onTabClick={onNavigate} />
        <div ref={contentScrollRef} className="flex-1 overflow-y-auto" style={{ backgroundColor: T.light }}>
          <div className="px-8 py-6">
            <DocumentsSection scrollRef={contentScrollRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HIS shell (start screen) ================= */

function EHRSection({ title, children, empty }) {
  return (
    <div className="mb-3">
      <div className="text-white text-[12px] font-semibold px-3 py-1.5 flex items-center justify-between" style={{ backgroundColor: T.secondary }}>
        {title} <span className="opacity-60 text-[11px]">…</span>
      </div>
      <div className="border border-t-0 p-3 text-[12px] space-y-1.5 min-h-[26px]" style={{ borderColor: T.border, color: T.gray700 }}>
        {empty ? <div className="border-t" style={{ borderColor: T.border }} /> : children}
      </div>
    </div>
  );
}

// A single "Medicatie" row — small status square + edit pencil + drug/dosage
// text, matching the reference EHR screenshot's medication list styling.
function MedicationRow({ text }) {
  return (
    <div className="flex items-start gap-1.5">
      <span
        className="w-3.5 h-3.5 rounded-sm shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-bold text-white"
        style={{ backgroundColor: T.success }}
      >
        1
      </span>
      <Pencil size={10} className="shrink-0 mt-1" style={{ color: T.gray500 }} />
      <span>{text}</span>
    </div>
  );
}

// Simulated legacy Dutch GP EHR (the system the caremap is created from) —
// deliberately kept in Dutch regardless of the app's own language toggle,
// same as before (see docs/features/i18n-english-dutch.md). Recreated to
// match a fuller reference screenshot: a narrow nav rail (patient header,
// tabs, Overzichten/ToDo shortcuts) alongside a two-column clinical record
// (Patiëntgegevens/Episodelijst/Aandachtspunten/Overige voorgeschiedenis on
// the left, Medicatie/Allergieën en bijwerkingen/Behandelbeperking on the
// right), rather than the single narrower column this had before.
function LegacyEHRPanel() {
  return (
    <div className="shrink-0 flex flex-col text-[12px]" style={{ width: 760, backgroundColor: "#F1F3F5", borderRight: `1px solid ${T.border}` }}>
      <div className="flex flex-1 min-h-0">
        <div className="w-[270px] shrink-0 flex flex-col border-r overflow-y-auto" style={{ borderColor: T.border }}>
          <div className="px-3 py-3 border-b" style={{ borderColor: T.border, backgroundColor: "#fff" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-300 shrink-0" />
              <div>
                <div className="font-bold text-[13px]" style={{ color: T.bodyText }}>DE VRIES, Jan</div>
                <div style={{ color: T.gray600 }}>14-03-1953 (73 jr)</div>
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
          <div className="p-3">
            <div className="flex items-center gap-3 text-[13px] mb-3" style={{ color: T.gray600 }}>
              <span>📋</span><span>📄</span><span>📢</span>
            </div>
            <div className="font-bold text-[11px] mb-1.5" style={{ color: T.bodyText }}>Overzichten</div>
            <div className="space-y-1 mb-3" style={{ color: T.primary }}>
              <div>Spreekuuroverzicht</div>
              <div className="flex items-center gap-1.5">Grafisch agendaoverzicht <span className="text-[10px]">🖥️</span></div>
            </div>
            <div className="font-bold text-[11px] mb-1.5" style={{ color: T.bodyText }}>ToDo</div>
            <div className="space-y-1" style={{ color: T.primary }}>
              <div>Mijn werklijst</div>
              <div>Postvak in</div>
              <div>Arts accordatielijst</div>
              <div>Te beantwoorden e-consults afhandelen</div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-x-3 content-start" style={{ backgroundColor: "#F1F3F5" }}>
          <div>
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
            <EHRSection title="Overige voorgeschiedenis" empty />
          </div>
          <div>
            <EHRSection title="Medicatie">
              <MedicationRow text="VASELINECETOMACROGOL CREME (CUTAAN), 3x daags smeren" />
              <MedicationRow text="HYDROCORTISON-ACETAAT CREME 10MG/G (CUTAAN), 2x daags smeren" />
            </EHRSection>
            <EHRSection title="Allergieën en bijwerkingen" empty />
            <EHRSection title="Behandelbeperking">
              <div>Beleid&nbsp;: reanimeren zonder beperking,</div>
            </EHRSection>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-white text-[11px] shrink-0" style={{ backgroundColor: T.secondary }}>
        <span>▲ Overige acties</span>
        <span>✕ Sluiten</span>
      </div>
    </div>
  );
}

function AppRow({ icon: Icon, title, desc, children }) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-4 py-5 border-b" style={{ borderColor: T.border }}>
      <div className="w-11 h-11 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: T.secondary }}>
        <Icon size={18} color="#fff" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-[14px]" style={{ color: T.secondary }}>{t(title)}</div>
        <div className="text-[13px] mt-0.5 mb-3" style={{ color: T.gray600 }}>{t(desc)}</div>
        <div className="flex items-center gap-4">{children}</div>
      </div>
    </div>
  );
}

// The outer chrome above both panels — simulating the host HIS application's
// own window frame (title/patient-context strip + a row of generic toolbar
// icons), which is what makes the "Vitaly opened as a panel inside the GP's
// own system" framing read as a real embedded app rather than two unrelated
// screens side by side. Decorative only, same treatment as LegacyEHRPanel.
function HISChromeBar() {
  return (
    <div className="shrink-0">
      <div className="flex items-center justify-between px-3 py-1.5 text-white" style={{ backgroundColor: T.secondary }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[12px]">
            <span>📁</span><span>🔧</span><span>⚙️</span><span>❓</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-semibold">
            <span>🗂️</span> Huisarts
          </div>
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          <span>💬</span><span>📏</span><span>☁️</span><span>▶️</span><span>📄</span><span>🖨️</span><span>🖥️</span>
          <span className="w-px h-4" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
          <span>⛶</span><span>✕</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 text-[11px]" style={{ backgroundColor: "#E9EDF1", color: T.gray700 }}>
        27-02-2017 : 03-03-2017 | De Vries, J. <Pencil size={10} style={{ color: T.gray600 }} />
      </div>
    </div>
  );
}

// The real ACP (Advanced Care Planning) system this HIS row now links out
// to — a genuinely separate application, not something this prototype
// simulates, so it opens in a new tab rather than navigating away from the
// demo (same reasoning as any external link out of a single-page app).
const ACP_EXTERNAL_URL =
  "https://better-acc.rso-zuidlimburg.nl/institution/patient-list;panelTitle=Patient%20List/patient/304/dashboard/careplan-study-list;panelTitle=PATIENT.DASHBOARD.CARE_PLANS_AND_REGISTRIES";

function HISShell({ hasCaremap, onCreate, onOpen, onOpenPx360 }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <HISChromeBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LegacyEHRPanel />
        <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: T.light }}>
          <div className="px-8 py-4 flex items-center" style={{ backgroundColor: T.secondary }}>
            <img src={vitalyLogo} alt="OpenLine Vitaly" className="h-8 w-auto" />
          </div>
          <div className="p-10 max-w-2xl">
            <h2 className="text-[20px] font-semibold mb-6" style={{ color: T.bodyText }}>{t("Choose the application you would like to open")}</h2>
            <div className="bg-white rounded shadow-sm px-6">
              <AppRow icon={ClipboardList} title="Advanced Care Planning (ACP)" desc="Create, manage, and review personalised care plans and patient preferences.">
                <Btn small variant="outline" onClick={() => window.open(ACP_EXTERNAL_URL, "_blank", "noopener,noreferrer")}>{t("Open plan")}</Btn>
              </AppRow>
              <AppRow icon={UsersRound} title="Multidisciplinary Team Meetings (MDT)" desc="Coordinate and manage collaborative care discussions across healthcare teams.">
                <Btn small variant="outline" disabled><Plus size={13} />{t("New referral to MDT")}</Btn>
                <span className="text-[13px] font-semibold" style={{ color: T.gray500 }}>{t("Show (3) referrals")}</span>
              </AppRow>
              <AppRow icon={User} title="Patient 360 (Px360)" desc="Access a complete, unified view of patient information, history, and activity.">
                <Btn small variant="outline" onClick={onOpenPx360}>{t("Open")}</Btn>
              </AppRow>
              <AppRow icon={FileStack} title="Caremaps" desc="Access patient-related documents and clinical files.">
                <Btn small onClick={onCreate}><Plus size={13} />{t("Create new caremap")}</Btn>
                {hasCaremap && (
                  <button onClick={onOpen} className="text-[13px] font-semibold" style={{ color: T.primary }}>
                    {t("Show (1) active caremap")}
                  </button>
                )}
              </AppRow>
            </div>
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
  const { t } = useLanguage();
  return (
    <Modal title="Create Caremap" onClose={onClose} width={520}>
      <Field label="Care unit" required>
        <Select style={selectStyle} value={unit} onChange={(e) => setUnit(e.target.value)}>
          {CARE_UNITS.map((u) => <option key={u} value={u}>{t(u)}</option>)}
        </Select>
      </Field>
      <Field label="Caremap template">
        <Select style={selectStyle} value={template} onChange={(e) => setTemplate(e.target.value)}>
          {TEMPLATES.map((tpl) => <option key={tpl} value={tpl}>{t(tpl)}</option>)}
        </Select>
      </Field>
      <div className="flex justify-end gap-3 mt-6">
        <Btn variant="neutral" onClick={onClose}>{t("Close")}</Btn>
        <Btn onClick={() => onCreate(unit, template)}>{t("Create Caremap")}</Btn>
      </div>
    </Modal>
  );
}

function SetPlanModal({ caremap, onClose, onActivate, onSaveDraft }) {
  const [toggles, setToggles] = useState(() => caremap.planToggles || defaultPlanToggles());
  const [date, setDate] = useState("2026-08-12");
  const locked = caremap.status === "active";
  const { t } = useLanguage();

  return (
    <Modal title="Set plan and activate caremap" onClose={onClose} width={760}>
      <div className="mb-5">
        <div className="font-bold text-[15px] mb-1.5" style={{ color: T.secondary }}>{t("Setting the plan")}</div>
        <div className="text-[13px] leading-relaxed" style={{ color: T.gray600 }}>
          {t("Activate or configure the activities you would like to have in the patient's care map. All mandatory activities will be added to the care map plan by default. Once you activate the plan, you will not be able to change it anymore.")}
        </div>
      </div>
      <div className="space-y-2 mb-6">
        {SET_PLAN_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between border rounded px-4 py-3" style={{ borderColor: T.border, backgroundColor: T.light }}>
            <div className="flex items-start gap-3">
              <Calendar size={16} style={{ color: T.primary }} className="mt-0.5" />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: T.bodyText }}>{t(item.label)}</div>
                <div className="text-[13px]" style={{ color: T.gray600 }}>{t(item.assignee)}</div>
              </div>
            </div>
            {item.toggle ? (
              <div className="flex flex-col items-end text-right">
                <ToggleField on={!!toggles[item.id]} onChange={() => !locked && setToggles((t) => ({ ...t, [item.id]: !t[item.id] }))} />
                <div className="text-[12px] mt-1" style={{ color: T.gray600 }}>{t(item.sub)}</div>
              </div>
            ) : (
              <div className="flex flex-col items-end text-right">
                <div className="text-[14px] font-semibold" style={{ color: T.bodyText }}>{t("Mandatory")}</div>
                <div className="text-[12px]" style={{ color: T.gray600 }}>{t(item.sub)}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mb-2">
        <div className="font-bold text-[15px] mb-1.5" style={{ color: T.secondary }}>{t("When will the plan start?")}</div>
        <div className="text-[13px] mb-2 leading-relaxed" style={{ color: T.gray600 }}>
          {t("All configured activities above will refer to the start date you set below. Start date is generally a surgery date or in case of no surgery, MDT meeting date or concluded therapy date.")}
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
        <Btn variant="neutral" onClick={onClose}>{t("Cancel")}</Btn>
        {!locked && (
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => { onSaveDraft(toggles); onClose(); }}>{t("Save as Draft")}</Btn>
            <Btn onClick={() => { onActivate(date, toggles); onClose(); }}>{t("Activate caremap")}</Btn>
          </div>
        )}
      </div>
    </Modal>
  );
}

// `fixedRole` set: reassigning an existing named slot (e.g. the Case
// Manager card's "Re-Assign member") — shown fixed, not pickable.
// `fixedRole` null: adding a new team member with no role to name up
// front — skips straight to the person picker below, and whoever's
// picked joins the team labeled by their own job title (see
// handleAddTeamMember), same label convention as an activity-only
// assignee gets.
function AssignRoleModal({ fixedRole, onClose, onAssign, onAddMember }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const { t } = useLanguage();
  const jobTitles = [...new Set(MEMBER_POOL.map((m) => m.jobTitle))];
  const filtered = MEMBER_POOL.filter(
    (m) => m.name.toLowerCase().includes(query.toLowerCase()) && (!jobFilter || m.jobTitle === jobFilter)
  );

  return (
    <Modal title="Assign member a role" onClose={onClose} width={820}>
      {fixedRole && (
        <div className="mb-4 text-[14px]" style={{ color: T.bodyText }}>
          {t("Assign member to role:")}{" "}
          <span className="font-bold" style={{ color: T.primary }}>{t(fixedRole)}</span>
        </div>
      )}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center border rounded px-3 py-2" style={{ borderColor: T.gray400 }}>
          <Search size={14} style={{ color: T.gray600 }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search")} className="ml-2 text-[14px] w-full outline-none" />
        </div>
        <Select style={selectStyle} wrapperStyle={{ maxWidth: 190 }} value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
          <option value="">{t("Job title")}</option>
          {jobTitles.map((j) => <option key={j} value={j}>{t(j)}</option>)}
        </Select>
      </div>
      <div className="border rounded overflow-hidden" style={{ borderColor: T.border }}>
        <div className="grid text-[12px] font-bold uppercase px-4 py-2.5" style={{ gridTemplateColumns: "24px 1.4fr 1fr 1.4fr 1.4fr", backgroundColor: T.light, color: T.gray600 }}>
          <div /><div>{t("First and last name")}</div><div>{t("Job title")}</div><div>{t("Organisation")}</div><div>{t("Contact")}</div>
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
              <div style={{ color: T.gray600 }}>{t(m.jobTitle)}</div>
              <div style={{ color: T.gray600 }}>{m.org}</div>
              <div style={{ color: T.primary }}>{m.email}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px]" style={{ color: T.gray600 }}>{t("No matching members.")}</div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Btn variant="neutral" onClick={onClose}>{t("Cancel")}</Btn>
        <Btn disabled={!selected} onClick={() => (fixedRole ? onAssign(fixedRole, selected) : onAddMember(selected))}>
          {t("Assign a member")}
        </Btn>
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
  const { t } = useLanguage();
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
            <option value="" disabled>{t("Please select")}</option>
            <optgroup label={t("To do")}>
              {TODO_STATUSES.map((s) => <option key={s} value={s}>{t(STATUS_CONFIG[s].label)}</option>)}
            </optgroup>
            <optgroup label={t("Resolved")}>
              {RESOLVED_STATUSES.map((s) => <option key={s} value={s}>{t(STATUS_CONFIG[s].label)}</option>)}
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

// By default, options come from the selected provider's staff. Pass
// `members` explicitly to source from a fixed pool instead (e.g. the
// "Assign Case manager" task, which isn't tied to any provider).
function AssignToField({ assignee, setAssignee, provider, members }) {
  const staff = members || staffForProvider(provider);
  const empty = !members && !provider;
  const { t } = useLanguage();
  return (
    <Field label="Assign to">
      <Select style={selectStyle} value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled={empty}>
        <option value="">{t("Unassigned")}</option>
        {staff.map((m) => <option key={m.id} value={m.id}>{m.name} ({t(m.jobTitle)})</option>)}
      </Select>
      {empty && (
        <div className="text-[12px] mt-1" style={{ color: T.gray600 }}>{t("Select a provider first to see who's available to assign.")}</div>
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
  const { t } = useLanguage();

  const setField = (key, value) => setFields((f) => ({ ...f, [key]: value }));
  const canSubmit = !!type && !!status;

  const submit = () => {
    onAdd({ type, provider, status, fields, comment, assignee: NO_ASSIGNEE_STATUSES.includes(status) ? "" : assignee });
    onClose();
  };

  return (
    <Modal title="Add new activity" onClose={onClose} width={620}>
      <Field label="Activity type" required>
        <Select style={selectStyle} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="" disabled>{t("Please select")}</option>
          {ACTIVITY_TYPES.map((at) => <option key={at} value={at}>{t(at)}</option>)}
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
              <option value="" disabled>{t("Please select")}</option>
              {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>

          {!NO_ASSIGNEE_STATUSES.includes(status) && (
            <AssignToField assignee={assignee} setAssignee={setAssignee} provider={provider} />
          )}

          <Field label="Write your comment" required>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("Autosize height based on content lines")}
              className={selectCls}
              style={{ ...selectStyle, minHeight: 90, resize: "vertical" }}
            />
          </Field>
          <button className="flex items-center gap-2 text-[14px] font-semibold mb-2" style={{ color: T.primary }}>
            <Plus size={14} /> {t("Add document")}
          </button>
        </>
      )}

      <div className="flex justify-between mt-6">
        <Btn variant="neutral" onClick={onClose}>{t("Cancel")}</Btn>
        <Btn disabled={!canSubmit} onClick={submit}>{t("Add Activity")}</Btn>
      </div>
    </Modal>
  );
}

const STATUS_FIELD_KEYS = ["requiredMonth", "planningMonth", "scheduledDate", "hour", "location", "completedDate", "declinedDate", "cancelledDate"];

function EditActivityModal({ activity, onClose, onSave }) {
  const isCaseManagerTask = activity.id === CASE_MANAGER_ACTIVITY_ID;
  const [status, setStatus] = useState(activity.status);
  const [fields, setFields] = useState(() => {
    const f = {};
    STATUS_FIELD_KEYS.forEach((k) => { if (activity[k] != null) f[k] = activity[k]; });
    return f;
  });
  const [provider, setProvider] = useState(activity.provider || "");
  const [comment, setComment] = useState(activity.comment || "");
  const [assignee, setAssignee] = useState(activity.assigneeId || "");
  const { t } = useLanguage();

  const setField = (key, value) => setFields((f) => ({ ...f, [key]: value }));

  const submit = () => {
    onSave({
      status,
      fields,
      provider: isCaseManagerTask ? "" : provider,
      comment,
      assigneeId: NO_ASSIGNEE_STATUSES.includes(status) ? null : assignee || null,
    });
    onClose();
  };

  return (
    <Modal title={activity.title} onClose={onClose} width={620}>
      {activity.mandatory && (
        <div className="text-[12px] mb-4" style={{ color: T.gray600 }}>
          {t("This is a mandatory plan activity — its status can still be changed at any time.")}
        </div>
      )}
      <StatusFields status={status} setStatus={setStatus} fields={fields} setField={setField} />

      {!isCaseManagerTask && (
        <Field label="Select provider">
          <Select
            style={selectStyle}
            value={provider}
            onChange={(e) => { setProvider(e.target.value); setAssignee(""); }}
          >
            <option value="">{t("Unspecified")}</option>
            {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
          </Select>
        </Field>
      )}

      {!NO_ASSIGNEE_STATUSES.includes(status) && (
        <AssignToField
          assignee={assignee}
          setAssignee={setAssignee}
          provider={provider}
          members={isCaseManagerTask ? CASE_MANAGER_CANDIDATES : undefined}
        />
      )}

      <Field label="Write your comment">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("Autosize height based on content lines")}
          className={selectCls}
          style={{ ...selectStyle, minHeight: 90, resize: "vertical" }}
        />
      </Field>

      <div className="flex justify-end gap-3 mt-6">
        <Btn variant="neutral" onClick={onClose}>{t("Cancel")}</Btn>
        <Btn disabled={!status} onClick={submit}>{t("Save")}</Btn>
      </div>
    </Modal>
  );
}

// Shared add/edit form for the Overview's "Clinical consultant" stub card.
// `consultant` is null when adding, or the existing record when editing —
// editing also offers a Remove action to clear it back to the stub state.
function ClinicalConsultantModal({ consultant, onClose, onSave, onRemove }) {
  const [name, setName] = useState(consultant?.name || "");
  const [surname, setSurname] = useState(consultant?.surname || "");
  const [phone, setPhone] = useState(consultant?.phone || "");
  const [email, setEmail] = useState(consultant?.email || "");
  const [jobTitle, setJobTitle] = useState(consultant?.jobTitle || "");
  const { t } = useLanguage();

  const canSubmit = name.trim() && surname.trim() && jobTitle;

  const submit = () => {
    onSave({ name: name.trim(), surname: surname.trim(), phone: phone.trim(), email: email.trim(), jobTitle });
    onClose();
  };

  return (
    <Modal title="Clinical consultant" onClose={onClose} width={560}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" required>
          <input type="text" className={selectCls} style={selectStyle} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Surname" required>
          <input type="text" className={selectCls} style={selectStyle} value={surname} onChange={(e) => setSurname(e.target.value)} />
        </Field>
        <Field label="Phone number">
          <input type="tel" placeholder={t("Phone number")} className={selectCls} style={selectStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Email address">
          <input type="email" className={selectCls} style={selectStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </div>
      <Field label="Job title" required>
        <Select style={selectStyle} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}>
          <option value="">{t("Select job title")}</option>
          {CONSULTANT_JOB_TITLES.map((j) => <option key={j} value={j}>{t(j)}</option>)}
        </Select>
      </Field>
      <div className="flex justify-between mt-6">
        {consultant ? (
          <Btn variant="danger" onClick={() => { onRemove(); onClose(); }}><Trash2 size={16} />{t("Remove")}</Btn>
        ) : <div />}
        <div className="flex gap-3">
          <Btn variant="neutral" onClick={onClose}>{t("Cancel")}</Btn>
          <Btn disabled={!canSubmit} onClick={submit}>{t("Save")}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// Shared add/edit form for one entry in the Overview's "Emergency contact"
// stub card. `contact` is null when adding, or the existing record when
// editing — editing also offers a Remove action for that one contact. A
// caremap can hold any number of these (see `emergencyContacts`).
function EmergencyContactModal({ contact, onClose, onSave, onRemove }) {
  const [relation, setRelation] = useState(contact?.relation || "");
  const [firstName, setFirstName] = useState(contact?.firstName || "");
  const [lastName, setLastName] = useState(contact?.lastName || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [phone, setPhone] = useState(contact?.phone || "");
  const [address, setAddress] = useState(contact?.address || "");
  const { t } = useLanguage();

  const canSubmit = relation && firstName.trim() && lastName.trim();

  const submit = () => {
    onSave({
      id: contact?.id || `ec-${Date.now()}`,
      relation,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    onClose();
  };

  return (
    <Modal title={contact ? "Edit contact person" : "Add contact person"} onClose={onClose} width={620}>
      <Field label="Relation to patient" required>
        <Select style={selectStyle} value={relation} onChange={(e) => setRelation(e.target.value)}>
          <option value="">{t("Please select")}</option>
          {EMERGENCY_CONTACT_RELATIONS.map((r) => <option key={r} value={r}>{t(r)}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" required>
          <input type="text" className={selectCls} style={selectStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </Field>
        <Field label="Last name" required>
          <input type="text" className={selectCls} style={selectStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Field>
        <Field label="Email address">
          <input type="email" className={selectCls} style={selectStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Telephone number">
          <input type="tel" className={selectCls} style={selectStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>
      <Field label="Address">
        <input type="text" className={selectCls} style={selectStyle} value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
      <div className="flex justify-between mt-6">
        {contact ? (
          <Btn variant="danger" onClick={() => { onRemove(contact.id); onClose(); }}><Trash2 size={16} />{t("Remove")}</Btn>
        ) : <div />}
        <div className="flex gap-3">
          <Btn variant="outline" onClick={onClose}>{t("Close")}</Btn>
          <Btn disabled={!canSubmit} onClick={submit}>{t("Save")}</Btn>
        </div>
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
  const { t, lang } = useLanguage();
  const memberName = MEMBER_POOL.find((m) => m.id === activity.assigneeId)?.name;
  const cfg = STATUS_CONFIG[activity.status] || STATUS_CONFIG.undefined;
  const isResolved = cfg.group === "resolved";
  const fieldValue = cfg.field ? activity[cfg.field.key] : null;
  const displayDate = fieldValue ? formatFieldValue(cfg.field.type, fieldValue, lang) : null;
  const Icon = activity.link ? FileText : Calendar;

  // Right-hand subtext under the badge: the status-specific date/time/
  // location when set, otherwise the plan item's own due/cadence label
  // (e.g. "Due: 2 weeks", "At activation") when it hasn't been touched yet.
  const rightSubtext = displayDate
    ? `${displayDate}${cfg.extra && activity.hour ? ` · ${activity.hour}` : ""}${cfg.extra && activity.location ? ` · ${activity.location}` : ""}`
    : (activity.sub ? t(activity.sub) : null);

  // Who/where line under the title: assignee (+ provider if both are set),
  // provider alone if only that's set, or "Unassigned" as the fallback.
  const assignedLine = [memberName, activity.provider].filter(Boolean).join(" · ") || t("Unassigned");

  return (
    <button
      onClick={onClick}
      className="w-full text-left border min-h-[48px] pl-[25px] pr-[11px] py-[13px] rounded-[8px] flex items-center justify-between gap-3 transition-shadow hover:shadow-sm"
      style={{ borderColor: T.border, backgroundColor: T.cardBg }}
    >
      <div className="flex items-start gap-[16px] min-w-0">
        <Icon size={20} style={{ color: T.gray500 }} className="shrink-0" />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold leading-[1.5]" style={{ color: T.muted }}>
            {t(activity.title)}
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

// Plain heading by default; pass `onClick` to make it a button (used by
// TeamSummary to jump to the Team tab — the trailing chevron already implied
// it was a link, but it wasn't wired to anything).
function SectionHeading({ children, onClick }) {
  const { t } = useLanguage();
  const content = <>{typeof children === "string" ? t(children) : children} <ChevronRight size={18} /></>;
  const className = "flex items-center gap-2 font-bold text-[18px] tracking-[0.8px] uppercase mb-6";
  if (onClick) {
    return (
      <button onClick={onClick} className={className} style={{ color: T.black }}>
        {content}
      </button>
    );
  }
  return (
    <div className={className} style={{ color: T.black }}>
      {content}
    </div>
  );
}

// The "My tasks" / "All tasks" segmented control (Figma node 13276:179528).
// Two-state only — no indeterminate/loading — so a plain click toggle beats
// a generic multi-option component here.
function TaskFilterToggle({ value, onChange }) {
  const { t } = useLanguage();
  const options = [
    { key: "all", label: "All tasks" },
    { key: "mine", label: "My tasks" },
  ];
  return (
    <div className="flex items-center gap-2 p-[3px] rounded-[4px]" style={{ backgroundColor: T.lightBg }}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className="px-2.5 py-1 rounded-[3px] text-[14px] transition-colors"
            style={
              active
                ? { backgroundColor: "#fff", color: T.bodyText, fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }
                : { color: T.bodyText, fontWeight: 400 }
            }
          >
            {t(opt.label)}
          </button>
        );
      })}
    </div>
  );
}

function ActivitiesPanel({ activities, planConfigured, onAdd, onOpenSetPlan, onEditActivity, persona }) {
  const { t } = useLanguage();
  // Defaults to "All tasks" for everyone (originally defaulted per-persona —
  // whoever held the caremap's Case Manager role got "All", everyone else
  // got "My" — simplified to one universal default per user feedback: not
  // worth the extra cognitive step of remembering who sees what by default).
  // Still resets to that default on every persona switch, so a manual pick
  // doesn't leak from one persona to the next.
  const [filterMode, setFilterMode] = useState("all");
  useEffect(() => {
    setFilterMode("all");
  }, [persona.id]);

  const mine = (a) => a.assigneeId === persona.id;
  const visibleActivities = filterMode === "mine" ? activities.filter(mine) : activities;
  const todo = visibleActivities.filter((a) => statusGroup(a.status) === "todo");
  const resolved = visibleActivities.filter((a) => statusGroup(a.status) === "resolved");
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
          {t("It looks like you haven't added any active tasks, to do so please configure a care plan by clicking on")}{" "}
          <button onClick={onOpenSetPlan} className="font-semibold underline" style={{ color: T.primary }}>
            {t("Set plan and activate")}
          </button>{" "}
          {t("button.")}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[16px] font-semibold uppercase" style={{ color: T.black }}>{t("To do")}</div>
            <TaskFilterToggle value={filterMode} onChange={setFilterMode} />
          </div>
          <div className="space-y-4">
            {todo.map((a) => <ActivityRow key={a.id} activity={a} onClick={() => onEditActivity(a.id)} />)}
            {todo.length === 0 && <div className="text-[15px]" style={{ color: T.muted }}>{t("Nothing to do right now.")}</div>}
          </div>
        </>
      )}

      <div className="mt-8 mb-4 text-[16px] font-semibold uppercase" style={{ color: T.black }}>{t("Resolved")}</div>
      {resolved.length === 0 ? (
        <div className="text-[15px]" style={{ color: T.muted }}>{t("There are no resolved activities on your agenda.")}</div>
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
function TeamMemberRow({ name, label, prominent, onClick }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center justify-between border min-h-[48px] px-[17px] py-4 rounded-[4px] relative overflow-hidden"
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
          <div className="text-[15px]" style={{ color: T.muted }}>{t(label)}</div>
        </div>
      </div>
    </button>
  );
}

// The Case Manager slot before anyone's assigned. Pulled from Figma (node
// 13292:181664 — supersedes an earlier read of node 13068:10837, which was
// missing the ribbon and led to an inline "MANDATORY" pill here for a
// while; RoleCard's own corner ribbon, node 12998:10352, was never wrong):
// an "unknown avatar" question-mark icon in the usual prominent teal
// circle, a diagonal "Mandatory" ribbon banner across the top-left corner
// (same treatment as `RoleCard`'s, mirrored to the left corner since the
// icon sits on the left here instead of centered on top), and a "Select a
// member" button on the right, opening the same AssignRoleModal the Team
// tab's RoleCard uses (fixedRole="Case manager").
//
// The button only ever shares a flex line with the name, never with the
// description line below it — those two are separate flex-wrap containers
// (name+button nested one level in, description as its own sibling
// underneath), not one combined block sized by a single min-width. An
// earlier version put all three (name, description, button) in one
// flex-wrap row with the button positioned by `items-center` against
// whatever height that combined block happened to be — at most widths that
// gave "everything on one line" or "button drops cleanly below", but at a
// handful of in-between widths the description text itself would wrap onto
// a second line while the row was *still* wide enough overall to keep the
// button on the same line, floating at an odd mid-height beside the broken
// text instead of following it. Splitting the description out removes that
// class of bug entirely: the button can now only ever sit beside a single,
// un-wrapped name line or below it — the description is free to wrap to any
// number of lines on its own row without the button caring.
// The outer icon+column row itself never wraps (no flex-wrap there): the
// icon is fixed-width, and the column takes a 140px floor (min-w-[140px],
// not min-w-0) purely so the description doesn't shrink down to wrapping
// one word per line at extreme container widths — unrelated to the
// name/button sub-row's own wrap behavior above it.
// Once filled, the Case Manager renders as a normal (prominent)
// TeamMemberRow alongside everyone else — no separate "filled" variant
// needed here.
function MandatoryRoleRow({ roleLabel, onOpenAssign }) {
  const { t } = useLanguage();
  return (
    <div
      className="relative overflow-hidden flex items-start gap-4 border rounded-[4px] px-[17px] py-4"
      style={{ borderColor: T.teamItemBorder, backgroundColor: T.cardBg }}
    >
      <div
        className="absolute -left-11 top-3 w-36 -rotate-45 text-center text-[11px] font-bold uppercase tracking-wide py-1"
        style={{ backgroundColor: T.warning, color: T.bodyText }}
      >
        {t("Mandatory")}
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: T.primary }}>
        <HelpCircle size={26} color="#fff" />
      </div>
      <div className="min-w-[140px] flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span className="text-[15px] font-semibold" style={{ color: T.black }}>{t(roleLabel)}</span>
          <Btn small onClick={() => onOpenAssign(roleLabel)} className="shrink-0">{t("Assign a case manager")}</Btn>
        </div>
      </div>
    </div>
  );
}

// Read-only profile popup for any member shown in TeamSummary/TeamTab.
// MEMBER_POOL carries job title/org/email/phone; createdBy only carries
// name/jobTitle — DetailRow (from the PX360 port, reused here) silently
// skips a field when its value is undefined, so the popup degrades
// gracefully either way.
// `roleId` is only set for a formal team role (Case manager or another
// named role) — that's what gates the "Remove from team" action below.
// Someone shown here via an activity assignment, or the caremap's creator,
// has no `roleId` and so gets the read-only popup with no removal option:
// removing them isn't a single team-entry change, it'd mean editing every
// activity that references them, a different feature from this one.
function MemberDetailModal({ member, roleLabel, roleId, onClose, onRemove }) {
  const { t } = useLanguage();
  return (
    <Modal title="Team member" onClose={onClose} width={440}>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: T.primary }}>
          <User size={30} color="#fff" />
        </div>
        <div className="min-w-0">
          <div className="text-[18px] font-semibold truncate" style={{ color: T.black }}>{member.name}</div>
          <div className="text-[14px]" style={{ color: T.muted }}>{t(roleLabel)}</div>
        </div>
      </div>
      <div className="border-t pt-4" style={{ borderColor: T.border }}>
        <DetailRow label="Job title">{t(member.jobTitle)}</DetailRow>
        <DetailRow label="Organisation">{member.org}</DetailRow>
        <DetailRow label="Email">{member.email}</DetailRow>
        <DetailRow label="Phone">{member.phone}</DetailRow>
      </div>
      {roleId && (
        <div className="mt-5 pt-4 border-t" style={{ borderColor: T.border }}>
          <Btn variant="danger" onClick={() => { onRemove(roleId); onClose(); }}>
            <Trash2 size={16} />{t("Remove from team")}
          </Btn>
        </div>
      )}
    </Modal>
  );
}

function TeamSummary({ team, activities, createdBy, onOpenAssign, onOpenTeamTab, onRemoveMember }) {
  const [viewing, setViewing] = useState(null);
  const filled = team.filter((t) => t.memberId);
  const extra = extraActivityAssignees(activities, team);
  const caseManagerFilled = filled.some((t) => t.label === "Case manager");
  return (
    <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
      <SectionHeading onClick={onOpenTeamTab}>TEAM</SectionHeading>
      <div className="space-y-4">
        {!caseManagerFilled && <MandatoryRoleRow roleLabel="Case manager" onOpenAssign={onOpenAssign} />}
        {filled.map((t) => {
          const m = MEMBER_POOL.find((x) => x.id === t.memberId);
          return (
            <TeamMemberRow
              key={t.id}
              name={m.name}
              label={t.label}
              prominent={t.label === "Case manager"}
              onClick={() => setViewing({ member: m, roleLabel: t.label, roleId: t.id })}
            />
          );
        })}
        {extra.map((m) => (
          <TeamMemberRow key={m.id} name={m.name} label={m.jobTitle} prominent={false} onClick={() => setViewing({ member: m, roleLabel: m.jobTitle })} />
        ))}
        {createdBy && (
          <TeamMemberRow
            name={createdBy.name}
            label={createdBy.jobTitle}
            prominent={false}
            onClick={() => setViewing({ member: createdBy, roleLabel: createdBy.jobTitle })}
          />
        )}
      </div>
      {viewing && (
        <MemberDetailModal
          member={viewing.member}
          roleLabel={viewing.roleLabel}
          roleId={viewing.roleId}
          onRemove={onRemoveMember}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

// The generic "add another role" slot — no role assigned to it yet, always
// dashed, never carries the Case Manager's prominent styling.
function AddRoleCard({ onOpenAssign }) {
  const { t } = useLanguage();
  return (
    <div className="w-64 rounded-[4px] p-6 flex flex-col items-center text-center" style={{ border: "1px dashed #AAA5A5", backgroundColor: "#fff" }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "#E9ECEF" }}>
        <User size={26} color={T.gray500} />
      </div>
      <div className="font-semibold text-[15px] mb-0.5" style={{ color: T.black }}>{t("Add additional members")}</div>
      <div className="text-[15px] mb-4" style={{ color: T.muted }}>{t("Please assign additional members")}</div>
      <Btn small onClick={() => onOpenAssign(null)}>{t("Select a member")}</Btn>
    </div>
  );
}

function RoleCard({ role, roleLabel, onOpenAssign, onView }) {
  const { t } = useLanguage();
  if (!role) return <AddRoleCard onOpenAssign={onOpenAssign} />;

  const m = role.memberId ? MEMBER_POOL.find((x) => x.id === role.memberId) : null;
  // The Case Manager slot stays visually prominent whether it's filled or
  // still waiting to be — a light teal card tint flags it as needing
  // attention while empty, same as the other named roles' plain gray tint.
  const isCaseManager = role.label === "Case manager";
  return (
    <div
      className="relative overflow-hidden w-64 border rounded-[4px] p-6 flex flex-col items-center text-center"
      style={{
        borderColor: T.teamItemBorder,
        backgroundColor: m ? T.cardBg : isCaseManager ? "rgba(0,128,163,0.1)" : T.light,
      }}
    >
      {/* Corner ribbon, unfilled Case Manager only — matches Figma node
          12998:10352, which shows it only while the mandatory slot is still
          empty. MandatoryRoleRow (the row-list equivalent) has its own
          corner ribbon too, mirrored to the left corner since its icon
          sits on the left rather than centered on top — same treatment,
          not a different one. */}
      {isCaseManager && !m && (
        <div
          className="absolute -right-11 top-4 w-36 rotate-45 text-center text-[11px] font-bold uppercase tracking-wide py-1"
          style={{ backgroundColor: T.warning, color: T.bodyText }}
        >
          {t("Mandatory")}
        </div>
      )}
      {/* Filled roles are clickable (opens the same read-only detail dialog
          TeamSummary's rows use, with a "Remove from team" action) — the
          unfilled state has nothing to show, so it renders as plain,
          non-interactive content instead of a disabled button. */}
      <button
        type="button"
        onClick={m ? () => onView({ member: m, roleLabel: role.label, roleId: role.id }) : undefined}
        disabled={!m}
        className={`flex flex-col items-center text-center w-full ${m ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: isCaseManager ? T.primary : "#DCE3E8" }}>
          <User size={26} color={isCaseManager ? "#fff" : T.gray500} />
        </div>
        <div className="font-semibold text-[15px] mb-0.5" style={{ color: T.black }}>{m ? m.name : t(role.label)}</div>
        <div className="text-[15px]" style={{ color: T.muted }}>{m ? t(role.label) : t("Please assign member for a role")}</div>
        {m && (
          <div className="mb-1">
            <div className="text-[13px]" style={{ color: T.primary }}>{m.email}</div>
            <div className="text-[13px]" style={{ color: T.primary }}>{m.phone}</div>
          </div>
        )}
      </button>
      <Btn small variant={m ? "outline" : "solid"} onClick={() => onOpenAssign(roleLabel)} className="mt-3">
        {m ? t("Re-Assign member") : t("Select a member")}
      </Btn>
    </div>
  );
}

// Someone picked up via an activity assignment rather than a formal role —
// shown alongside the role cards, but read-only (no role slot to reassign).
function AssigneeCard({ member, caption = "Assigned via activity" }) {
  const { t } = useLanguage();
  return (
    <div className="w-64 border rounded-[4px] p-6 flex flex-col items-center text-center" style={{ borderColor: T.teamItemBorder, backgroundColor: T.cardBg }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "#DCE3E8" }}>
        <User size={26} color={T.gray500} />
      </div>
      <div className="font-semibold text-[15px] mb-0.5" style={{ color: T.black }}>{member.name}</div>
      <div className="text-[15px]" style={{ color: T.muted }}>{t(member.jobTitle)}</div>
      <div className="text-[12px] mt-2" style={{ color: T.gray500 }}>{t(caption)}</div>
    </div>
  );
}

// One flat grid — no "Created by"/"Mandatory"/"Others"/"Assigned via
// activities" section headings (see Figma node 12998:10352: a single "TEAM"
// heading + one card grid, full stop). Every kind of person still renders
// with its own card component (AssigneeCard for the creator/activity-only
// people, RoleCard for formal roles, the empty add-slot last) — only the
// grouping headings were removed, not the distinction between card types.
function TeamTab({ team, activities, createdBy, onOpenAssign, onRemoveMember }) {
  const [viewing, setViewing] = useState(null);
  const mandatory = team.filter((t) => t.group === "mandatory");
  const others = team.filter((t) => t.group === "others");
  const extra = extraActivityAssignees(activities, team);
  return (
    <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
      <div className="flex items-center justify-between mb-6">
        <div className="font-bold text-[18px] tracking-[0.8px] uppercase" style={{ color: T.black }}>TEAM</div>
        <button onClick={() => onOpenAssign(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: T.primary }} aria-label="Add role">
          <Plus size={16} />
        </button>
      </div>
      <div className="flex gap-6 flex-wrap">
        {createdBy && <AssigneeCard member={createdBy} caption="Created this care map" />}
        {mandatory.map((r) => <RoleCard key={r.id} role={r} roleLabel={r.label} onOpenAssign={onOpenAssign} onView={setViewing} />)}
        {others.map((r) => <RoleCard key={r.id} role={r} roleLabel={r.label} onOpenAssign={onOpenAssign} onView={setViewing} />)}
        {extra.map((m) => <AssigneeCard key={m.id} member={m} />)}
        <RoleCard role={null} roleLabel={null} onOpenAssign={onOpenAssign} />
      </div>
      {viewing && (
        <MemberDetailModal
          member={viewing.member}
          roleLabel={viewing.roleLabel}
          roleId={viewing.roleId}
          onRemove={onRemoveMember}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

// PZP tab: a left list of the plan's sections and a right detail panel for
// whichever one is selected. Defaults to "Clinical context", matching the
// selected state captured in the dev-mode spec (node 12593-359461).
function PzpTab() {
  const [activeKey, setActiveKey] = useState("clinical");
  const { t } = useLanguage();
  const activeSection = PZP_SECTIONS.find((s) => s.key === activeKey);
  const fields = PZP_CONTENT[activeKey];

  return (
    <div className="bg-white border rounded-[4px] overflow-hidden" style={{ borderColor: T.border }}>
      <div className="flex items-center justify-between p-6">
        <div className="font-bold text-[18px] tracking-[0.8px] uppercase" style={{ color: T.black }}>PZP</div>
        <Pencil size={24} style={{ color: T.primary }} aria-hidden />
      </div>
      <div className="flex items-start" style={{ borderTop: `1px solid ${T.border}` }}>
        <div className="w-[342px] shrink-0 border-r p-6" style={{ borderColor: T.border }}>
          {PZP_SECTIONS.map((s) => {
            const active = s.key === activeKey;
            return (
              <button
                key={s.key}
                onClick={() => setActiveKey(s.key)}
                className="w-full flex items-center justify-between text-left border-b h-10 px-2"
                style={{
                  borderColor: T.border,
                  backgroundColor: active ? "rgba(0,128,163,0.08)" : "transparent",
                  borderLeft: active ? `3px solid ${T.primary}` : "3px solid transparent",
                }}
              >
                <span className="text-[15px]" style={{ color: T.black }}>{t(s.label)}</span>
                <ChevronRight size={20} style={{ color: T.gray500 }} />
              </button>
            );
          })}
        </div>
        <div className="flex-1 p-6">
          <div className="rounded-[4px] p-4" style={{ backgroundColor: T.cardBg }}>
            <div className="text-[15px] font-semibold mb-5" style={{ color: T.black }}>{t(activeSection.label)}</div>
            <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.label} className="flex items-start gap-6">
                  <div className="w-[220px] shrink-0 text-[15px] font-semibold" style={{ color: T.black }}>{t(f.label)}</div>
                  <div className="flex-1 text-[15px]" style={{ color: T.bodyText }}>{t(f.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StubCard({ title, desc, cta, onClick }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
      <div className="font-bold text-[18px] tracking-[0.8px] uppercase mb-6" style={{ color: T.black }}>{t(title)}</div>
      <div className="rounded-[4px] p-4 flex flex-col items-start gap-[7px]" style={{ backgroundColor: T.cardBg }}>
        <div className="text-[15px] leading-[1.5]" style={{ color: T.bodyText }}>{t(desc)}</div>
        <div className="text-[15px] leading-[1.5]" style={{ color: T.muted }}>{onClick ? "" : t("Not wired in this prototype.")}</div>
        <Btn small variant="outline" disabled={!onClick} onClick={onClick} className="mt-1">{t(cta)}</Btn>
      </div>
    </div>
  );
}

// Filled state of the "Clinical consultant" card once one has been added —
// clicking the edit icon reopens ClinicalConsultantModal prefilled, which
// also offers Remove.
function ClinicalConsultantCard({ consultant, onEdit }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
      <div className="flex items-center justify-between mb-6">
        <div className="font-bold text-[18px] tracking-[0.8px] uppercase" style={{ color: T.black }}>{t("Clinical consultant")}</div>
        <button onClick={onEdit} aria-label="Edit clinical consultant">
          <Pencil size={18} style={{ color: T.primary }} />
        </button>
      </div>
      <div className="rounded-[4px] p-4" style={{ backgroundColor: T.cardBg }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#DCE3E8" }}>
            <User size={20} color={T.gray500} />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold truncate" style={{ color: T.black }}>{consultant.name} {consultant.surname}</div>
            <div className="text-[15px]" style={{ color: T.muted }}>{t(consultant.jobTitle)}</div>
          </div>
        </div>
        {consultant.phone && (
          <div className="mb-3">
            <div className="text-[15px] font-semibold" style={{ color: T.black }}>{t("Phone number")}</div>
            <div className="text-[15px]" style={{ color: T.muted }}>{consultant.phone}</div>
          </div>
        )}
        {consultant.email && (
          <div>
            <div className="text-[15px] font-semibold" style={{ color: T.black }}>{t("Email address")}</div>
            <div className="text-[15px]" style={{ color: T.muted }}>{consultant.email}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmergencyContactRow({ contact, onEdit }) {
  const { t } = useLanguage();
  return (
    <div
      className="flex items-center justify-between border rounded-[4px] px-4 py-3"
      style={{ borderColor: T.teamItemBorder, backgroundColor: T.cardBg }}
    >
      <div className="min-w-0">
        <div className="text-[15px] font-semibold truncate" style={{ color: T.black }}>{contact.firstName} {contact.lastName}</div>
        <div className="text-[15px]" style={{ color: T.muted }}>{t(contact.relation)}</div>
      </div>
      <button onClick={() => onEdit(contact.id)} aria-label={`Edit ${contact.firstName} ${contact.lastName}`}>
        <Pencil size={16} style={{ color: T.primary }} />
      </button>
    </div>
  );
}

// Filled state of the "Emergency contact" card — a caremap can hold any
// number of contacts, each edited/removed independently via
// EmergencyContactModal; the "+" reopens the same modal for a new one.
function EmergencyContactCard({ contacts, onAdd, onEdit }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
      <div className="flex items-center justify-between mb-6">
        <div className="font-bold text-[18px] tracking-[0.8px] uppercase" style={{ color: T.black }}>{t("Emergency contact")}</div>
        <button onClick={onAdd} aria-label="Add another emergency contact">
          <Plus size={18} style={{ color: T.primary }} />
        </button>
      </div>
      <div className="space-y-3">
        {contacts.map((c) => <EmergencyContactRow key={c.id} contact={c} onEdit={onEdit} />)}
      </div>
    </div>
  );
}

/* ================= comments tab ================= */

function CommentCard({ comment }) {
  const { lang } = useLanguage();
  return (
    <div className="border rounded-[4px] p-4" style={{ borderColor: T.border }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: T.lightBg }}>
            <User size={18} style={{ color: T.gray700 }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[15px]" style={{ color: T.black }}>{comment.author}</span>
            <span className="text-[14px]" style={{ color: T.gray600 }}>{formatTimeLabel(comment.createdAt, lang)}</span>
            {comment.important && <Badge tone="warning">Important</Badge>}
          </div>
        </div>
        <MoreHorizontal size={18} style={{ color: T.gray600 }} className="shrink-0" />
      </div>
      <p className="text-[15px] leading-[1.6] whitespace-pre-wrap" style={{ color: T.bodyText }}>{comment.text}</p>
    </div>
  );
}

// The Comments tab — a live comment thread + post form, both backed by the
// caremap's own `comments` array so they persist for the session like
// everything else (clinical consultant, emergency contacts, activities).
function CommentsTab({ comments, onAddComment }) {
  const [text, setText] = useState("");
  const [important, setImportant] = useState(false);
  const { t } = useLanguage();

  const submit = () => {
    if (!text.trim()) return;
    onAddComment(text.trim(), important);
    setText("");
    setImportant(false);
  };

  return (
    <div className="grid grid-cols-3 gap-6 items-start">
      <div className="col-span-2 bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
        <div className="font-bold text-[18px] tracking-[0.8px] uppercase mb-6" style={{ color: T.black }}>{t("Comments")}</div>
        {comments.length === 0 ? (
          <div className="text-[15px]" style={{ color: T.muted }}>{t("No comments yet.")}</div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => <CommentCard key={c.id} comment={c} />)}
          </div>
        )}
      </div>
      <div className="bg-white rounded-[4px] p-6" style={{ boxShadow: T.cardShadow }}>
        <div className="font-bold text-[18px] tracking-[0.8px] uppercase mb-4" style={{ color: T.black }}>{t("Add comment")}</div>
        <div className="text-[14px] mb-4 leading-relaxed" style={{ color: T.gray600 }}>
          {t("Here you can write your thoughts regarding the patient treatment, ask questions, log calls or comment about anything else related to this caremap.")}
        </div>
        <Field label="Comment" required>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={selectCls}
            style={{ ...selectStyle, minHeight: 190, resize: "vertical" }}
          />
        </Field>
        <label className="flex items-center gap-2 mb-4 text-[14px] cursor-pointer" style={{ color: T.bodyText }}>
          <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} />
          {t("Mark as important")}
        </label>
        <div className="flex justify-end">
          <Btn small disabled={!text.trim()} onClick={submit}>{t("Submit")}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ================= messages tab ================= */

// A thread's status is derived, not stored — no separate field to fall out
// of sync with its own messages. "Open" = the current persona sent the last
// message (ball's in the other side's court); "Awaiting response" = someone
// else did (it's this persona's turn); "Resolved" is the one explicit flag,
// since it's a deliberate action rather than something inferable from the
// message list.
function threadStatusForPersona(thread, personaName) {
  if (thread.resolved) return "resolved";
  const last = thread.messages[thread.messages.length - 1];
  // The sender is awaiting a reply; the recipient has an open message
  // waiting on them — so status is from the *other* party's action, not
  // "am I the last author".
  return last.author === personaName ? "awaiting" : "open";
}

const MESSAGE_TABS = [
  { key: "open", label: "Open" },
  { key: "awaiting", label: "Awaiting response" },
  { key: "resolved", label: "Resolved" },
];

// Decorative rich-text toolbar — matches the composer's dev-mode look; not
// wired to anything, same as "Add document" elsewhere in the app.
function RichTextToolbar() {
  const icons = [Bold, Italic, Underline, Link2, ListOrdered, List];
  return (
    <div className="flex items-center gap-3 border rounded-t-[4px] px-3 py-2" style={{ borderColor: T.gray400, backgroundColor: T.light }}>
      {icons.map((Icon, i) => (
        <Icon key={i} size={16} style={{ color: T.gray600 }} />
      ))}
    </div>
  );
}

function MessageBubble({ message }) {
  const { lang } = useLanguage();
  return (
    <div className="border rounded-[4px] p-4" style={{ borderColor: T.border }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: T.lightBg }}>
          <User size={18} style={{ color: T.gray700 }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[15px]" style={{ color: T.black }}>{message.author}</span>
          <span className="text-[14px]" style={{ color: T.gray600 }}>{formatTimeLabel(message.createdAt, lang)}</span>
        </div>
      </div>
      <p className="text-[15px] leading-[1.6] whitespace-pre-wrap" style={{ color: T.bodyText }}>{message.text}</p>
    </div>
  );
}

function ThreadListItem({ thread, counterpart, status, active, onClick }) {
  const { lang } = useLanguage();
  const last = thread.messages[thread.messages.length - 1];
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 border-b"
      style={{ borderColor: T.border, backgroundColor: active ? T.light : "#fff" }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-[14px] truncate" style={{ color: T.black }}>{counterpart}</span>
        {thread.critical && <CircleAlert size={14} style={{ color: "#C74139" }} className="shrink-0 mt-0.5" />}
      </div>
      <div className="flex items-end justify-between gap-2 mt-0.5">
        <span className="text-[13px] truncate" style={{ color: T.gray600 }}>{thread.subject}</span>
        <span className="text-[12px] whitespace-nowrap shrink-0" style={{ color: T.gray500 }}>{formatTimeLabel(last.createdAt, lang)}</span>
      </div>
    </button>
  );
}

function NewMessageForm({ recipientOptions, onCancel, onSend }) {
  const [to, setTo] = useState(recipientOptions[0]?.name || "");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const canSend = to && subject.trim() && text.trim();
  const { t } = useLanguage();

  return (
    <div className="p-6">
      <div className="font-bold text-[20px] mb-6" style={{ color: T.black }}>{t("New message")}</div>
      <Field label="To" required>
        <Select style={selectStyle} value={to} onChange={(e) => setTo(e.target.value)}>
          {recipientOptions.map((p) => <option key={p.id} value={p.name}>{p.name} — {t(p.role)}</option>)}
        </Select>
      </Field>
      <Field label="Subject" required>
        <input type="text" placeholder={t("Subject title...")} className={selectCls} style={selectStyle} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Message" required>
        <RichTextToolbar />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("Type your message here...")}
          className={selectCls}
          style={{ ...selectStyle, minHeight: 260, resize: "vertical", borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        />
      </Field>
      <div className="flex justify-between mt-6">
        <Btn variant="outline" onClick={onCancel}>{t("Cancel")}</Btn>
        <Btn disabled={!canSend} onClick={() => onSend(to, subject.trim(), text.trim())}>{t("Send")}</Btn>
      </div>
    </div>
  );
}

function ThreadDetail({ thread, status, onToggleCritical, onResolve, onReply }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { t, lang } = useLanguage();

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim());
    setReplyText("");
    setReplying(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-3">
          <span className="font-bold text-[20px]" style={{ color: T.black }}>{thread.subject}</span>
          {status === "resolved" && <Badge tone="green">Resolved</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <Btn small variant={thread.critical ? "solid" : "outline"} onClick={onToggleCritical}>!!!</Btn>
          {status !== "resolved" && (
            <Btn small variant="outline" onClick={onResolve}>{t("Resolve")} <Check size={14} /></Btn>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {thread.messages.map((m) => <MessageBubble key={m.id} message={m} />)}
      </div>

      <div className="px-6 py-4 border-t flex items-center justify-between gap-4" style={{ borderColor: T.border }}>
        <span className="text-[13px] shrink-0" style={{ color: T.gray600 }}>
          {lang === "nl"
            ? `1 tot ${thread.messages.length} van ${thread.messages.length} berichten`
            : `1 to ${thread.messages.length} of ${thread.messages.length} messages`}
        </span>
        <div className="flex items-center gap-2">
          <ChevronLeft size={16} style={{ color: T.gray400 }} />
          <ChevronRight size={16} style={{ color: T.gray400 }} />
        </div>
      </div>

      {status !== "resolved" && (
        <div className="px-6 pb-6">
          {replying ? (
            <div>
              <textarea
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("Type your reply...")}
                className={selectCls}
                style={{ ...selectStyle, minHeight: 100, resize: "vertical" }}
              />
              <div className="flex justify-end gap-3 mt-3">
                <Btn small variant="outline" onClick={() => { setReplying(false); setReplyText(""); }}>{t("Cancel")}</Btn>
                <Btn small disabled={!replyText.trim()} onClick={submitReply}>{t("Send reply")}</Btn>
              </div>
            </div>
          ) : (
            <Btn onClick={() => setReplying(true)}>{t("Reply")}</Btn>
          )}
        </div>
      )}
    </div>
  );
}

// The Messages tab — a per-caremap inbox of two-party threads between the
// current persona and any other persona, backed by `caremap.messageThreads`
// (same session-persisted pattern as Comments). Ties into the persona
// switcher: switching persona changes both who you can message and which
// threads you see, since a thread only shows for its two participants.
function MessagesTab({ threads, persona, onStartThread, onReply, onToggleCritical, onResolveThread, initialSelectedId }) {
  const [tab, setTab] = useState("open");
  const [onlyCritical, setOnlyCritical] = useState(false);
  // Arrives from a message notification's "Open in Messages" button
  // (`CaremapDetail` passes it through) — only read once, at mount, same as
  // `tab` above; not kept in sync with later prop changes since this
  // component remounts fresh every time `CaremapDetail` does.
  const [selectedId, setSelectedId] = useState(initialSelectedId || null);
  const [composing, setComposing] = useState(false);
  const { t } = useLanguage();

  const recipientOptions = PERSONAS.filter((p) => p.name !== persona.name);

  const myThreads = threads
    .filter((t) => t.participants.includes(persona.name))
    .map((t) => ({ ...t, _status: threadStatusForPersona(t, persona.name) }));

  const tabThreads = myThreads
    .filter((t) => t._status === tab && (!onlyCritical || t.critical))
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1].createdAt;
      const bLast = b.messages[b.messages.length - 1].createdAt;
      return bLast.localeCompare(aLast);
    });

  const selected = !composing && (myThreads.find((t) => t.id === selectedId) || tabThreads[0]);

  const openThread = (id) => {
    setComposing(false);
    setSelectedId(id);
  };

  const startCompose = () => setComposing(true);

  return (
    <div className="bg-white rounded-[4px]" style={{ boxShadow: T.cardShadow }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.border }}>
        <div className="font-bold text-[20px]" style={{ color: T.black }}>{t("Messages")}</div>
        <Btn small onClick={startCompose}>{t("New message")} <Plus size={14} /></Btn>
      </div>
      <div className="flex" style={{ minHeight: 480 }}>
        <div className="w-72 shrink-0 border-r flex flex-col" style={{ borderColor: T.border }}>
          <div className="flex border-b" style={{ borderColor: T.border }}>
            {MESSAGE_TABS.map((mt) => {
              const active = mt.key === tab;
              return (
                <button
                  key={mt.key}
                  onClick={() => setTab(mt.key)}
                  className="flex-1 px-2 py-3 text-[13px] relative"
                  style={{ color: active ? T.primary : T.gray700, fontWeight: active ? 700 : 400 }}
                >
                  {t(mt.label, "messageStatus")}
                  {active && <span className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ backgroundColor: T.primary }} />}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setOnlyCritical((v) => !v)}
            className="flex items-center gap-2 px-4 py-3 border-b text-[14px] text-left"
            style={{ borderColor: T.border, color: onlyCritical ? T.primary : T.gray700 }}
          >
            <CircleAlert size={16} style={{ color: onlyCritical ? T.primary : T.gray500 }} />
            {t("Show only critical")}
          </button>
          <div className="flex-1 overflow-y-auto">
            {tabThreads.length === 0 ? (
              <div className="px-4 py-6 text-[14px]" style={{ color: T.gray600 }}>{t(`No ${tab === "awaiting" ? "threads awaiting a response" : `${tab} threads`}.`)}</div>
            ) : (
              tabThreads.map((t) => (
                <ThreadListItem
                  key={t.id}
                  thread={t}
                  status={t._status}
                  counterpart={t.participants.find((p) => p !== persona.name) || t.participants[0]}
                  active={!composing && selected?.id === t.id}
                  onClick={() => openThread(t.id)}
                />
              ))
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {composing ? (
            <NewMessageForm
              recipientOptions={recipientOptions}
              onCancel={() => setComposing(false)}
              onSend={(to, subject, text) => {
                onStartThread(to, subject, text);
                setComposing(false);
              }}
            />
          ) : selected ? (
            <ThreadDetail
              thread={selected}
              status={selected._status}
              onToggleCritical={() => onToggleCritical(selected.id)}
              onResolve={() => onResolveThread(selected.id)}
              onReply={(text) => onReply(selected.id, text)}
            />
          ) : (
            <div className="p-6 text-[14px]" style={{ color: T.gray600 }}>
              {t("Select a thread, or start a new message.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= notifications ================= */

// Seed content so the notification center doesn't start empty — same shape
// (and same id-lookup keys, `m8`/`m9`) live-generated notifications use, so
// they're indistinguishable from ones the demo user creates by assigning a
// task/role during the session. Dated shortly before "now" (system date
// 2026-08-31) and ordered newest-first, matching how notifyAssignment
// prepends new ones. Reused as-is on Reset demo, same as every other piece
// of seed/mock data in this file (MOCK_CAREMAPS, MOCK_TASKS, etc.) — not
// deep-cloned, since nothing ever mutates a notification in place.
const SEED_NOTIFICATIONS = [
  {
    id: "seed-mm-2",
    recipientId: "m9",
    kind: "assignment",
    title: "Physiotherapy — KOWALSKA, Anna",
    body: 'You\'ve been assigned "Physiotherapy" on "Oncology Care Caremap" for KOWALSKA, Anna.',
    createdAt: "2026-08-29T10:15:00.000Z",
    read: false,
  },
  {
    id: "seed-mb-2",
    recipientId: "m8",
    kind: "assignment",
    title: "Treatment summary appointment — BAUER, Fredric",
    body: 'You\'ve been assigned "Treatment summary appointment" on "Palliative Caremap" for BAUER, Fredric.',
    createdAt: "2026-08-28T15:40:00.000Z",
    read: false,
  },
  {
    id: "seed-mm-1",
    recipientId: "m9",
    kind: "assignment",
    title: "Physiotherapy — MATT EVANS, Leroy",
    body: 'You\'ve been assigned "Physiotherapy" on "Palliative Caremap" for MATT EVANS, Leroy.',
    createdAt: "2026-08-20T11:05:00.000Z",
    read: true,
  },
  {
    id: "seed-mb-1",
    recipientId: "m8",
    kind: "assignment",
    title: "Case manager — KLEIN, Calvin",
    body: 'You\'ve been assigned as Case manager on "End of Life care Caremap" for KLEIN, Calvin.',
    createdAt: "2026-05-21T09:12:00.000Z",
    read: true,
  },
];

function formatNotificationDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function formatNotificationDateTime(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${formatNotificationDate(iso)} at ${hh}:${min}`;
}

// The row's sender identity differs by kind: assignment notifications are
// framed as coming from the system ("Vitaly Assistant" + a bell), message
// notifications show who actually sent the message + a message-bubble icon
// — makes the two kinds tell apart at a glance in the list, not just once
// you've opened one.
function NotificationRow({ notification, active, onClick }) {
  const isMessage = notification.kind === "message";
  const Icon = isMessage ? MessageSquare : Bell;
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 border-b flex items-start gap-2.5"
      style={{ borderColor: T.border, backgroundColor: active ? T.light : "#fff" }}
    >
      <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: notification.read ? "transparent" : T.primary }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 min-w-0 text-[14px] font-semibold truncate" style={{ color: T.black }}>
            <Icon size={13} style={{ color: T.gray500 }} className="shrink-0" />
            <span className="truncate">{isMessage ? notification.senderName : "Vitaly Assistant"}</span>
          </span>
          <span className="text-[12px] shrink-0" style={{ color: T.gray500 }}>{formatNotificationDate(notification.createdAt)}</span>
        </div>
        <div className="text-[13px] truncate" style={{ color: T.gray600 }}>{notification.title}</div>
      </div>
    </button>
  );
}

function NotificationDetail({ notification, onOpenCaremap, onOpenThread, messageThreads }) {
  const { t } = useLanguage();
  if (!notification) {
    return <div className="p-6 text-[14px]" style={{ color: T.gray600 }}>{t("Select a notification to view it.")}</div>;
  }
  // A message notification shows the *live* thread (however many messages
  // it's grown to since this particular notification fired), not a frozen
  // snapshot of the one message that triggered it — so opening an older
  // notification from a since-continued conversation still reads as the
  // full, current exchange, matching what you'd see in the Messages tab.
  const thread = notification.kind === "message" ? messageThreads?.find((t) => t.id === notification.threadId) : null;
  if (thread) {
    return (
      <div className="p-6">
        <div className="text-[20px] font-semibold mb-4" style={{ color: T.black }}>{thread.subject}</div>
        <div className="space-y-4 mb-4">
          {thread.messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        </div>
        {onOpenThread && (
          <Btn small onClick={() => onOpenThread(thread.id)}>
            {t("Open in Messages")} <ChevronRight size={14} />
          </Btn>
        )}
      </div>
    );
  }
  return (
    <div className="p-6">
      <div className="text-[20px] font-semibold mb-4" style={{ color: T.black }}>{notification.title}</div>
      <div className="border rounded-[4px] p-5" style={{ borderColor: T.primary, backgroundColor: T.light }}>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: T.primary }}>
            <Bell size={16} color="#fff" />
          </span>
          <div>
            <div className="text-[14px] font-semibold" style={{ color: T.black }}>Vitaly Assistant</div>
            <div className="text-[12px]" style={{ color: T.gray500 }}>{formatNotificationDateTime(notification.createdAt)}</div>
          </div>
        </div>
        <div className="text-[14px] leading-relaxed mb-4" style={{ color: T.bodyText }}>{notification.body}</div>
        {onOpenCaremap && (
          <Btn small onClick={onOpenCaremap}>
            {t("View caremap overview")} <ChevronRight size={14} />
          </Btn>
        )}
      </div>
    </div>
  );
}

// Top-level screen reached via Sidebar's "Notifications" item or the
// TopHeader bell — same chrome convention as the other top-level screens.
// Scoped to `persona.id`, which doubles as the recipient's MEMBER_POOL id
// for the two staff personas (see PERSONAS) — so switching persona changes
// whose notifications you see, same as the rest of the persona-filtered app.
function NotificationsScreen({ notifications, messageThreads, persona, onMarkRead, onNavigate, onSwitchPersona, onReset, onOpenCaremap, onOpenThread, caseManagerPersonaId, sidebarCollapsed, onToggleSidebar }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("unread");
  const [selectedId, setSelectedId] = useState(null);

  const mine = notifications.filter((n) => n.recipientId === persona.id);
  const unread = mine.filter((n) => !n.read);
  const tabList = tab === "unread" ? unread : mine;
  // No auto-selecting the first item on mount/tab-switch: since selecting
  // marks it read (below), that would silently vanish the one unread
  // notification from the Unread tab before the user ever saw it there.
  // Looked up from `mine`, not `tabList` — selecting an unread notification
  // marks it read, which drops it out of the Unread tab's own list; looking
  // it up in the unfiltered list keeps the detail panel showing it anyway,
  // instead of the read-state change yanking the selection out from under it.
  const selected = mine.find((n) => n.id === selectedId) || null;

  useEffect(() => {
    if (selected && !selected.read) onMarkRead(selected.id);
  }, [selected?.id]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <Sidebar activeLabel="Notifications" onNavigate={onNavigate} unreadCount={unread.length} collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader title="Notifications" persona={persona} onSwitchPersona={onSwitchPersona} onReset={onReset} unreadCount={unread.length} onOpenNotifications={() => {}} caseManagerPersonaId={caseManagerPersonaId} />
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 shrink-0 border-r flex flex-col bg-white" style={{ borderColor: T.border }}>
            <div className="flex border-b" style={{ borderColor: T.border }}>
              {["unread", "all"].map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="flex-1 px-2 py-3 text-[14px] relative"
                  style={{ color: tab === key ? T.primary : T.gray700, fontWeight: tab === key ? 700 : 400 }}
                >
                  {key === "unread" ? t("Unread") : t("All")}
                  {tab === key && <span className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ backgroundColor: T.primary }} />}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {tabList.length === 0 ? (
                <div className="px-4 py-6 text-[14px]" style={{ color: T.gray600 }}>{t("No notifications yet.")}</div>
              ) : (
                tabList.map((n) => (
                  <NotificationRow key={n.id} notification={n} active={selected?.id === n.id} onClick={() => setSelectedId(n.id)} />
                ))
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto" style={{ backgroundColor: T.light }}>
            <NotificationDetail notification={selected} onOpenCaremap={onOpenCaremap} onOpenThread={onOpenThread} messageThreads={messageThreads} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= caremap detail ================= */

const TABS = ["Overview", "PZP", "Questionnaires", "Comments", "Team", "Messages"];

// Shared by the tab strip's red dots (below) and the cross-patient Caremaps
// list's row marker, so both surfaces agree on what counts as "important" —
// an important-flagged comment, or a message thread marked critical that
// hasn't been resolved yet (a *resolved* critical thread already got dealt
// with, so it doesn't need to keep flagging for attention).
function caremapHasImportantComment(caremap) {
  return caremap?.comments.some((c) => c.important) ?? false;
}
function caremapHasUrgentMessage(caremap) {
  return caremap?.messageThreads.some((t) => t.critical && !t.resolved) ?? false;
}

function CaremapDetail({
  caremap,
  openThreadId,
  onThreadConsumed,
  back,
  onOpenSetPlan,
  onOpenAssign,
  onRemoveMember,
  onOpenAddActivity,
  onOpenEditActivity,
  onOpenClinicalConsultant,
  onOpenEmergencyContact,
  onAddComment,
  onStartThread,
  onReplyThread,
  onToggleThreadCritical,
  onResolveThread,
  onNavigate,
  persona,
  onSwitchPersona,
  onReset,
  unreadCount,
  onOpenNotifications,
  sidebarCollapsed,
  onToggleSidebar,
}) {
  // `openThreadId` (set right before navigating here from a message
  // notification's "Open in Messages" button) only matters at the moment
  // this component mounts — captured once into these two initializers, then
  // immediately cleared at the root via `onThreadConsumed` so an unrelated
  // later visit to this screen (e.g. from the HIS start screen) can't
  // accidentally inherit a stale thread-open request.
  const [tab, setTab] = useState(openThreadId ? "messages" : "overview");
  useEffect(() => {
    if (openThreadId) onThreadConsumed();
  }, []);
  const { t } = useLanguage();
  const caseManagerMemberId = caremap.team.find((r) => r.label === "Case manager")?.memberId ?? null;
  // Only a switchable demo persona (Mary Brown/Mike Myers, keyed by MEMBER_POOL id)
  // can be jumped to from AccountMenu's "Case manager" shortcut — Dr. Henley isn't
  // in MEMBER_POOL so can never be `caseManagerMemberId`, and an assignee outside
  // the three demo personas simply has no shortcut to offer.
  const caseManagerPersonaId = PERSONAS.some((p) => p.id === caseManagerMemberId) ? caseManagerMemberId : null;
  const hasImportantComment = caremapHasImportantComment(caremap);
  const hasUrgentMessage = caremapHasUrgentMessage(caremap);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <Sidebar activeLabel="Caremaps" onNavigate={onNavigate} unreadCount={unreadCount} collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader persona={persona} onSwitchPersona={onSwitchPersona} onReset={onReset} unreadCount={unreadCount} onOpenNotifications={onOpenNotifications} caseManagerPersonaId={caseManagerPersonaId} />
        <PatientBar back={back} activeTab="CAREMAPS" onTabClick={onNavigate} />
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: T.light }}>
          <div className="px-8 py-6 flex items-start justify-between gap-6">
            <div className="leading-[1.2]" style={{ color: T.black }}>
              <div className="text-[24px] font-semibold leading-[1.2]">{t(caremap.title)}</div>
              <div className="text-[15px] leading-[1.5] mt-1">
                <span className="font-semibold">{t("Care focus:")}</span> {t(caremap.careFocus)}
              </div>
            </div>
            {caremap.status === "draft" ? (
              <Btn variant="green" onClick={onOpenSetPlan}>{t("Set plan and activate")}</Btn>
            ) : (
              <Btn variant="outline" onClick={onOpenSetPlan}>{t("View plan settings")}</Btn>
            )}
          </div>

          <div className="px-8 flex gap-8 border-b" style={{ borderColor: T.border }}>
            {TABS.map((tabLabel) => {
              const key = tabLabel.toLowerCase();
              const active = key === tab;
              return (
                <button
                  key={tabLabel}
                  onClick={() => setTab(key)}
                  className="relative pb-3 pt-2 text-[15px] flex items-center gap-1.5"
                  style={{ color: active ? T.primary : T.gray700, fontWeight: active ? 700 : 400 }}
                >
                  {t(tabLabel)}
                  {key === "comments" && hasImportantComment && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" aria-label={t("Important")} />
                  )}
                  {key === "messages" && hasUrgentMessage && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" aria-label={t("Critical")} />
                  )}
                  {key === "comments" && caremap.comments.length > 0 && (
                    <span
                      className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: T.primary }}
                    >
                      {caremap.comments.length}
                    </span>
                  )}
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
                  <div><span className="font-semibold" style={{ color: T.black }}>{t("Start date")}&nbsp;&nbsp;</span><span style={{ color: T.muted }}>{caremap.startDate}</span></div>
                </>
              ) : (
                <div><span className="font-semibold" style={{ color: T.black }}>Status&nbsp;&nbsp;</span><Badge tone="gray">Draft</Badge></div>
              )}
            </div>

            {tab === "overview" && (
              <div className="grid grid-cols-3 gap-6 items-start">
                <div className="col-span-2">
                  <ActivitiesPanel
                    activities={caremap.activities}
                    planConfigured={caremap.planConfigured}
                    onAdd={onOpenAddActivity}
                    onOpenSetPlan={onOpenSetPlan}
                    onEditActivity={onOpenEditActivity}
                    persona={persona}
                  />
                </div>
                <div className="space-y-6">
                  <TeamSummary team={caremap.team} activities={caremap.activities} createdBy={caremap.createdBy} onOpenAssign={onOpenAssign} onOpenTeamTab={() => setTab("team")} onRemoveMember={onRemoveMember} />
                  {caremap.clinicalConsultant ? (
                    <ClinicalConsultantCard consultant={caremap.clinicalConsultant} onEdit={onOpenClinicalConsultant} />
                  ) : (
                    <StubCard
                      title="CLINICAL CONSULTANT"
                      desc="Please add clinical consultant's details"
                      cta="Add clinical consultant"
                      onClick={onOpenClinicalConsultant}
                    />
                  )}
                  {caremap.emergencyContacts.length > 0 ? (
                    <EmergencyContactCard
                      contacts={caremap.emergencyContacts}
                      onAdd={() => onOpenEmergencyContact(null)}
                      onEdit={onOpenEmergencyContact}
                    />
                  ) : (
                    <StubCard
                      title="EMERGENCY CONTACT"
                      desc="Add any emergency contacts if needed"
                      cta="Add emergency contact"
                      onClick={() => onOpenEmergencyContact(null)}
                    />
                  )}
                </div>
              </div>
            )}

            {tab === "team" && <TeamTab team={caremap.team} activities={caremap.activities} createdBy={caremap.createdBy} onOpenAssign={onOpenAssign} onRemoveMember={onRemoveMember} />}

            {tab === "comments" && (
              <CommentsTab comments={caremap.comments} onAddComment={onAddComment} />
            )}

            {tab === "messages" && (
              <MessagesTab
                threads={caremap.messageThreads}
                persona={persona}
                onStartThread={onStartThread}
                onReply={onReplyThread}
                onToggleCritical={onToggleThreadCritical}
                onResolveThread={onResolveThread}
                initialSelectedId={openThreadId}
              />
            )}

            {tab === "pzp" && <PzpTab />}

            {tab === "questionnaires" && (
              <div className="bg-white rounded border p-12 text-center text-[14px]" style={{ borderColor: T.border, color: T.gray600 }}>
                {t("Not part of this prototype — mocked for the flow described in the brief.")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= caremaps list ================= */

function GenderAvatar({ gender }) {
  const color = gender === "female" ? "#E98181" : T.primary;
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: T.lightBg }}>
      <User size={20} style={{ color }} />
    </div>
  );
}

function CaremapListRow({ row, onOpen }) {
  const interactive = !!onOpen;
  const { t } = useLanguage();
  return (
    <div
      className="flex items-center border-b"
      style={{ borderColor: T.border, cursor: interactive ? "pointer" : "default" }}
      onClick={onOpen}
    >
      <div className="flex items-center gap-3 py-3 px-2 flex-[1.6] min-w-0">
        <div className="relative shrink-0">
          <GenderAvatar gender={row.gender} />
          {row.important && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"
              aria-label={t("Important")}
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold truncate" style={{ color: T.bodyText }}>{row.patientName}</div>
          <div className="text-[14px] truncate" style={{ color: T.bodyText }}>{row.patientMeta}</div>
        </div>
      </div>
      <div className="py-4 px-2 text-[15px] flex-1 min-w-0 truncate" style={{ color: T.bodyText }}>{t(row.type)}</div>
      <div className="py-4 px-2 text-[15px] flex-1 min-w-0 truncate" style={{ color: row.caseManager ? T.bodyText : T.gray600 }}>
        {row.caseManager || t("Not defined")}
      </div>
      <div className="py-4 px-2 text-[15px] flex-[0.7] min-w-0" style={{ color: T.bodyText }}>
        {row.startISO ? formatDMY(row.startISO) : "—"}
      </div>
      <div className="py-4 px-2 flex justify-center w-10 shrink-0">
        <MoreHorizontal size={20} style={{ color: T.gray600 }} />
      </div>
    </div>
  );
}

// The "Caremaps" nav destination — dev-mode node 12686-376699. One row is
// real (the in-session caremap, if any); the rest are decorative mock rows
// standing in for other patients this single-patient prototype can't model.
// Any "DE VRIES, Jan" row (live or decorative) opens the one real caremap
// detail screen, since that's the only patient this prototype has one for —
// the other mock patients' rows stay inert.
function CaremapsListScreen({ liveCaremap, onOpenLiveCaremap, onNavigate, persona, onSwitchPersona, onReset, unreadCount, onOpenNotifications, sidebarCollapsed, onToggleSidebar }) {
  const [tab, setTab] = useState("Active");
  const [typeFilter, setTypeFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { t } = useLanguage();

  let liveRow = null;
  let caseManagerPersonaId = null;
  if (liveCaremap) {
    const cm = liveCaremap.team.find((t) => t.label === "Case manager");
    const manager = cm?.memberId ? MEMBER_POOL.find((m) => m.id === cm.memberId)?.name : null;
    caseManagerPersonaId = cm?.memberId && PERSONAS.some((p) => p.id === cm.memberId) ? cm.memberId : null;
    liveRow = {
      id: "live",
      patientName: "DE VRIES, Jan",
      patientMeta: "ID 161 885 4347  -  14.03.1953",
      gender: "male",
      type: liveCaremap.title,
      caseManager: manager,
      startISO: liveCaremap.startDateISO || null,
      status: liveCaremap.status,
      // Same definition of "important" as the caremap's own Comments/
      // Messages tab dots (see `caremapHasImportantComment`/
      // `caremapHasUrgentMessage`) — MOCK_CAREMAPS rows never set this,
      // since they have no real comments/message data to check.
      important: caremapHasImportantComment(liveCaremap) || caremapHasUrgentMessage(liveCaremap),
    };
  }
  const allRows = liveRow ? [liveRow, ...MOCK_CAREMAPS] : MOCK_CAREMAPS;

  const typeOptions = [...new Set(allRows.map((r) => r.type))];
  const managerOptions = [...new Set(allRows.map((r) => r.caseManager).filter(Boolean))];

  const isStaffPersona = persona.id !== "dr-henley";

  const rows = allRows.filter((r) => {
    if (r.status !== tab.toLowerCase()) return false;
    if (isStaffPersona && r.caseManager !== persona.name) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    if (managerFilter && r.caseManager !== managerFilter) return false;
    if (dateFrom && (!r.startISO || r.startISO < dateFrom)) return false;
    if (dateTo && (!r.startISO || r.startISO > dateTo)) return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <Sidebar activeLabel="Caremaps" onNavigate={onNavigate} unreadCount={unreadCount} collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          title={isStaffPersona ? "My Caremaps" : "Caremaps"}
          persona={persona}
          onSwitchPersona={onSwitchPersona}
          onReset={onReset}
          unreadCount={unreadCount}
          onOpenNotifications={onOpenNotifications}
          caseManagerPersonaId={caseManagerPersonaId}
        />
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: T.light }}>
          <div className="px-8 pt-6 flex gap-8 border-b bg-white" style={{ borderColor: T.border }}>
            {CAREMAP_LIST_TABS.map((tabLabel) => {
              const active = tabLabel === tab;
              return (
                <button
                  key={tabLabel}
                  onClick={() => setTab(tabLabel)}
                  className="relative pb-3 text-[15px]"
                  style={{ color: active ? T.primary : T.gray700, fontWeight: active ? 700 : 400 }}
                >
                  {t(tabLabel)}
                  {active && <span className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ backgroundColor: T.primary }} />}
                </button>
              );
            })}
          </div>

          <div className="p-8">
            <div className="bg-white rounded-[4px] p-6 mb-6" style={{ boxShadow: T.cardShadow }}>
              <div className="flex gap-6">
                <FilterField label="Caremap">
                  <Select style={selectStyle} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">{t("All")}</option>
                    {typeOptions.map((opt) => <option key={opt} value={opt}>{t(opt)}</option>)}
                  </Select>
                </FilterField>
                <FilterField label="Case manager">
                  <Select style={selectStyle} value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
                    <option value="">{t("All")}</option>
                    {managerOptions.map((m) => <option key={m}>{m}</option>)}
                  </Select>
                </FilterField>
                <div style={{ width: 160 }}>
                  <FilterField label="From">
                    <input type="date" className={selectCls} style={selectStyle} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </FilterField>
                </div>
                <div style={{ width: 160 }}>
                  <FilterField label="To">
                    <input type="date" className={selectCls} style={selectStyle} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </FilterField>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[4px]" style={{ boxShadow: T.cardShadow }}>
              <div className="flex items-center border-b" style={{ borderColor: T.border }}>
                <div className="py-4 px-2 text-[15px] font-semibold flex-[1.6]" style={{ color: T.bodyText }}>{t("Patient")}</div>
                <div className="py-4 px-2 text-[15px] font-semibold flex-1" style={{ color: T.bodyText }}>Caremap</div>
                <div className="py-4 px-2 text-[15px] font-semibold flex-1" style={{ color: T.bodyText }}>{t("Case manager")}</div>
                <div className="py-4 px-2 text-[15px] font-semibold flex-[0.7]" style={{ color: T.bodyText }}>{t("Start")}</div>
                <div className="w-10 shrink-0" />
              </div>
              {rows.length === 0 ? (
                <div className="py-12 text-center text-[14px]" style={{ color: T.gray600 }}>
                  {t(`No ${tab.toLowerCase()} caremaps match these filters.`)}
                </div>
              ) : (
                rows.map((row) => (
                  <CaremapListRow
                    key={row.id}
                    row={row}
                    onOpen={liveCaremap && row.patientName === "DE VRIES, Jan" ? onOpenLiveCaremap : undefined}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= tasks list ================= */

function TaskListRow({ row, onOpen }) {
  const { t, lang } = useLanguage();
  const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.undefined;
  const display = row.due && cfg.field ? formatFieldValue(cfg.field.type, row.due, lang) : null;
  const overdue = cfg.field?.type === "date" && row.due && row.due < todayISO();

  return (
    <div
      className="flex items-center border-b"
      style={{ borderColor: T.border, cursor: onOpen ? "pointer" : "default" }}
      onClick={onOpen}
    >
      <div className="flex items-center gap-3 py-3 px-2 flex-[1.5] min-w-0">
        <GenderAvatar gender={row.gender} />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold truncate" style={{ color: T.bodyText }}>{row.patientName}</div>
          <div className="text-[14px] truncate" style={{ color: T.bodyText }}>{row.patientMeta}</div>
        </div>
      </div>
      <div className="py-4 px-2 text-[15px] flex-[1.3] min-w-0 truncate" style={{ color: T.bodyText }}>{t(row.task)}</div>
      <div className="py-4 px-2 text-[15px] flex-1 min-w-0 truncate" style={{ color: T.bodyText }}>{t(row.caremapTitle)}</div>
      <div className="py-4 px-2 text-[15px] flex-1 min-w-0 truncate" style={{ color: row.responsible ? T.bodyText : T.gray600 }}>
        {row.responsible || t("Not defined")}
      </div>
      <div className="py-4 px-2 flex-1 min-w-0">
        <Badge tone={cfg.tone}>{cfg.label}</Badge>
      </div>
      <div className="py-4 px-2 flex items-center gap-2 flex-[0.9] min-w-0">
        {overdue && <CircleAlert size={18} style={{ color: "#C74139" }} className="shrink-0" />}
        {display && (
          <span className="text-[15px] truncate" style={{ color: overdue ? "#C74139" : T.bodyText }}>{t("Due:")} {display}</span>
        )}
      </div>
      <div className="py-4 px-2 flex justify-center w-10 shrink-0">
        <MoreHorizontal size={20} style={{ color: T.gray600 }} />
      </div>
    </div>
  );
}

// The "Tasks" nav destination — dev-mode node 12595-364368. Real rows come
// straight from the live caremap's own `activities` (one row per activity,
// same STATUS_CONFIG/Badge language as the Activities panel); a click opens
// the shared EditActivityModal in place, no screen navigation needed. The
// rest are decorative MOCK_TASKS rows for patients this prototype can't
// otherwise model, matching CaremapsListScreen's pattern.
function TasksListScreen({ liveCaremap, onOpenActivity, onNavigate, onCreate, persona, onSwitchPersona, onReset, unreadCount, onOpenNotifications, sidebarCollapsed, onToggleSidebar }) {
  const [tab, setTab] = useState("Active");
  const [taskFilter, setTaskFilter] = useState("");
  const [caremapFilter, setCaremapFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { t } = useLanguage();
  const caseManagerMemberId = liveCaremap?.team.find((r) => r.label === "Case manager")?.memberId ?? null;
  const caseManagerPersonaId = PERSONAS.some((p) => p.id === caseManagerMemberId) ? caseManagerMemberId : null;

  const liveRows = liveCaremap
    ? liveCaremap.activities.map((a) => {
        const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.undefined;
        const due = cfg.field ? a[cfg.field.key] : null;
        const responsible = a.assigneeId ? MEMBER_POOL.find((m) => m.id === a.assigneeId)?.name : null;
        return {
          id: `live-${a.id}`,
          activityId: a.id,
          patientName: "DE VRIES, Jan",
          patientMeta: "ID 161 885 4347  -  14.03.1953",
          gender: "male",
          task: a.title,
          caremapTitle: liveCaremap.title,
          responsible: responsible || null,
          assigneeId: a.assigneeId || null,
          provider: a.provider || null,
          status: a.status,
          due,
        };
      })
    : [];
  const allRows = [...liveRows, ...MOCK_TASKS];

  const taskOptions = [...new Set(allRows.map((r) => r.task))];
  const caremapOptions = [...new Set(allRows.map((r) => r.caremapTitle))];
  const statusOptions = [...new Set(allRows.map((r) => r.status))];

  // A staff persona (not the default coordinator) only sees tasks that are
  // either already theirs, or still up for grabs at their own organization —
  // the "claimable queue" that makes self-assignment demonstrable.
  const isStaffPersona = persona.id !== "dr-henley";

  const rows = allRows.filter((r) => {
    const group = tab === "Active" ? "todo" : "resolved";
    if (statusGroup(r.status) !== group) return false;
    if (isStaffPersona) {
      const mine = r.responsible === persona.name || (!r.assigneeId && r.provider === persona.org);
      if (!mine) return false;
    }
    if (taskFilter && r.task !== taskFilter) return false;
    if (caremapFilter && r.caremapTitle !== caremapFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (dateFrom && r.due && r.due.length === 10 && r.due < dateFrom) return false;
    if (dateTo && r.due && r.due.length === 10 && r.due > dateTo) return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: T.fontFamily }}>
      <Sidebar activeLabel="Tasks" onNavigate={onNavigate} unreadCount={unreadCount} collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          title={isStaffPersona ? "My Tasks" : "Tasks"}
          onAdd={onCreate}
          persona={persona}
          onSwitchPersona={onSwitchPersona}
          onReset={onReset}
          unreadCount={unreadCount}
          onOpenNotifications={onOpenNotifications}
          caseManagerPersonaId={caseManagerPersonaId}
        />
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: T.light }}>
          <div className="px-8 pt-6 flex gap-8 border-b bg-white" style={{ borderColor: T.border }}>
            {TASK_LIST_TABS.map((tabLabel) => {
              const active = tabLabel === tab;
              return (
                <button
                  key={tabLabel}
                  onClick={() => setTab(tabLabel)}
                  className="relative pb-3 text-[15px]"
                  style={{ color: active ? T.primary : T.gray700, fontWeight: active ? 700 : 400 }}
                >
                  {t(tabLabel)}
                  {active && <span className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ backgroundColor: T.primary }} />}
                </button>
              );
            })}
          </div>

          <div className="p-8">
            <div className="bg-white rounded-[4px] p-6 mb-6" style={{ boxShadow: T.cardShadow }}>
              <div className="flex gap-6">
                <FilterField label="Caremap">
                  <Select style={selectStyle} value={caremapFilter} onChange={(e) => setCaremapFilter(e.target.value)}>
                    <option value="">{t("All")}</option>
                    {caremapOptions.map((c) => <option key={c} value={c}>{t(c)}</option>)}
                  </Select>
                </FilterField>
                <FilterField label="Task">
                  <Select style={selectStyle} value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)}>
                    <option value="">{t("All")}</option>
                    {taskOptions.map((opt) => <option key={opt} value={opt}>{t(opt)}</option>)}
                  </Select>
                </FilterField>
                <FilterField label="Status">
                  <Select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">{t("All")}</option>
                    {statusOptions.map((s) => <option key={s} value={s}>{t(STATUS_CONFIG[s]?.label || s)}</option>)}
                  </Select>
                </FilterField>
                <div style={{ width: 160 }}>
                  <FilterField label="From">
                    <input type="date" className={selectCls} style={selectStyle} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </FilterField>
                </div>
                <div style={{ width: 160 }}>
                  <FilterField label="To">
                    <input type="date" className={selectCls} style={selectStyle} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </FilterField>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[4px]" style={{ boxShadow: T.cardShadow }}>
              <div className="flex items-center border-b" style={{ borderColor: T.border }}>
                <div className="py-4 px-2 text-[15px] font-semibold flex-[1.5]" style={{ color: T.bodyText }}>{t("Patient")}</div>
                <div className="py-4 px-2 text-[15px] font-semibold flex-[1.3]" style={{ color: T.bodyText }}>{t("Task")}</div>
                <div className="py-4 px-2 text-[15px] font-semibold flex-1" style={{ color: T.bodyText }}>Caremap</div>
                <div className="py-4 px-2 text-[15px] font-semibold flex-1" style={{ color: T.bodyText }}>{t("Responsible person")}</div>
                <div className="py-4 px-2 text-[15px] font-semibold flex-1" style={{ color: T.bodyText }}>Status</div>
                <div className="py-4 px-2 text-[15px] font-semibold flex-[0.9]" style={{ color: T.bodyText }}>{t("Date")}</div>
                <div className="w-10 shrink-0" />
              </div>
              {rows.length === 0 ? (
                <div className="py-12 text-center text-[14px]" style={{ color: T.gray600 }}>
                  {t(`No ${tab.toLowerCase()} tasks match these filters.`)}
                </div>
              ) : (
                rows.map((row) => (
                  <TaskListRow
                    key={row.id}
                    row={row}
                    onOpen={row.activityId ? () => onOpenActivity(row.activityId) : undefined}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= root app ================= */

export default function CaremapsPrototype() {
  const [screen, setScreen] = useState(() => loadSavedDemoState()?.screen ?? "start");
  const [caremap, setCaremap] = useState(() => loadSavedDemoState()?.caremap ?? null);
  const [modal, setModal] = useState(null); // 'create' | 'setPlan' | 'assign' | 'addActivity' | 'editActivity' | 'clinicalConsultant' | 'emergencyContact'
  const [assignFixedRole, setAssignFixedRole] = useState(null);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editingContactId, setEditingContactId] = useState(null);
  const [personaId, setPersonaId] = useState(() => loadSavedDemoState()?.personaId ?? "dr-henley");
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];
  // Whoever currently holds the live caremap's Case Manager role, if that's
  // one of the three switchable demo personas — feeds AccountMenu's
  // "Case manager" quick-switch shortcut on every screen. `null` when the
  // role is unassigned or assigned to someone outside PERSONAS.
  const caseManagerMemberId = caremap?.team.find((r) => r.label === "Case manager")?.memberId ?? null;
  const caseManagerPersonaId = PERSONAS.some((p) => p.id === caseManagerMemberId) ? caseManagerMemberId : null;
  // Simulated notifications — one per task/role assignment, addressed to
  // whichever MEMBER_POOL id got assigned. Only visible when you're viewing
  // that person's persona (see NotificationsScreen), same as the rest of the
  // persona-filtered app.
  const [notifications, setNotifications] = useState(() => loadSavedDemoState()?.notifications ?? SEED_NOTIFICATIONS);
  // PX360 Dashboard layout (Customize view) — part of the saved demo state.
  const [px360Layout, setPx360Layout] = useState(() => normalizeDashboardLayout(loadSavedDemoState()?.px360Layout));
  const unreadCount = notifications.filter((n) => n.recipientId === personaId && !n.read).length;
  // Set right before navigating to "detail" from a message notification's
  // "Open in Messages" button, so `CaremapDetail` mounts straight into the
  // Messages tab with that thread already selected — not persisted, and
  // deliberately not cleared by a setter call site scattered through every
  // other navigation path; `CaremapDetail` clears it itself, once, right
  // after reading it into its own local state on mount (see there), so an
  // unrelated later visit to "detail" (e.g. from the HIS start screen)
  // can't accidentally inherit a stale thread-open request.
  const [openThreadId, setOpenThreadId] = useState(null);
  // Sidebar collapsed/expanded — root state (not local to `Sidebar`) so it
  // survives navigating between top-level screens, each of which mounts its
  // own fresh `Sidebar` instance; not persisted to `localStorage`, so it
  // resets on a page reload like most other transient UI state here.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const notifyAssignment = (recipientId, title, body) => {
    if (!recipientId) return;
    setNotifications((prev) => [
      { id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, recipientId, kind: "assignment", title, body, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  };

  // Fires on every message sent via the Messages tab — a new thread's first
  // message, or any reply — addressed to whichever participant *didn't* just
  // send it. Carries `threadId` (so NotificationDetail can render the live
  // thread instead of a static body) and `senderName` (so the notification
  // list can show who actually sent it, not the generic "Vitaly Assistant"
  // system label the assignment notifications use).
  const notifyMessage = (recipientId, title, body, threadId, senderName) => {
    if (!recipientId) return;
    setNotifications((prev) => [
      { id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, recipientId, kind: "message", title, body, threadId, senderName, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Language preference persists independently of demo progress (its own
  // localStorage key) — switching languages mid-demo shouldn't be undone by
  // "Reset demo", and resetting the demo shouldn't change your language.
  const [lang, setLangState] = useState(loadSavedLang);
  const setLang = (l) => {
    setLangState(l);
    saveLang(l);
  };
  const t = (str, context) => {
    if (lang !== "nl") return str;
    if (context) {
      const scoped = NL[`${context}:${str}`];
      if (scoped != null) return scoped;
    }
    return NL[str] ?? str;
  };

  // Practice-mode autosave: every change to the demo's real state (not
  // transient modal/editing state) is persisted to localStorage so a reload
  // picks up where you left off. "Reset demo" (in the account menu) clears
  // this and returns to the app's true initial state.
  useEffect(() => {
    saveDemoState({ screen, caremap, personaId, notifications, px360Layout });
  }, [screen, caremap, personaId, notifications, px360Layout]);

  const resetDemo = () => {
    clearSavedDemoState();
    setScreen("start");
    setCaremap(null);
    setModal(null);
    setAssignFixedRole(null);
    setEditingActivityId(null);
    setEditingContactId(null);
    setPersonaId("dr-henley");
    setNotifications(SEED_NOTIFICATIONS);
    setPx360Layout(defaultDashboardLayout());
  };

  const createCaremap = (unit, template) => {
    setCaremap({
      unit,
      template,
      title: `${template} Caremap`,
      careFocus: "Quality of life and symptom management, alongside ongoing medical follow-up",
      status: "draft",
      startDate: null,
      startDateISO: null,
      planConfigured: false,
      planToggles: defaultPlanToggles(),
      activities: [],
      team: [{ id: "t-case-manager", label: "Case manager", group: "mandatory", memberId: null }],
      // The GP who created the caremap — always shown on the team, but not a
      // reassignable role slot (no memberId/team entry, just fixed metadata).
      createdBy: { name: CURRENT_USER_NAME, jobTitle: "GP" },
      clinicalConsultant: null,
      emergencyContacts: [],
      comments: [],
      messageThreads: [],
    });
    // "Create new caremap" is only reachable from the EMR/HIS start screen
    // now (see the Caremaps-list "+" removal decision) — so this is always
    // the EMR→Vitaly handoff, and continuing straight into Set Plan keeps
    // that flow going instead of dropping the user on the Overview tab with
    // an extra manual step.
    setScreen("detail");
    setModal("setPlan");
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
      return {
        ...c,
        status: "active",
        startDate: start,
        startDateISO: date,
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

  // Only ever called with an already-existing role's own label — either
  // "Case manager" (seeded at caremap creation, so always present) or
  // another role's label via its RoleCard's "Re-Assign member" button
  // (which only exists once that role's own team entry already does).
  // Creating a brand-new team entry is handleAddTeamMember's job now, not
  // this one — see below.
  const handleAssign = (roleLabel, memberId) => {
    const existing = caremap.team.find((t) => t.label === roleLabel);
    if (memberId && existing?.memberId !== memberId) {
      notifyAssignment(memberId, `${roleLabel} — DE VRIES, Jan`, `You've been assigned as ${roleLabel} on "${caremap.title}" for DE VRIES, Jan.`);
    }
    setCaremap((c) => {
      const team = c.team.map((t) => (t.label === roleLabel ? { ...t, memberId } : t));
      const activities = syncCaseManagerActivity(c.activities, team);
      return { ...c, team, activities };
    });
    setModal(null);
  };

  // The open-ended "add a member" flow (no role chosen up front, see
  // AssignRoleModal) — always creates a fresh team entry rather than
  // trying to find-or-update by label, since there's no slot concept here
  // to reuse: two different people can share a job title without
  // colliding onto the same entry. Labeled by the member's own job title,
  // same convention an activity-only assignee is shown under.
  const handleAddTeamMember = (memberId) => {
    const member = MEMBER_POOL.find((m) => m.id === memberId);
    notifyAssignment(memberId, `${member.jobTitle} — DE VRIES, Jan`, `You've been added to the care team for DE VRIES, Jan.`);
    setCaremap((c) => ({
      ...c,
      team: [...c.team, { id: `t-${Date.now()}`, label: member.jobTitle, group: "others", memberId }],
    }));
    setModal(null);
  };

  // Case Manager is mandatory, so removing it clears the assignment rather
  // than deleting the slot — it reverts to the "not yet assigned" state
  // (MandatoryRoleRow / the unfilled prominent RoleCard) instead of
  // disappearing. Every other role only exists because someone was
  // assigned to it in the first place (see handleAssign), so removing it
  // deletes the team entry outright rather than leaving an empty "please
  // assign" card behind for a role that never existed before.
  const handleRemoveTeamMember = (roleId) => {
    setCaremap((c) => {
      const role = c.team.find((t) => t.id === roleId);
      if (!role) return c;
      const team =
        role.label === "Case manager"
          ? c.team.map((t) => (t.id === roleId ? { ...t, memberId: null } : t))
          : c.team.filter((t) => t.id !== roleId);
      const activities = syncCaseManagerActivity(c.activities, team);
      return { ...c, team, activities };
    });
  };

  const addActivity = (form) => {
    if (form.assignee) {
      notifyAssignment(form.assignee, `${form.type} — DE VRIES, Jan`, `You've been assigned "${form.type}" on "${caremap.title}" for DE VRIES, Jan.`);
    }
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
    const prev = caremap.activities.find((a) => a.id === id);
    if (patch.assigneeId && patch.assigneeId !== prev?.assigneeId) {
      notifyAssignment(patch.assigneeId, `${prev?.title} — DE VRIES, Jan`, `You've been assigned "${prev?.title}" on "${caremap.title}" for DE VRIES, Jan.`);
    }
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

  // From the Tasks list: navigate into the caremap detail screen first, then
  // open the same edit modal on top of it — rather than editing in place
  // over the list, per the requested "open the caremap, then the task
  // lightbox within it" flow.
  const openActivityFromTasksList = (id) => {
    setScreen("detail");
    openEditActivity(id);
  };

  const editingActivity = caremap?.activities.find((a) => a.id === editingActivityId) || null;

  const saveClinicalConsultant = (consultant) => {
    setCaremap((c) => ({ ...c, clinicalConsultant: consultant }));
  };

  const removeClinicalConsultant = () => {
    setCaremap((c) => ({ ...c, clinicalConsultant: null }));
  };

  const openEmergencyContact = (id) => {
    setEditingContactId(id);
    setModal("emergencyContact");
  };

  const editingContact = caremap?.emergencyContacts.find((c) => c.id === editingContactId) || null;

  const saveEmergencyContact = (contact) => {
    setCaremap((c) => {
      const exists = c.emergencyContacts.some((x) => x.id === contact.id);
      return {
        ...c,
        emergencyContacts: exists
          ? c.emergencyContacts.map((x) => (x.id === contact.id ? contact : x))
          : [...c.emergencyContacts, contact],
      };
    });
  };

  const removeEmergencyContact = (id) => {
    setCaremap((c) => ({ ...c, emergencyContacts: c.emergencyContacts.filter((x) => x.id !== id) }));
  };

  const addComment = (text, important) => {
    setCaremap((c) => ({
      ...c,
      comments: [
        ...c.comments,
        { id: `cm-${Date.now()}`, author: persona.name, text, important, createdAt: new Date().toISOString() },
      ],
    }));
  };

  const startMessageThread = (to, subject, text) => {
    const threadId = `mt-${Date.now()}`;
    setCaremap((c) => ({
      ...c,
      messageThreads: [
        {
          id: threadId,
          subject,
          participants: [persona.name, to],
          critical: false,
          resolved: false,
          messages: [{ id: `msg-${Date.now()}`, author: persona.name, text, createdAt: new Date().toISOString() }],
        },
        ...c.messageThreads,
      ],
    }));
    const recipientId = PERSONAS.find((p) => p.name === to)?.id;
    notifyMessage(recipientId, `${subject} — ${persona.name}`, text, threadId, persona.name);
  };

  const replyToThread = (threadId, text) => {
    setCaremap((c) => ({
      ...c,
      messageThreads: c.messageThreads.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, { id: `msg-${Date.now()}`, author: persona.name, text, createdAt: new Date().toISOString() }] }
          : t
      ),
    }));
    const thread = caremap?.messageThreads.find((t) => t.id === threadId);
    if (thread) {
      const counterpartName = thread.participants.find((p) => p !== persona.name);
      const recipientId = PERSONAS.find((p) => p.name === counterpartName)?.id;
      notifyMessage(recipientId, `${thread.subject} — ${persona.name}`, text, threadId, persona.name);
    }
  };

  const toggleThreadCritical = (threadId) => {
    setCaremap((c) => ({
      ...c,
      messageThreads: c.messageThreads.map((t) => (t.id === threadId ? { ...t, critical: !t.critical } : t)),
    }));
  };

  const resolveThread = (threadId) => {
    setCaremap((c) => ({
      ...c,
      messageThreads: c.messageThreads.map((t) => (t.id === threadId ? { ...t, resolved: true } : t)),
    }));
  };

  // Sidebar nav fires this for every item; only labels the prototype
  // actually models (Caremaps, Tasks, PX360) do anything — the rest stay
  // inert. PatientBar's tabs reuse this same handler (see PatientBar); its
  // "CAREMAPS" tab is patient-context (goes straight to this patient's own
  // caremap) so it's kept distinct from the Sidebar's cross-patient "Caremaps".
  const handleNavigate = (label) => {
    if (label === "Home") setScreen("start");
    else if (label === "Caremaps") setScreen("list");
    else if (label === "CAREMAPS") setScreen(caremap ? "detail" : "list");
    else if (label === "Tasks") setScreen("tasks");
    else if (label === "PX360") setScreen("px360");
    else if (label === "DOCUMENTS") setScreen("documents");
    else if (label === "Notifications") setScreen("notifications");
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
    <div style={{ fontFamily: T.fontFamily }}>
      {screen === "start" && (
        <HISShell
          hasCaremap={!!caremap}
          onCreate={() => setModal("create")}
          onOpen={() => setScreen("detail")}
          onOpenPx360={() => setScreen("px360")}
        />
      )}
      {screen === "list" && (
        <CaremapsListScreen
          liveCaremap={caremap}
          onOpenLiveCaremap={() => setScreen("detail")}
          onNavigate={handleNavigate}
          persona={persona}
          onSwitchPersona={setPersonaId}
          onReset={resetDemo}
          unreadCount={unreadCount}
          onOpenNotifications={() => setScreen("notifications")}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
      )}
      {screen === "tasks" && (
        <TasksListScreen
          liveCaremap={caremap}
          onOpenActivity={openActivityFromTasksList}
          onNavigate={handleNavigate}
          onCreate={caremap ? () => setModal("addActivity") : undefined}
          persona={persona}
          onSwitchPersona={setPersonaId}
          onReset={resetDemo}
          unreadCount={unreadCount}
          onOpenNotifications={() => setScreen("notifications")}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
      )}
      {screen === "px360" && (
        <Px360Screen
          hasCaremap={!!caremap}
          onBack={() => setScreen("start")}
          onNavigate={handleNavigate}
          persona={persona}
          onSwitchPersona={setPersonaId}
          onReset={resetDemo}
          unreadCount={unreadCount}
          onOpenNotifications={() => setScreen("notifications")}
          caseManagerPersonaId={caseManagerPersonaId}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          dashboardLayout={px360Layout}
          onDashboardLayoutChange={setPx360Layout}
        />
      )}
      {screen === "documents" && (
        <DocumentsScreen
          hasCaremap={!!caremap}
          onBack={() => setScreen("start")}
          onNavigate={handleNavigate}
          persona={persona}
          onSwitchPersona={setPersonaId}
          onReset={resetDemo}
          unreadCount={unreadCount}
          onOpenNotifications={() => setScreen("notifications")}
          caseManagerPersonaId={caseManagerPersonaId}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
      )}
      {screen === "notifications" && (
        <NotificationsScreen
          notifications={notifications}
          messageThreads={caremap?.messageThreads ?? []}
          persona={persona}
          onMarkRead={markNotificationRead}
          onNavigate={handleNavigate}
          onSwitchPersona={setPersonaId}
          onReset={resetDemo}
          onOpenCaremap={() => setScreen(caremap ? "detail" : "start")}
          onOpenThread={(threadId) => {
            setOpenThreadId(threadId);
            setScreen(caremap ? "detail" : "start");
          }}
          caseManagerPersonaId={caseManagerPersonaId}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
      )}
      {screen === "detail" && caremap && (
        <CaremapDetail
          caremap={caremap}
          openThreadId={openThreadId}
          onThreadConsumed={() => setOpenThreadId(null)}
          back={() => setScreen("start")}
          onOpenSetPlan={() => setModal("setPlan")}
          onOpenAssign={openAssign}
          onRemoveMember={handleRemoveTeamMember}
          onOpenAddActivity={() => setModal("addActivity")}
          onOpenEditActivity={openEditActivity}
          onOpenClinicalConsultant={() => setModal("clinicalConsultant")}
          onOpenEmergencyContact={openEmergencyContact}
          persona={persona}
          onSwitchPersona={setPersonaId}
          onReset={resetDemo}
          onAddComment={addComment}
          onStartThread={startMessageThread}
          onReplyThread={replyToThread}
          onToggleThreadCritical={toggleThreadCritical}
          onResolveThread={resolveThread}
          onNavigate={handleNavigate}
          unreadCount={unreadCount}
          onOpenNotifications={() => setScreen("notifications")}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
      )}

      {modal === "create" && <CreateCaremapModal onClose={() => setModal(null)} onCreate={createCaremap} />}
      {modal === "setPlan" && caremap && (
        <SetPlanModal caremap={caremap} onClose={() => setModal(null)} onActivate={activatePlan} onSaveDraft={saveDraft} />
      )}
      {modal === "assign" && (
        <AssignRoleModal fixedRole={assignFixedRole} onClose={() => setModal(null)} onAssign={handleAssign} onAddMember={handleAddTeamMember} />
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
      {modal === "clinicalConsultant" && caremap && (
        <ClinicalConsultantModal
          consultant={caremap.clinicalConsultant}
          onClose={() => setModal(null)}
          onSave={saveClinicalConsultant}
          onRemove={removeClinicalConsultant}
        />
      )}
      {modal === "emergencyContact" && caremap && (
        <EmergencyContactModal
          contact={editingContact}
          onClose={() => setModal(null)}
          onSave={saveEmergencyContact}
          onRemove={removeEmergencyContact}
        />
      )}
    </div>
    </LanguageContext.Provider>
  );
}
