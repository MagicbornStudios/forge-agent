export interface Plan {
  id: string;
  title: string;
  description: string;
  highlight?: boolean;
  type?: "monthly" | "yearly";
  currency?: string;
  monthlyPrice: string;
  yearlyPrice: string;
  buttonText: string;
  badge?: string;
  features: {
    name: string;
    icon: string;
    iconColor?: string;
  }[];
}

export interface CurrentPlan {
  plan: Plan;
  type: "monthly" | "yearly" | "custom";
  price?: string;
  nextBillingDate: string;
  paymentMethod: string;
  status: "active" | "inactive" | "past_due" | "cancelled";
}

export const plans: Plan[] = [
  {
    id: "free",
    title: "Free",
    description: "Everything you need to build interactive narratives locally.",
    currency: "$",
    monthlyPrice: "0",
    yearlyPrice: "0",
    buttonText: "Get started free",
    features: [
      {
        name: "Dialogue Editor (Yarn Spinner)",
        icon: "check",
        iconColor: "text-green-500",
      },
      {
        name: "Character & Video editors",
        icon: "check",
        iconColor: "text-blue-500",
      },
      {
        name: "AI Copilot (limited usage)",
        icon: "check",
        iconColor: "text-purple-500",
      },
      {
        name: "Local-first persistence",
        icon: "check",
        iconColor: "text-teal-500",
      },
      {
        name: "Export to .yarn files",
        icon: "check",
        iconColor: "text-orange-500",
      },
      {
        name: "Community support",
        icon: "check",
        iconColor: "text-zinc-500",
      },
    ],
  },
  {
    id: "pro",
    title: "Pro",
    description: "For teams shipping interactive narratives to production.",
    currency: "$",
    monthlyPrice: "29",
    yearlyPrice: "290",
    buttonText: "Start free trial",
    badge: "Most popular",
    highlight: true,
    features: [
      {
        name: "Everything in Free",
        icon: "check",
        iconColor: "text-green-500",
      },
      {
        name: "Unlimited AI Copilot usage",
        icon: "check",
        iconColor: "text-purple-500",
      },
      {
        name: "Cloud sync & collaboration",
        icon: "check",
        iconColor: "text-blue-500",
      },
      {
        name: "Strategy Editor access",
        icon: "check",
        iconColor: "text-teal-500",
      },
      {
        name: "Voice generation (ElevenLabs)",
        icon: "check",
        iconColor: "text-orange-500",
      },
      {
        name: "Priority support",
        icon: "check",
        iconColor: "text-indigo-500",
      },
      {
        name: "Dev Kit access",
        icon: "check",
        iconColor: "text-cyan-500",
      },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    description: "For studios and organizations with custom requirements.",
    currency: "$",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    buttonText: "Contact sales",
    features: [
      {
        name: "Everything in Pro",
        icon: "check",
        iconColor: "text-green-500",
      },
      {
        name: "SSO & advanced security",
        icon: "check",
        iconColor: "text-blue-500",
      },
      {
        name: "Custom model routing",
        icon: "check",
        iconColor: "text-purple-500",
      },
      {
        name: "Dedicated support engineer",
        icon: "check",
        iconColor: "text-orange-500",
      },
      {
        name: "SLA & uptime guarantees",
        icon: "check",
        iconColor: "text-teal-500",
      },
      {
        name: "Custom integrations",
        icon: "check",
        iconColor: "text-indigo-500",
      },
      {
        name: "Unity/Unreal export packages",
        icon: "check",
        iconColor: "text-cyan-500",
      },
    ],
  },
];
