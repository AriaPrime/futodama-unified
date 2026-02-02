import type { Consultant } from "@/types";

export const consultants: Consultant[] = [
  {
    id: "1",
    name: "Anders Mikkelsen",
    email: "anders.mikkelsen@example.dk",
    phone: "+45 22 34 56 78",
    title: "Senior Full-Stack Developer",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    employmentType: "employee",
    availability: { status: "available", date: "2025-02-01" },
    hourlyRate: 1200,
    location: "København",
    cvHealthScore: 92,
    lastCVUpdate: "2025-01-15",
    cv: {
      professionalProfile: "Erfaren full-stack udvikler med 10+ års erfaring i moderne web-teknologier. Specialiseret i React, Node.js og cloud-arkitektur.",
      personalProfile: "Passioneret om clean code og best practices. Nyder at mentore junior udviklere.",
      experience: [
        { id: "exp1", company: "Novo Nordisk", project: "Patient Portal", role: "Lead Developer", startDate: "2022-01", endDate: "2024-12", description: "Ledet udviklingen af ny patient-portal med React og Azure." },
        { id: "exp2", company: "Danske Bank", project: "Trading Platform", role: "Senior Developer", startDate: "2019-06", endDate: "2021-12", description: "Udviklede real-time trading dashboard." }
      ],
      education: [{ id: "edu1", institution: "Danmarks Tekniske Universitet", degree: "Master", field: "Software Engineering", startYear: 2012, endYear: 2014 }],
      courses: [{ id: "c1", name: "AWS Solutions Architect", institution: "Amazon", year: 2023, certificate: true }],
      skills: [
        { id: "s1", name: "React", category: "Frontend", level: "expert" },
        { id: "s2", name: "TypeScript", category: "Languages", level: "expert" },
        { id: "s3", name: "Node.js", category: "Backend", level: "expert" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "2",
    name: "Sofie Andersen",
    email: "sofie.andersen@example.dk",
    phone: "+45 23 45 67 89",
    title: "UX/UI Designer & Frontend Developer",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    employmentType: "employee",
    availability: { status: "partially_available", date: "2025-03-01" },
    hourlyRate: 1100,
    location: "Aarhus",
    cvHealthScore: 88,
    lastCVUpdate: "2025-01-10",
    cv: {
      professionalProfile: "Kreativ UX/UI designer med stærk frontend ekspertise. 8 års erfaring med brugercentreret design.",
      personalProfile: "Brænder for at skabe intuitive brugeroplevelser.",
      experience: [
        { id: "exp1", company: "LEGO", project: "Design System", role: "Lead UX Designer", startDate: "2021-06", endDate: "2024-12", description: "Ledet udviklingen af LEGOs nye design system." }
      ],
      education: [{ id: "edu1", institution: "IT-Universitetet", degree: "Master", field: "Digital Design", startYear: 2014, endYear: 2016 }],
      courses: [{ id: "c1", name: "Google UX Design", institution: "Google", year: 2023, certificate: true }],
      skills: [
        { id: "s1", name: "Figma", category: "Design", level: "expert" },
        { id: "s2", name: "React", category: "Frontend", level: "very_experienced" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "3",
    name: "Lars Nielsen",
    email: "lars.nielsen@freelance.dk",
    phone: "+45 24 56 78 90",
    title: "Cloud Architect & DevOps Specialist",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    employmentType: "freelance",
    availability: { status: "available", date: "2025-01-20" },
    hourlyRate: 1400,
    location: "København",
    cvHealthScore: 95,
    lastCVUpdate: "2025-01-18",
    cv: {
      professionalProfile: "Cloud architect med 12 års erfaring i enterprise IT-infrastruktur. Ekspert i AWS, Azure og GCP.",
      personalProfile: "Dedikeret til at hjælpe virksomheder med deres cloud journey.",
      experience: [
        { id: "exp1", company: "Vestas", project: "Cloud Migration", role: "Principal Cloud Architect", startDate: "2022-03", endDate: "2024-11", description: "Ledet migration af 500+ applikationer til multi-cloud." }
      ],
      education: [{ id: "edu1", institution: "Aalborg Universitet", degree: "Master", field: "Network & Security", startYear: 2010, endYear: 2012 }],
      courses: [
        { id: "c1", name: "AWS Solutions Architect Professional", institution: "Amazon", year: 2024, certificate: true },
        { id: "c2", name: "CKA", institution: "CNCF", year: 2023, certificate: true }
      ],
      skills: [
        { id: "s1", name: "AWS", category: "Cloud", level: "expert" },
        { id: "s2", name: "Azure", category: "Cloud", level: "expert" },
        { id: "s3", name: "Kubernetes", category: "Container", level: "expert" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "4",
    name: "Maria Jensen",
    email: "maria.jensen@example.dk",
    phone: "+45 25 67 89 01",
    title: "Data Scientist & ML Engineer",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    employmentType: "employee",
    availability: { status: "unavailable" },
    hourlyRate: 1300,
    location: "København",
    cvHealthScore: 78,
    lastCVUpdate: "2024-11-20",
    cv: {
      professionalProfile: "Data scientist med PhD i machine learning og 7 års industrierfaring.",
      personalProfile: "Fascineret af AI's potentiale til at løse komplekse problemer.",
      experience: [
        { id: "exp1", company: "Novozymes", project: "Protein Prediction", role: "Lead Data Scientist", startDate: "2021-01", endDate: "2024-12", description: "Udviklede deep learning modeller til protein prediction." }
      ],
      education: [{ id: "edu1", institution: "DTU", degree: "PhD", field: "Machine Learning", startYear: 2015, endYear: 2018 }],
      courses: [{ id: "c1", name: "Deep Learning Specialization", institution: "DeepLearning.AI", year: 2023, certificate: true }],
      skills: [
        { id: "s1", name: "Python", category: "Languages", level: "expert" },
        { id: "s2", name: "TensorFlow", category: "ML", level: "expert" },
        { id: "s3", name: "PyTorch", category: "ML", level: "expert" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "5",
    name: "Peter Sørensen",
    email: "peter.sorensen@freelance.dk",
    phone: "+45 26 78 90 12",
    title: "Agile Coach & Scrum Master",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    employmentType: "freelance",
    availability: { status: "available", date: "2025-02-15" },
    hourlyRate: 1250,
    location: "Odense",
    cvHealthScore: 85,
    lastCVUpdate: "2025-01-05",
    cv: {
      professionalProfile: "Certificeret Agile Coach med 15 års erfaring i software udvikling og transformation.",
      personalProfile: "Brænder for at udvikle high-performing teams.",
      experience: [
        { id: "exp1", company: "Netcompany", project: "Enterprise Transformation", role: "Principal Agile Coach", startDate: "2020-01", endDate: "2024-12", description: "Ledet agil transformation for 500+ medarbejdere." }
      ],
      education: [{ id: "edu1", institution: "SDU", degree: "Bachelor", field: "Software Engineering", startYear: 2006, endYear: 2009 }],
      courses: [{ id: "c1", name: "SAFe SPC", institution: "Scaled Agile", year: 2023, certificate: true }],
      skills: [
        { id: "s1", name: "Scrum", category: "Agile", level: "expert" },
        { id: "s2", name: "SAFe", category: "Agile", level: "expert" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "6",
    name: "Camilla Thomsen",
    email: "camilla.thomsen@example.dk",
    phone: "+45 27 89 01 23",
    title: "Backend Developer & System Architect",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    employmentType: "employee",
    availability: { status: "partially_available", date: "2025-04-01" },
    hourlyRate: 1150,
    location: "København",
    cvHealthScore: 72,
    lastCVUpdate: "2024-10-15",
    cv: {
      professionalProfile: "Backend developer med stærk erfaring i distribuerede systemer.",
      personalProfile: "Teknisk nysgerrig og elsker at dykke ned i komplekse problemer.",
      experience: [
        { id: "exp1", company: "SimCorp", project: "Trading Engine", role: "Principal Engineer", startDate: "2020-06", endDate: "2024-12", description: "Arkitekt på high-frequency trading engine." }
      ],
      education: [{ id: "edu1", institution: "DTU", degree: "Master", field: "Computer Science", startYear: 2012, endYear: 2014 }],
      courses: [],
      skills: [
        { id: "s1", name: "Java", category: "Languages", level: "expert" },
        { id: "s2", name: "Kafka", category: "Messaging", level: "expert" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "7",
    name: "Mikkel Hansen",
    email: "mikkel.hansen@freelance.dk",
    phone: "+45 28 90 12 34",
    title: "Mobile Developer (iOS/Android)",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    employmentType: "freelance",
    availability: { status: "available", date: "2025-01-25" },
    hourlyRate: 1200,
    location: "Aarhus",
    cvHealthScore: 90,
    lastCVUpdate: "2025-01-12",
    cv: {
      professionalProfile: "Mobile developer med 8 års erfaring i iOS og Android development.",
      personalProfile: "Passioneret om mobile UX og performance optimization.",
      experience: [
        { id: "exp1", company: "MobilePay", project: "Payment App", role: "Lead Mobile Developer", startDate: "2021-01", endDate: "2024-10", description: "Ledet udviklingen af MobilePay's business app." }
      ],
      education: [{ id: "edu1", institution: "Aarhus Universitet", degree: "Bachelor", field: "Datalogi", startYear: 2013, endYear: 2016 }],
      courses: [{ id: "c1", name: "iOS Development with Swift", institution: "Apple", year: 2023, certificate: true }],
      skills: [
        { id: "s1", name: "Swift", category: "Mobile", level: "expert" },
        { id: "s2", name: "React Native", category: "Mobile", level: "expert" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "8",
    name: "Louise Christensen",
    email: "louise.christensen@example.dk",
    phone: "+45 29 01 23 45",
    title: "Security Consultant & Pentester",
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    employmentType: "employee",
    availability: { status: "available", date: "2025-02-01" },
    hourlyRate: 1350,
    location: "København",
    cvHealthScore: 82,
    lastCVUpdate: "2024-12-20",
    cv: {
      professionalProfile: "Cybersecurity specialist med 6 års erfaring i penetration testing.",
      personalProfile: "Dedikeret til at gøre internettet sikrere.",
      experience: [
        { id: "exp1", company: "Deloitte", project: "Security Assessment", role: "Senior Security Consultant", startDate: "2021-06", endDate: "2024-12", description: "Udførte penetration tests for Fortune 500." }
      ],
      education: [{ id: "edu1", institution: "ITU", degree: "Master", field: "IT Sikkerhed", startYear: 2017, endYear: 2019 }],
      courses: [{ id: "c1", name: "OSCP", institution: "Offensive Security", year: 2023, certificate: true }],
      skills: [
        { id: "s1", name: "Penetration Testing", category: "Security", level: "expert" },
        { id: "s2", name: "Cloud Security", category: "Security", level: "expert" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "9",
    name: "Thomas Larsen",
    email: "thomas.larsen@freelance.dk",
    phone: "+45 30 12 34 56",
    title: "Project Manager & Business Analyst",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    employmentType: "freelance",
    availability: { status: "available", date: "2025-01-15" },
    hourlyRate: 1100,
    location: "Aalborg",
    cvHealthScore: 68,
    lastCVUpdate: "2024-09-30",
    cv: {
      professionalProfile: "Erfaren projektleder med 12 års erfaring i IT og digitalisering.",
      personalProfile: "Resultatfokuseret med stærke kommunikationsevner.",
      experience: [
        { id: "exp1", company: "Nordea", project: "Core Banking", role: "Senior Project Manager", startDate: "2020-01", endDate: "2024-06", description: "Projektleder for core banking modernisering." }
      ],
      education: [{ id: "edu1", institution: "CBS", degree: "MBA", field: "Business Administration", startYear: 2014, endYear: 2016 }],
      courses: [{ id: "c1", name: "PMP", institution: "PMI", year: 2020, certificate: true }],
      skills: [
        { id: "s1", name: "Project Management", category: "Management", level: "expert" },
        { id: "s2", name: "Business Analysis", category: "Management", level: "expert" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  },
  {
    id: "10",
    name: "Emma Kristensen",
    email: "emma.kristensen@example.dk",
    phone: "+45 31 23 45 67",
    title: "QA Engineer & Test Automation",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    employmentType: "employee",
    availability: { status: "available", date: "2025-02-01" },
    hourlyRate: 950,
    location: "København",
    cvHealthScore: 88,
    lastCVUpdate: "2025-01-08",
    cv: {
      professionalProfile: "QA engineer med 5 års erfaring i test automation og kvalitetssikring.",
      personalProfile: "Kvalitetsbevidst med øje for detaljer.",
      experience: [
        { id: "exp1", company: "Zendesk", project: "Support Platform", role: "Senior QA Engineer", startDate: "2021-03", endDate: "2024-12", description: "Byggede end-to-end test automation framework." }
      ],
      education: [{ id: "edu1", institution: "KEA", degree: "Bachelor", field: "Softwareudvikling", startYear: 2016, endYear: 2019 }],
      courses: [{ id: "c1", name: "ISTQB Advanced", institution: "ISTQB", year: 2023, certificate: true }],
      skills: [
        { id: "s1", name: "Cypress", category: "Testing", level: "expert" },
        { id: "s2", name: "Selenium", category: "Testing", level: "very_experienced" }
      ],
      languages: [{ id: "l1", language: "Dansk", level: "native" }, { id: "l2", language: "Engelsk", level: "fluent" }]
    }
  }
];

export function getConsultantById(id: string): Consultant | undefined {
  return consultants.find(c => c.id === id);
}

export function getConsultantsByAvailability(status: Consultant["availability"]["status"]): Consultant[] {
  return consultants.filter(c => c.availability.status === status);
}

export function searchConsultants(query: string): Consultant[] {
  const lowerQuery = query.toLowerCase();
  return consultants.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.title.toLowerCase().includes(lowerQuery) ||
    c.cv.skills.some(s => s.name.toLowerCase().includes(lowerQuery))
  );
}
