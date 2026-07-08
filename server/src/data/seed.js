const today = new Date();
const iso = (offsetDays = 0) => new Date(today.getTime() + offsetDays * 86400000).toISOString();

export const seed = {
  users: [
    {
      id: "u_admin",
      name: "Aarav Mehta",
      email: "admin@nexacrm.com",
      password: "Nexa@123",
      role: "Administrator",
      region: "Global",
      status: "Active",
      avatar: "AM",

      createdAt: iso(-30),
      updatedAt: iso(-1)
    },
    {
      id: "u_manager",
      name: "Mira Shah",
      email: "manager@nexacrm.com",
      password: "Nexa@123",
      role: "Manager",
      region: "West India",
      status: "Active",
      avatar: "MS",

      createdAt: iso(-28),
      updatedAt: iso(-1)
    },
    {
      id: "u_sales",
      name: "Rohan Iyer",
      email: "sales@nexacrm.com",
      password: "Nexa@123",
      role: "Sales Executive",
      region: "Mumbai",
      status: "Active",
      avatar: "RI",

      createdAt: iso(-24),
      updatedAt: iso(-1)
    },
    {
      id: "u_support",
      name: "Kavya Nair",
      email: "support@nexacrm.com",
      password: "Nexa@123",
      role: "Customer Support Executive",
      region: "Bengaluru",
      status: "Active",
      avatar: "KN",

      createdAt: iso(-22),
      updatedAt: iso(-1)
    }
  ],
  leads: [
    {
      id: "lead_1001",
      name: "Nisha Kapoor",
      company: "GreenGrid Energy",
      email: "nisha@greengrid.example",
      phone: "+91 98122 45109",
      source: "Web Form",
      status: "Qualified",
      priority: "High",
      industry: "Energy",
      value: 420000,
      ownerId: "u_sales",
      owner: "Rohan Iyer",
      nextFollowUp: iso(1),
      expectedClose: iso(16),
      notes: "Needs multi-branch automation with approval tracking.",
      createdAt: iso(-12),
      updatedAt: iso(-1)
    },
    {
      id: "lead_1002",
      name: "Dev Malhotra",
      company: "BrightPath Learning",
      email: "dev@brightpath.example",
      phone: "+91 98770 11342",
      source: "Referral",
      status: "Proposal Sent",
      priority: "Medium",
      industry: "Education",
      value: 260000,
      ownerId: "u_manager",
      owner: "Mira Shah",
      nextFollowUp: iso(2),
      expectedClose: iso(21),
      notes: "Comparing against two existing vendors.",
      createdAt: iso(-9),
      updatedAt: iso(-2)
    },
    {
      id: "lead_1003",
      name: "Anaya Rao",
      company: "UrbanNest Realty",
      email: "anaya@urbannest.example",
      phone: "+91 99818 45001",
      source: "LinkedIn",
      status: "Contacted",
      priority: "High",
      industry: "Real Estate",
      value: 640000,
      ownerId: "u_sales",
      owner: "Rohan Iyer",
      nextFollowUp: iso(3),
      expectedClose: iso(30),
      notes: "Interested in field sales tracking and WhatsApp follow-ups.",
      createdAt: iso(-6),
      updatedAt: iso(-1)
    },
    {
      id: "lead_1004",
      name: "Kabir Khan",
      company: "Finaxis Capital",
      email: "kabir@finaxis.example",
      phone: "+91 98765 11109",
      source: "Event",
      status: "Negotiation",
      priority: "High",
      industry: "Finance",
      value: 890000,
      ownerId: "u_manager",
      owner: "Mira Shah",
      nextFollowUp: iso(1),
      expectedClose: iso(10),
      notes: "Legal review is pending on payment terms.",
      createdAt: iso(-4),
      updatedAt: iso(0)
    }
  ],
  customers: [
    {
      id: "cust_2101",
      name: "Pranav Sethi",
      company: "Vertex Logistics",
      email: "pranav@vertex.example",
      phone: "+91 97111 20145",
      address: "Andheri East, Mumbai",
      category: "Enterprise",
      industry: "Logistics",
      owner: "Mira Shah",
      status: "Active",
      sourceLeadId: null,
      value: 1260000,
      lastContact: iso(-2),
      notes: "Expansion opportunity in warehouse automation.",
      createdAt: iso(-60),
      updatedAt: iso(-2)
    },
    {
      id: "cust_2102",
      name: "Sneha Kulkarni",
      company: "MedNova Clinics",
      email: "sneha@mednova.example",
      phone: "+91 98776 33410",
      address: "HSR Layout, Bengaluru",
      category: "Mid Market",
      industry: "Healthcare",
      owner: "Rohan Iyer",
      status: "Active",
      sourceLeadId: null,
      value: 780000,
      lastContact: iso(-1),
      notes: "Support team is tracking appointment integration queries.",
      createdAt: iso(-45),
      updatedAt: iso(-1)
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
      sourceLeadId: null,
      value: 340000,
      lastContact: iso(-6),
      notes: "Renewal quote sent with bundled support.",
      createdAt: iso(-90),
      updatedAt: iso(-6)
    }
  ],
  tasks: [
    {
      id: "task_3001",
      title: "Prepare enterprise pricing revision",
      relatedTo: "Finaxis Capital",
      assignee: "Mira Shah",
      type: "Proposal",
      dueDate: iso(1),
      priority: "High",
      status: "In Progress",
      createdAt: iso(-2),
      updatedAt: iso(-1)
    },
    {
      id: "task_3002",
      title: "Verify support ticket closure",
      relatedTo: "NorthStar Travel",
      assignee: "Kavya Nair",
      type: "Support",
      dueDate: iso(2),
      priority: "High",
      status: "Open",
      createdAt: iso(-1),
      updatedAt: iso(-1)
    }
  ],
  communications: [
    {
      id: "comm_4001",
      type: "Call",
      subject: "Budget approval discussion",
      receiverName: "Kabir Khan",
      linkedTo: "Finaxis Capital",
      owner: "Mira Shah",
      date: iso(-1),
      outcome: "Commercial terms accepted",
      createdAt: iso(-1),
      updatedAt: iso(-1)
    },
    {
      id: "comm_4002",
      type: "Email",
      subject: "Demo summary and scope",
      receiverName: "Nisha Kapoor",
      linkedTo: "GreenGrid Energy",
      owner: "Rohan Iyer",
      date: iso(-2),
      outcome: "Technical evaluation started",
      createdAt: iso(-2),
      updatedAt: iso(-2)
    }
  ],
  followUps: [
    {
      id: "follow_5001",
      relatedType: "Lead",
      relatedName: "GreenGrid Energy",
      reminderAt: iso(1),
      notes: "Executive demo and pricing scope",
      outcome: "Scheduled",
      nextFollowUp: iso(4),
      owner: "Rohan Iyer",
      createdAt: iso(-1),
      updatedAt: iso(-1)
    }
  ],
  campaigns: [
  {
    id: "camp_1001",
    name: "Summer Sale 2026",
    type: "Email",
    status: "Active",
    owner: "Aarav Mehta",
    customer: "cust_2101",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    leadsGenerated: 0,
    convertedCustomers: 0,
    description: "Email marketing campaign",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
],
  notifications: [
    {
      id: "note_6001",
      title: "Follow-up due",
      message: "GreenGrid Energy demo is due tomorrow",
      type: "Follow-up",
      read: false,
      createdAt: iso(-1),
      updatedAt: iso(-1)
    }
  ],
  activities: [
    {
      id: "activity_7001",
      label: "Lead converted",
      detail: "Kabir moved to Negotiation",
      actor: "Mira Shah",
      tone: "success",
      createdAt: iso(0),
      updatedAt: iso(0)
    }
  ],
  reports: [
    {
      id: "report_8001",
      name: "Monthly sales summary",
      type: "Sales",
      period: "Monthly",
      generatedBy: "Aarav Mehta",
      createdAt: iso(-1),
      updatedAt: iso(-1)
    }
  ],
  passwordResets: []
};
