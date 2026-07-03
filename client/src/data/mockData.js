import dayjs from "dayjs";
import { ROLES } from "../config/roles.js";

export const demoUsers = [
  {
    id: "u_admin",
    name: "Aarav Mehta",
    email: "admin@nexacrm.com",
    role: ROLES.ADMIN,
    region: "Global",
    status: "Active",
    avatar: "AM",
    performance: 96,
  },
  {
    id: "u_manager",
    name: "Mira Shah",
    email: "manager@nexacrm.com",
    role: ROLES.MANAGER,
    region: "West India",
    status: "Active",
    avatar: "MS",
    performance: 91,
  },
  {
    id: "u_sales",
    name: "Rohan Iyer",
    email: "sales@nexacrm.com",
    role: ROLES.SALES,
    region: "Mumbai",
    status: "Active",
    avatar: "RI",
    performance: 88,
  },
  {
    id: "u_support",
    name: "Kavya Nair",
    email: "support@nexacrm.com",
    role: ROLES.SUPPORT,
    region: "Bengaluru",
    status: "Active",
    avatar: "KN",
    performance: 84,
  },
];

// Fallback used only until the backend responds (or if the API call
// fails). In normal operation these values come from GET /dashboard
// (`leadStatuses`), which is the single, database-driven source of
// truth shared by both the Lead status dropdown and the Pipeline board.
export const leadStatuses = [
  "New",
  "Contacted",
  "Requirement Analysis",
  "Proposal Sent",
  "Negotiation",
  "Converted",
  "Lost",
];

// Pipeline columns are the same statuses minus "Converted" — a converted
// lead leaves the pipeline and becomes a Customer instead.
export const pipelineStages = leadStatuses.filter(
  (status) => status !== "Converted",
);
export const priorities = ["High", "Medium", "Low"];
export const customerCategories = [
  "Strategic",
  "Enterprise",
  "Mid Market",
  "SMB",
];

export const initialLeads = [
  {
    id: "lead_1001",
    name: "Nisha Kapoor",
    company: "GreenGrid Energy",
    email: "nisha@greengrid.example",
    phone: "+91 98122 45109",
    source: "Web Form",
    status: "Requirement Analysis",
    stage: "Requirement Analysis",
    priority: "High",
    category: "Enterprise",
    address: "Plot 12, Sector 44, Gurugram, Haryana",
    value: 420000,
    ownerId: "u_sales",
    owner: "Rohan Iyer",
    nextFollowUp: dayjs().add(1, "day").format("YYYY-MM-DD"),
    expectedClose: dayjs().add(16, "day").format("YYYY-MM-DD"),
    notes: "Needs multi-branch automation with approval tracking.",
  },
  {
    id: "lead_1002",
    name: "Dev Malhotra",
    company: "BrightPath Learning",
    email: "dev@brightpath.example",
    phone: "+91 98770 11342",
    source: "Referral",
    status: "Proposal Sent",
    stage: "Proposal Sent",
    priority: "Medium",
    category: "Mid Market",
    address: "221 MG Road, Pune, Maharashtra",
    value: 260000,
    ownerId: "u_manager",
    owner: "Mira Shah",
    nextFollowUp: dayjs().add(2, "day").format("YYYY-MM-DD"),
    expectedClose: dayjs().add(21, "day").format("YYYY-MM-DD"),
    notes: "Comparing against two existing vendors.",
  },
  {
    id: "lead_1003",
    name: "Anaya Rao",
    company: "UrbanNest Realty",
    email: "anaya@urbannest.example",
    phone: "+91 99818 45001",
    source: "LinkedIn",
    status: "Contacted",
    stage: "Contacted",
    priority: "High",
    category: "Enterprise",
    address: "B-Wing, Bandra Kurla Complex, Mumbai",
    value: 640000,
    ownerId: "u_sales",
    owner: "Rohan Iyer",
    nextFollowUp: dayjs().add(3, "day").format("YYYY-MM-DD"),
    expectedClose: dayjs().add(30, "day").format("YYYY-MM-DD"),
    notes:
      "Requirement Analysis in field sales tracking and WhatsApp follow-ups.",
  },
  {
    id: "lead_1004",
    name: "Kabir Khan",
    company: "Finaxis Capital",
    email: "kabir@finaxis.example",
    phone: "+91 98765 11109",
    source: "Event",
    status: "Negotiation",
    stage: "Negotiation",
    priority: "High",
    category: "Strategic",
    address: "19th Floor, Cyber Tower, Hyderabad",
    value: 890000,
    ownerId: "u_manager",
    owner: "Mira Shah",
    nextFollowUp: dayjs().add(1, "day").format("YYYY-MM-DD"),
    expectedClose: dayjs().add(10, "day").format("YYYY-MM-DD"),
    notes: "Legal review is pending on payment terms.",
  },
  {
    id: "lead_1005",
    name: "Esha Menon",
    company: "CloudKart Retail",
    email: "esha@cloudkart.example",
    phone: "+91 98970 22117",
    source: "Cold Email",
    status: "Requirement Analysis",
    stage: "Requirement Analysis",
    priority: "Low",
    category: "SMB",
    address: "44 Residency Road, Bengaluru",
    value: 175000,
    ownerId: "u_sales",
    owner: "Rohan Iyer",
    nextFollowUp: dayjs().add(5, "day").format("YYYY-MM-DD"),
    expectedClose: dayjs().add(45, "day").format("YYYY-MM-DD"),
    notes: "Budget cycle starts next month.",
  },
];

