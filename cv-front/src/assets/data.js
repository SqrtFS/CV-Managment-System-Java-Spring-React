import { LayoutDashboard, Users, Settings, Briefcase, FileText } from "lucide-react";

export const features = [
  {
    iconName: "Search",
    iconColor: "text-orange-500",
    title: "features.f1_title",
    description: "features.f1_desc"
  },
  {
    iconName: "Sliders",
    iconColor: "text-indigo-500",
    title: "features.f2_title",
    description: "features.f2_desc"
  },
  {
    iconName: "BarChart3",
    iconColor: "text-emerald-500",
    title: "features.f3_title",
    description: "features.f3_desc"
  },
  {
    iconName: "ShieldCheck",
    iconColor: "text-blue-500",
    title: "features.f4_title",
    description: "features.f4_desc"
  }
];

export const positions = [
  {
    title: "positions.pos1_title",
    company: "Google Inc",
    cvs: "145 CVs",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "positions.pos2_title",
    company: "Amazon",
    cvs: "98 CVs",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "positions.pos3_title",
    company: "Apple",
    cvs: "120 CVs",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80"
  }
];

export const steps = [
  {
    iconName: "FileText",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "steps.s1_title",
    description: "steps.s1_desc"
  },
  {
    iconName: "Filter",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-500",
    title: "steps.s2_title",
    description: "steps.s2_desc"
  },
  {
    iconName: "CheckCircle",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
    title: "steps.s3_title",
    description: "steps.s3_desc"
  }
];


export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "Candidates",
    icon: Users,
    path: "/candidates",
  },
  {
    id: "03",
    label: "Attributes",
    icon: Settings,
    path: "/attributes",
  },
  {
    id: "04",
    label: "Positions",
    icon: Briefcase,
    path: "/positions",
  },
  {
    id: "05",
    label: "My CVs",
    icon: FileText,
    path: "/my-cvs",
  },
];