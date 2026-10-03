import { TaskItem } from "@/types";

export const initialTasks: TaskItem[] = [
  {
    id: "T-1001",
    partnerId: "P-101",
    partnerName: "Rahul Jha",
    partnerContact: "9873207632",
    clientName: "Amit Kumar",
    clientContact: "9876543210",
    nameOfBusiness: "Shri Foods",
    taskCategory: "Compliance",
    serviceName: "FSSAI Registration",
    status: "Pending",
    taskDate: "10 Sep 2026",
    dueDate: "10 Sep 2026",
    overdueDays: 5,
    assignedTo: {
      id: "emp-1",
      name: "Pooja Mehta",
      role: "Compliance Executive",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    comments: [
      {
        id: "c-1",
        userName: "Ankit Sharma",
        userRole: "Admin",
        timestamp: "12 Sep 2026 10:30 AM",
        text: "Documents received. Verification in progress.",
        attachments: [
          {
            id: "ca-1",
            fileName: "FSSAI_Draft_Declaration.pdf",
            fileUrl: "#",
            fileSize: "720 KB"
          }
        ]
      },
      {
        id: "c-2",
        userName: "Rahul Jha",
        userRole: "Franchise Partner",
        timestamp: "11 Sep 2026 04:20 PM",
        text: "Client has shared address proof.",
        attachments: [
          {
            id: "ca-2",
            fileName: "Rent_Agreement_Signed.pdf",
            fileUrl: "#",
            fileSize: "1.1 MB"
          }
        ]
      },
      {
        id: "c-3",
        userName: "Ankit Sharma",
        userRole: "Admin",
        timestamp: "10 Sep 2026 11:15 AM",
        text: "Application draft prepared. Waiting for client confirmation."
      }
    ],
    attachments: [
      {
        id: "att-1",
        fileName: "Address Proof.pdf",
        fileSize: "1.4 MB",
        fileType: "application/pdf",
        uploadDate: "10 Sep 2026",
        uploadedBy: "AS",
        fileUrl: "#"
      },
      {
        id: "att-2",
        fileName: "ID Proof.pdf",
        fileSize: "850 KB",
        fileType: "application/pdf",
        uploadDate: "10 Sep 2026",
        uploadedBy: "RJ",
        fileUrl: "#"
      },
      {
        id: "att-3",
        fileName: "Business Photo.jpg",
        fileSize: "2.1 MB",
        fileType: "image/jpeg",
        uploadDate: "11 Sep 2026",
        uploadedBy: "AS",
        fileUrl: "#"
      }
    ],
    statusHistory: [
      {
        id: "sh-1",
        status: "Pending",
        title: "Task created",
        timestamp: "10 Sep 2026 11:15 AM",
        updatedBy: "Ankit Sharma"
      },
      {
        id: "sh-2",
        status: "In Progress",
        title: "Work started",
        timestamp: "11 Sep 2026 09:30 AM",
        updatedBy: "Pooja Mehta"
      },
      {
        id: "sh-3",
        status: "Sent for Review",
        title: "Submitted for internal review",
        timestamp: "12 Sep 2026 02:45 PM",
        updatedBy: "Pooja Mehta"
      },
      {
        id: "sh-4",
        status: "Pending from Client",
        title: "Waiting for client response",
        timestamp: "14 Sep 2026 10:20 AM",
        updatedBy: "Rahul Jha"
      }
    ],
    certificates: []
  },
  {
    id: "T-1002",
    partnerId: "P-102",
    partnerName: "Kanhaiya",
    partnerContact: "7011340730",
    clientName: "Neha Verma",
    clientContact: "9899989898",
    nameOfBusiness: "Fresh Bites",
    taskCategory: "Taxation",
    serviceName: "GST Registration",
    status: "In Progress",
    taskDate: "12 Sep 2026",
    dueDate: "14 Sep 2026",
    overdueDays: 2,
    assignedTo: {
      id: "emp-2",
      name: "Rohit Jain",
      role: "CA & Tax Lead"
    },
    comments: [
      {
        id: "c-4",
        userName: "Rohit Jain",
        userRole: "CA & Tax Lead",
        timestamp: "13 Sep 2026 03:15 PM",
        text: "ARN generated: AA0709260192834. Aadhar authentication pending."
      }
    ],
    attachments: [
      {
        id: "att-4",
        fileName: "Electricity_Bill_FreshBites.pdf",
        fileSize: "1.1 MB",
        uploadDate: "12 Sep 2026",
        uploadedBy: "Kanhaiya",
        fileUrl: "#"
      }
    ],
    statusHistory: [
      {
        id: "sh-5",
        status: "Pending",
        title: "Application Received from Cyber Cafe",
        timestamp: "12 Sep 2026 10:00 AM"
      },
      {
        id: "sh-6",
        status: "In Progress",
        title: "Assigned to Rohit Jain",
        timestamp: "12 Sep 2026 11:30 AM"
      }
    ],
    certificates: []
  },
  {
    id: "T-1003",
    partnerId: "P-103",
    partnerName: "Gaurav",
    partnerContact: "9312345678",
    clientName: "Rohit Sharma",
    clientContact: "9876123456",
    nameOfBusiness: "Sharma Traders",
    taskCategory: "Licensing",
    serviceName: "Trade License",
    status: "Sent for Review",
    taskDate: "14 Sep 2026",
    dueDate: "16 Sep 2026",
    overdueDays: 1,
    assignedTo: {
      id: "emp-3",
      name: "Neha Verma",
      role: "Legal Executive"
    },
    comments: [],
    attachments: [
      {
        id: "att-5",
        fileName: "Trade_License_Application.pdf",
        fileSize: "1.8 MB",
        uploadDate: "14 Sep 2026",
        uploadedBy: "Gaurav",
        fileUrl: "#"
      }
    ],
    statusHistory: [
      {
        id: "sh-7",
        status: "Sent for Review",
        title: "Under Senior Legal Review",
        timestamp: "15 Sep 2026 01:20 PM"
      }
    ],
    certificates: []
  },
  {
    id: "T-1004",
    partnerId: "P-104",
    partnerName: "Roshan",
    partnerContact: "9998887776",
    clientName: "Pooja Mehta",
    clientContact: "9877001122",
    nameOfBusiness: "Mehta Enterprises",
    taskCategory: "Compliance",
    serviceName: "FSSAI State License",
    status: "Pending from Client",
    taskDate: "16 Sep 2026",
    dueDate: "18 Sep 2026",
    overdueDays: 3,
    comments: [
      {
        id: "c-5",
        userName: "Ankit Sharma",
        userRole: "Admin",
        timestamp: "16 Sep 2026 02:40 PM",
        text: "Need updated NOC from Municipal Board.",
        attachments: [
          {
            id: "ca-3",
            fileName: "NOC_Format_Sample.pdf",
            fileUrl: "#",
            fileSize: "410 KB"
          }
        ]
      }
    ],
    attachments: [],
    statusHistory: [],
    certificates: []
  },
  {
    id: "T-1005",
    partnerId: "P-105",
    partnerName: "Roshni",
    partnerContact: "8887776655",
    clientName: "Vikram Singh",
    clientContact: "9855221133",
    nameOfBusiness: "VS Exports",
    taskCategory: "Import Export",
    serviceName: "IEC Registration",
    status: "Pending from Department",
    taskDate: "18 Sep 2026",
    dueDate: "20 Sep 2026",
    overdueDays: 7,
    comments: [
      {
        id: "c-6",
        userName: "Gaurav Sharma",
        userRole: "Executive",
        timestamp: "19 Sep 2026 11:00 AM",
        text: "DGFT server maintenance. Application pending government clearance."
      }
    ],
    attachments: [
      {
        id: "att-6",
        fileName: "IEC_Challan_Receipt.pdf",
        fileSize: "920 KB",
        uploadDate: "18 Sep 2026",
        uploadedBy: "Roshni",
        fileUrl: "#"
      }
    ],
    statusHistory: [],
    certificates: []
  },
  {
    id: "T-1006",
    partnerId: "P-101",
    partnerName: "Rahul Jha",
    partnerContact: "9873207632",
    clientName: "Priya Sinha",
    clientContact: "9876549876",
    nameOfBusiness: "Priya Cafe",
    taskCategory: "IPR",
    serviceName: "Trademark Registration",
    status: "Completed",
    taskDate: "20 Sep 2026",
    dueDate: "22 Sep 2026",
    comments: [
      {
        id: "c-7",
        userName: "Rohit Jain",
        userRole: "CS & IPR Lead",
        timestamp: "21 Sep 2026 04:30 PM",
        text: "Government trademark certificate successfully issued and verified.",
        attachments: [
          {
            id: "ca-4",
            fileName: "Trademark_Govt_Receipt.pdf",
            fileUrl: "#",
            fileSize: "680 KB"
          }
        ]
      }
    ],
    attachments: [
      {
        id: "att-7",
        fileName: "Logo_Trademark_Artwork.png",
        fileSize: "1.5 MB",
        uploadDate: "20 Sep 2026",
        uploadedBy: "Rahul Jha",
        fileUrl: "#"
      }
    ],
    statusHistory: [
      {
        id: "sh-8",
        status: "Completed",
        title: "Certificate Issued & Delivered",
        timestamp: "21 Sep 2026 05:00 PM",
        updatedBy: "Rohit Jain"
      }
    ],
    certificates: [
      {
        id: "cert-1",
        certificateNumber: "TM-2026-0158",
        certificateName: "Trademark Registration Certificate",
        issuedDate: "20 Sep 2026",
        validTill: "19 Sep 2036",
        fileUrl: "#",
        fileName: "Trademark_Certificate_PriyaCafe.pdf",
        submittedBy: "Rohit Jain (IPR CS)",
        submittedAt: "21 Sep 2026 05:15 PM",
        status: "Active"
      }
    ]
  },
  {
    id: "T-1007",
    partnerId: "P-102",
    partnerName: "Kanhaiya",
    partnerContact: "7011340730",
    clientName: "Sandeep Jain",
    clientContact: "9898001122",
    nameOfBusiness: "Jain Enterprises",
    taskCategory: "Compliance",
    serviceName: "Digital Signature",
    status: "Pending",
    taskDate: "21 Sep 2026",
    dueDate: "23 Sep 2026",
    overdueDays: 4,
    comments: [],
    attachments: [],
    statusHistory: [],
    certificates: []
  },
  {
    id: "T-1008",
    partnerId: "P-103",
    partnerName: "Gaurav",
    partnerContact: "9312345678",
    clientName: "Anjali Verma",
    clientContact: "9871234567",
    nameOfBusiness: "Anjali Foods",
    taskCategory: "Marketing",
    serviceName: "Zomato Onboarding",
    status: "Pending from Client",
    taskDate: "22 Sep 2026",
    dueDate: "24 Sep 2026",
    overdueDays: 2,
    comments: [],
    attachments: [],
    statusHistory: [],
    certificates: []
  }
];
