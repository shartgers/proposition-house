import Link from "next/link";

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

type SiteFooterProps = {
  brandName?: string;
  tagline?: string;
  columns?: FooterColumn[];
};

const defaultColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Styleguide", href: "/styleguide" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function SiteFooter({
  brandName = "Your App",
  tagline = "Calm, minimal, premium — built with the Soft Focus design system.",
  columns = defaultColumns,
}: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-heading font-bold text-foreground">
              {brandName}
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">{tagline}</p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
