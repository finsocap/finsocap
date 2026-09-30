import { ServiceItem } from "@/types";

export const initialServices: ServiceItem[] = [
  {
    id: "SRV-001",
    name: "FSSAI Registration (Basic)",
    category: "Food & Beverage",
    description: "Standard Food Safety and Standards Authority of India (FSSAI) 14-digit registration for food startups, cloud kitchens, and retailers with annual turnover under 12 Lakhs.",
    recurring: "Yes",
    frequency: "Yearly",
    price: 4700,
    governmentFee: 100,
    processingTime: "1 - 3 Days",
    status: "Active",
    isPopular: true,
    content: "<p>The FSSAI Basic Registration is mandatory for petty food business operators including small manufacturers, retailers, hawkers, itinerant vendors or temporary stallholders.</p><h3>Process Overview</h3><ul><li>Document Verification & FoSCoS portal filing</li><li>Unique 14-digit ARN generation</li><li>Certificate grant by Designated Officer (DO)</li></ul>",
    highlights: [
      "100% Online FoSCoS Application Process",
      "Immediate ARN generation for business bank accounts",
      "Govt Certificate delivered in 1 - 3 business days",
      "Dedicated Food Safety compliance advisor"
    ],
    steps: [
      "Collect PAN, Aadhaar, Business Address proof & Photo",
      "Draft Form A on FoSCoS official portal",
      "Pay Govt Challan of ₹100",
      "Upload Food Safety Declaration & Submit",
      "Download & issue signed certificate with QR Code"
    ],
    eligibility: "Any food business, cart, home kitchen or dairy with turnover up to ₹12 Lakhs/year.",
    documents: [
      { id: "doc-1", name: "Applicant Passport Size Photo", type: "Required" },
      { id: "doc-2", name: "Aadhaar Card / Voter ID", type: "Required" },
      { id: "doc-3", name: "Business Electricity Bill / Rent Agreement", type: "Required" },
      { id: "doc-4", name: "Partnership Deed / Incorporation Certificate", type: "Optional" }
    ],
    usefulLinks: [
      { id: "link-1", title: "FoSCoS Official Portal", url: "https://foscos.fssai.gov.in" },
      { id: "link-2", title: "Food Safety Standards Act PDF", url: "https://fssai.gov.in" }
    ],
    videoLink: "https://youtube.com/watch?v=demo-fssai-guide",
    studyMaterials: [
      { id: "mat-1", title: "Cyber Cafe Partner FSSAI Filing Guide.pdf", fileUrl: "/materials/fssai-guide.pdf" }
    ],
    faqs: [
      { id: "faq-1", question: "Is FSSAI mandatory for home kitchens and cloud kitchens?", answer: "Yes, every food business operator selling food directly or via Zomato/Swiggy must obtain an FSSAI registration number." },
      { id: "faq-2", question: "How long is the basic registration valid?", answer: "Basic registration can be applied for 1 to 5 years. Standard renewal is recommended annually." }
    ],
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "SRV-002",
    name: "FSSAI State License",
    category: "Food & Beverage",
    description: "State-level FSSAI License for mid-sized manufacturers, distributors, restaurants, and cloud kitchens with annual revenue between 12 Lakhs and 20 Crores.",
    recurring: "Yes",
    frequency: "Yearly",
    price: 7500,
    governmentFee: 2000,
    processingTime: "7 - 15 Days",
    status: "Active",
    isPopular: true,
    createdAt: "2026-01-12T10:00:00.000Z"
  },
  {
    id: "SRV-003",
    name: "FSSAI Central License",
    category: "Food & Beverage",
    description: "Central License for large enterprise food operators, import/export ventures, and multi-state operations with annual revenue exceeding 20 Crores.",
    recurring: "Yes",
    frequency: "Yearly",
    price: 12000,
    governmentFee: 7500,
    processingTime: "15 - 30 Days",
    status: "Active",
    createdAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "SRV-004",
    name: "Water Test Report",
    category: "Food & Beverage",
    description: "Authorized NABL lab potable water test analysis required for mandatory FSSAI food kitchen compliance.",
    recurring: "No",
    frequency: "One Time",
    price: 1500,
    governmentFee: 0,
    processingTime: "3 - 7 Days",
    status: "Active",
    createdAt: "2026-01-18T10:00:00.000Z"
  },
  {
    id: "SRV-005",
    name: "Foscos Training Certificate",
    category: "Food & Beverage",
    description: "FoSTaC Food Safety Supervisor certification course and examination for cloud kitchen supervisors.",
    recurring: "No",
    frequency: "One Time",
    price: 2500,
    governmentFee: 0,
    processingTime: "1 - 2 Days",
    status: "Active",
    createdAt: "2026-01-20T10:00:00.000Z"
  },
  {
    id: "SRV-006",
    name: "GST Registration",
    category: "Taxation",
    description: "Goods and Services Tax 15-digit GSTIN allocation for proprietary businesses, firms, LLPs and private companies.",
    recurring: "No",
    frequency: "One Time",
    price: 3500,
    governmentFee: 0,
    processingTime: "3 - 7 Days",
    status: "Active",
    isPopular: true,
    createdAt: "2026-02-01T10:00:00.000Z"
  },
  {
    id: "SRV-007",
    name: "GST Return Filing",
    category: "Taxation",
    description: "Monthly GSTR-1 and GSTR-3B compliance filing, ITC reconciliation and output liability reconciliation.",
    recurring: "Yes",
    frequency: "Monthly",
    price: 750,
    governmentFee: 0,
    processingTime: "1 - 2 Days",
    status: "Active",
    createdAt: "2026-02-05T10:00:00.000Z"
  },
  {
    id: "SRV-008",
    name: "ITR Filing (Individual)",
    category: "Taxation",
    description: "Expert CA assisted Income Tax Return filing for salaried employees, freelancers, and small business proprietors.",
    recurring: "No",
    frequency: "One Time",
    price: 1000,
    governmentFee: 0,
    processingTime: "1 - 2 Days",
    status: "Active",
    createdAt: "2026-02-10T10:00:00.000Z"
  },
  {
    id: "SRV-009",
    name: "Trademark Registration",
    category: "Intellectual Property",
    description: "Comprehensive trademark search, class selection, drafting TM-A form, and instant ™ symbol allocation.",
    recurring: "No",
    frequency: "One Time",
    price: 8000,
    governmentFee: 4500,
    processingTime: "3 - 6 Months",
    status: "Active",
    isPopular: true,
    createdAt: "2026-02-14T10:00:00.000Z"
  },
  {
    id: "SRV-010",
    name: "Shop Act / Trade License",
    category: "Business Compliance",
    description: "Municipal corporation commercial license (Gumasta / Trade License) required for physical shops and establishments.",
    recurring: "No",
    frequency: "One Time",
    price: 1000,
    governmentFee: 0,
    processingTime: "7 - 15 Days",
    status: "Active",
    createdAt: "2026-02-18T10:00:00.000Z"
  },
  {
    id: "SRV-011",
    name: "Import Export (IEC Registration)",
    category: "Import Export",
    description: "10-digit Director General of Foreign Trade (DGFT) Import Export Code required for international commerce.",
    recurring: "No",
    frequency: "One Time",
    price: 3500,
    governmentFee: 0,
    processingTime: "7 - 10 Days",
    status: "Active",
    createdAt: "2026-02-22T10:00:00.000Z"
  },
  {
    id: "SRV-012",
    name: "Digital Signature Certificate (DSC)",
    category: "Digital Services",
    description: "Class 3 DSC with crypto token for MCA filings, GST filings, e-tendering, and statutory director signing.",
    recurring: "No",
    frequency: "One Time",
    price: 1500,
    governmentFee: 0,
    processingTime: "1 - 2 Days",
    status: "Active",
    createdAt: "2026-02-25T10:00:00.000Z"
  },
  {
    id: "SRV-013",
    name: "Zomato Onboarding",
    category: "Business Growth",
    description: "End-to-end cloud kitchen and restaurant catalog creation, bank KYC verification, and live storefront publishing on Zomato.",
    recurring: "No",
    frequency: "One Time",
    price: 1000,
    governmentFee: 0,
    processingTime: "3 - 5 Days",
    status: "Active",
    createdAt: "2026-03-01T10:00:00.000Z"
  },
  {
    id: "SRV-014",
    name: "Swiggy Onboarding",
    category: "Business Growth",
    description: "Menu digitization, geo-fencing delivery radii setup, and fast merchant verification on Swiggy Food.",
    recurring: "No",
    frequency: "One Time",
    price: 1000,
    governmentFee: 0,
    processingTime: "3 - 5 Days",
    status: "Active",
    createdAt: "2026-03-05T10:00:00.000Z"
  },
  {
    id: "SRV-015",
    name: "Zomato/Swiggy Monthly Marketing",
    category: "Business Growth",
    description: "Growth ads optimization, CPC campaign management, discount bundle engineering, and monthly order booster management.",
    recurring: "Yes",
    frequency: "Monthly",
    price: 3500,
    governmentFee: 0,
    processingTime: "Monthly",
    status: "Active",
    createdAt: "2026-03-10T10:00:00.000Z"
  }
];
