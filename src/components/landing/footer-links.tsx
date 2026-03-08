import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

interface FooterLinksProps {
  sections?: FooterSection[];
  className?: string;
}

const defaultSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "About", href: "/docs#about" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help", href: "/docs#help" },
      { label: "Contact", href: "/docs#contact" },
      { label: "FAQ", href: "/docs#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export function FooterLinks({ sections = [], className }: FooterLinksProps) {
  const items = Array.isArray(sections) && sections.length > 0 ? sections : defaultSections;

  return (
    <footer
      className={cn(
        "border-t border-white/[0.03] bg-secondary/50 py-12 sm:py-16",
        className
      )}
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="text-xl font-semibold text-foreground hover:text-foreground/90"
            >
              LifeOps
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Multi-agent AI operating system for projects, content, finance,
              and health.
            </p>
          </div>
          {items.map((section) => (
            <div key={section?.title ?? ""}>
              <h3 className="text-sm font-semibold text-foreground">
                {section?.title ?? ""}
              </h3>
              <ul className="mt-4 space-y-3">
                {(section?.links ?? []).map((link) => (
                  <li key={link?.label ?? link?.href}>
                    <Link
                      to={link?.href ?? "#"}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link?.label ?? ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.03]">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} LifeOps. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
