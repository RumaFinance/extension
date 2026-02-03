"use client"

import { ExternalLink, BookOpen, MessageCircle, Shield } from "lucide-react"

const helpLinks = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics of using your wallet",
    href: "#",
  },
  {
    icon: Shield,
    title: "Security Tips",
    description: "Keep your funds safe",
    href: "#",
  },
  {
    icon: MessageCircle,
    title: "Contact Support",
    description: "Get help from our team",
    href: "#",
  },
]

const faqs = [
  {
    question: "How do I send tokens?",
    answer:
      "Tap the Send button on the home screen, enter the recipient address and amount, then confirm the transaction.",
  },
  {
    question: "What is Private Mode?",
    answer:
      "Private mode hides your balances and transaction history, providing additional privacy when using your wallet in public.",
  },
  {
    question: "How do I backup my wallet?",
    answer: 'Go to Settings and select "Export Recovery Phrase". Store this phrase securely offline.',
  },
]

export function HelpTab() {
  return (
    <div className="flex flex-col gap-6 px-4">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Links</h2>
        <div className="flex flex-col gap-2">
          {helpLinks.map(({ icon: Icon, title, description, href }) => (
            <a
              key={title}
              href={href}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">FAQs</h2>
        <div className="flex flex-col gap-3">
          {faqs.map(({ question, answer }) => (
            <div key={question} className="p-3 rounded-xl bg-secondary/50">
              <p className="font-medium mb-1">{question}</p>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
