import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { signOutAdmin } from "@/lib/admin/authActions";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/delivery", label: "Delivery" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await requireAdmin();

  if (!user) redirect("/admin/login");

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-lg font-semibold text-neutral-900">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">
          Your account ({user.email}) does not have admin access to this store.
        </p>
        <form action={signOutAdmin} className="mt-6">
          <button className="text-sm underline underline-offset-4">Sign out</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-white p-6 sm:block">
          <p className="text-sm font-bold tracking-tight text-neutral-900">Admin</p>
          <nav className="mt-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAdmin} className="mt-8">
            <button className="px-3 text-sm text-muted hover:text-neutral-900">Sign out</button>
          </form>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 sm:hidden">
            <p className="text-sm font-bold">Admin</p>
            <nav className="flex gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-xs font-medium text-neutral-700">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