export const initialCustomers = [
  {
    id: "cust_2101",
    name: "Pranav Sethi",
    company: "Vertex Logistics",
    email: "pranav@vertex.example",
    phone: "+91 97111 20145",
    address: "Andheri East, Mumbai",
    category: "Enterprise",
    owner: "Mira Shah",
    status: "Active",
    value: 1260000,
    lastContact: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    notes: "Expansion opportunity in warehouse automation.",
  },
  {
    id: "cust_2102",
    name: "Sneha Kulkarni",
    company: "MedNova Clinics",
    email: "sneha@mednova.example",
    phone: "+91 98776 33410",
    address: "HSR Layout, Bengaluru",
    category: "Mid Market",
    owner: "Rohan Iyer",
    status: "Active",
    value: 780000,
    lastContact: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    notes: "Support team is tracking appointment integration queries.",
  },
  {
    id: "cust_2103",
    name: "Harsh Patel",
    company: "Astra Foods",
    email: "harsh@astrafoods.example",
    phone: "+91 98220 71449",
    address: "SG Highway, Ahmedabad",
    category: "SMB",
    owner: "Rohan Iyer",
    status: "Renewal",
    value: 340000,
    lastContact: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    notes: "Renewal quote sent with bundled support.",
  },
  {
    id: "cust_2104",
    name: "Meera Thomas",
    company: "NorthStar Travel",
    email: "meera@northstar.example",
    phone: "+91 99008 55211",
    address: "Panampilly Nagar, Kochi",
    category: "Strategic",
    owner: "Mira Shah",
    status: "At Risk",
    value: 980000,
    lastContact: dayjs().subtract(9, "day").format("YYYY-MM-DD"),
    notes: "Escalation around response SLA requires manager review.",
  },
];

export const initialTasks = [
  {
    id: "task_3001",
    title: "Prepare enterprise pricing revision",
    relatedTo: "Finaxis Capital",
    assignee: "Mira Shah",
    type: "Proposal",
    dueDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
    priority: "High",
    status: "In Progress",
  },
  {
    id: "task_3002",
    title: "Verify support ticket closure",
    relatedTo: "NorthStar Travel",
    assignee: "Kavya Nair",
    type: "Support",
    dueDate: dayjs().add(2, "day").format("YYYY-MM-DD"),
    priority: "High",
    status: "Open",
  },
  {
    id: "task_3003",
    title: "Schedule demo with procurement team",
    relatedTo: "GreenGrid Energy",
    assignee: "Rohan Iyer",
    type: "Meeting",
    dueDate: dayjs().add(3, "day").format("YYYY-MM-DD"),
    priority: "Medium",
    status: "Open",
  },
  {
    id: "task_3004",
    title: "Send renewal confirmation",
    relatedTo: "Astra Foods",
    assignee: "Rohan Iyer",
    type: "Follow-up",
    dueDate: dayjs().add(4, "day").format("YYYY-MM-DD"),
    priority: "Low",
    status: "Completed",
  },
];

export const initialCommunications = [
  {
    id: "comm_4001",
    type: "Call",
    subject: "Budget approval discussion",
    linkedTo: "Finaxis Capital",
    owner: "Mira Shah",
    date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    outcome: "Commercial terms accepted",
    sentiment: "Positive",
  },
  {
    id: "comm_4002",
    type: "Email",
    subject: "Demo summary and scope",
    linkedTo: "GreenGrid Energy",
    owner: "Rohan Iyer",
    date: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    outcome: "Technical evaluation started",
    sentiment: "Positive",
  },
  {
    id: "comm_4003",
    type: "WhatsApp",
    subject: "Renewal reminder",
    linkedTo: "Astra Foods",
    owner: "Rohan Iyer",
    date: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
    outcome: "Awaiting finance sign-off",
    sentiment: "Neutral",
  },
  {
    id: "comm_4004",
    type: "Ticket",
    subject: "SLA escalation",
    linkedTo: "NorthStar Travel",
    owner: "Kavya Nair",
    date: dayjs().subtract(4, "day").format("YYYY-MM-DD"),
    outcome: "Root cause shared",
    sentiment: "Watch",
  },
];

export const activities = [
  {
    id: "a1",
    label: "Lead converted",
    detail: "Kabir moved to Negotiation",
    time: "11:20 AM",
    tone: "success",
  },
  {
    id: "a2",
    label: "Follow-up created",
    detail: "GreenGrid executive demo",
    time: "10:05 AM",
    tone: "primary",
  },
  {
    id: "a3",
    label: "Ticket updated",
    detail: "NorthStar SLA case",
    time: "09:30 AM",
    tone: "warning",
  },
  {
    id: "a4",
    label: "Report exported",
    detail: "Monthly sales summary",
    time: "Yesterday",
    tone: "info",
  },
];

export const revenueData = [
  { month: "Jan", revenue: 720000, target: 680000 },
  { month: "Feb", revenue: 810000, target: 720000 },
  { month: "Mar", revenue: 760000, target: 760000 },
  { month: "Apr", revenue: 940000, target: 820000 },
  { month: "May", revenue: 1120000, target: 900000 },
  { month: "Jun", revenue: 1260000, target: 980000 },
];

export const conversionData = [
  { name: "New", value: 48 },
  { name: "Contacted", value: 36 },
  { name: "Requirement Analysis", value: 25 },
  { name: "Converted", value: 14 },
];

export const categoryData = [
  { name: "Enterprise", value: 34 },
  { name: "Mid Market", value: 42 },
  { name: "SMB", value: 24 },
];

export const teamPerformance = demoUsers
  .filter((user) => user.role !== ROLES.ADMIN)
  .map((user) => ({
    name: user.name.split(" ")[0],
    score: user.performance,
    deals: Math.round(user.performance / 8),
  }));
