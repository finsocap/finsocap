import type { BlogCategory, Blog, NotificationItem, UserProfile } from "@/types";
export type { BlogCategory, Blog, NotificationItem, UserProfile };

// -------------------------------------------------------------
// 1. Initial Mock User
// -------------------------------------------------------------
export const mockCurrentUser: UserProfile = {
  id: "admin-aarav",
  name: "Aarav Jha",
  email: "aarav@finsocap.com",
  role: "ADMIN",
  status: "APPROVED",
  department: "Executive & Leadership",
  phone: "+91 98765 43210",
  image: "/Aaravdp.png",
  createdAt: "2025-01-01T00:00:00.000Z",
  lastActive: "Active Now",
};

// -------------------------------------------------------------
// 2. Initial Blog Categories & Blogs
// -------------------------------------------------------------
export const initialCategories: BlogCategory[] = [
  { id: "cat-1", name: "Direct Tax", slug: "direct-tax" },
  { id: "cat-2", name: "FSSAI & Food Safety", slug: "fssai" },
  { id: "cat-3", name: "GST & Audits", slug: "gst-audits" },
  { id: "cat-4", name: "Corporate Finance", slug: "corporate-finance" },
  { id: "cat-5", name: "Startup Incorporation", slug: "startup-incorporation" },
];

export const initialBlogs: Blog[] = [
  {
    id: "blog-1",
    title: "Union Budget 2026: Comprehensive Direct Tax & Startup Reforms Guide",
    slug: "union-budget-2026-direct-tax-startup-reforms",
    excerpt: "An in-depth analysis of newly announced corporate tax rates, angel tax exemptions, and concessional tax regimes for Indian startups.",
    content: `<p>The Union Budget 2026 introduces key amendments aimed at simplifying compliance for emerging enterprises and tech startups across India.</p><h2>1. Rationalization of Capital Gains</h2><p>The holding period definitions have been unified to establish greater clarity across listed and unlisted securities.</p><h2>2. Angel Tax & ESOP Relief</h2><p>Startups recognized by DPIIT can now avail extended safe harbor provisions under Section 56(2)(viib).</p>`,
    thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-1", name: "Direct Tax", slug: "direct-tax" },
    categoryId: "cat-1",
    seoTitle: "Union Budget 2026 Direct Tax Reforms | Finsocap Guide",
    seoDesc: "Complete breakdown of Union Budget 2026 tax changes for startups, MSMEs, and corporate founders.",
    tags: "Taxation, Budget2026, Startups, IndianEconomy",
    status: "PUBLISHED",
    publishedAt: "2026-02-15T10:00:00.000Z",
    createdAt: "2026-02-14T09:00:00.000Z",
    views: 1420,
    author: { name: "Rahul Verma" },
  },
  {
    id: "blog-2",
    title: "FSSAI Food Safety Compliance Checklist for Cloud Kitchens & D2C Brands",
    slug: "fssai-compliance-checklist-cloud-kitchens-d2c",
    excerpt: "Everything you need to know about FoSCoS registration, mandatory lab test audits, FoSTaC certifications, and packaging labeling rules.",
    content: `<p>With the surge in online food delivery platforms like Zomato and Swiggy, the Food Safety and Standards Authority of India (FSSAI) has tightened oversight.</p><h2>Key FoSCoS Requirements</h2><ul><li>Mandatory display of 14-digit FSSAI number on menus and packaging.</li><li>Half-yearly chemical and microbiological food testing reports.</li><li>Designation of certified Food Safety Supervisors (FoSTaC).</li></ul>`,
    thumbnail: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-2", name: "FSSAI & Food Safety", slug: "fssai" },
    categoryId: "cat-2",
    seoTitle: "FSSAI Compliance Checklist for D2C & Cloud Kitchens | Finsocap",
    seoDesc: "Step-by-step FSSAI license guide, lab testing schedules, and labeling compliance for Indian food ventures.",
    tags: "FSSAI, CloudKitchens, D2C, Compliance",
    status: "PUBLISHED",
    publishedAt: "2026-03-01T12:00:00.000Z",
    createdAt: "2026-02-28T14:30:00.000Z",
    views: 980,
    author: { name: "Sneha Deshmukh" },
  },
  {
    id: "blog-3",
    title: "GSTR-9 & GSTR-9C Annual Filing Guide for FY 2025-26",
    slug: "gstr-9-and-9c-annual-filing-guide-fy-2025-26",
    excerpt: "Avoid heavy late fees and mismatch notices: Master ITC reconciliation, Table 8A discrepancies, and reconciliation statements.",
    content: `<p>Filing the GST Annual Return (GSTR-9) and Reconciliation Statement (GSTR-9C) requires accurate cross-matching between books of accounts and GSTR-2B.</p><h2>Common Pitfalls in Input Tax Credit (ITC)</h2><p>Ensure that ineligible ITC under Section 17(5) is clearly identified and reversed in Table 4(B).</p>`,
    thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-3", name: "GST & Audits", slug: "gst-audits" },
    categoryId: "cat-3",
    seoTitle: "GSTR-9 & GSTR-9C Annual Filing Step-by-Step | Finsocap",
    seoDesc: "Avoid penalties: learn how to reconcile ITC and file GSTR-9 accurately with our expert audit guide.",
    tags: "GST, GSTR9, ITC, Audits",
    status: "PUBLISHED",
    publishedAt: "2026-03-12T09:30:00.000Z",
    createdAt: "2026-03-10T11:00:00.000Z",
    views: 860,
    author: { name: "Vikram Patel" },
  },
  {
    id: "blog-4",
    title: "Optimizing Working Capital Cycles for Fast-Growing Indian MSMEs",
    slug: "optimizing-working-capital-cycles-msmes",
    excerpt: "Practical financial engineering techniques: invoice discounting, TReDS portal leverage, and structured receivable factoring.",
    content: `<p>Cash flow velocity is the lifeblood of manufacturing and distribution businesses. Prolonged debtor recovery cycles can quickly stall growth.</p><h2>Receivable Factoring on TReDS</h2><p>MSMEs can auction approved corporate buyer invoices on TReDS platforms for instant liquidity at competitive interest rates.</p>`,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    category: { id: "cat-4", name: "Corporate Finance", slug: "corporate-finance" },
    categoryId: "cat-4",
    seoTitle: "Working Capital Management Guide for MSMEs | Finsocap",
    seoDesc: "Discover proven strategies to reduce cash conversion cycles and unlock liquidity for your business.",
    tags: "MSME, WorkingCapital, CashFlow, TReDS",
    status: "DRAFT",
    publishedAt: null,
    createdAt: "2026-03-22T15:00:00.000Z",
    views: 45,
    author: { name: "Aarav Jha" },
  },
];

// -------------------------------------------------------------
// 3. Initial Notifications
// -------------------------------------------------------------
export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "blog",
    title: "Blog Published Successfully",
    message: "'Union Budget 2026 Guide' is live and receiving views.",
    time: "1 hour ago",
    isRead: false,
    actionUrl: "/dashboard/blogs",
  },
  {
    id: "notif-2",
    type: "chat",
    title: "New Team Discussion",
    message: "New message in Executive & Leadership channel.",
    time: "3 hours ago",
    isRead: true,
    actionUrl: "/dashboard/chat",
  },
];
