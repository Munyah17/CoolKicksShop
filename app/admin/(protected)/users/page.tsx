import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/admin";
import { listAdminUsers, updateAdminRole, removeAdminAccess } from "@/lib/admin/userActions";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";

export default async function AdminUsersPage() {
  const { user, isSuperAdmin } = await requireSuperAdmin();
  if (!user) redirect("/admin/login");

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">Only super admins can manage other admin accounts.</p>
      </div>
    );
  }

  const admins = await listAdminUsers();

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Users</h1>
      <p className="mt-1 text-sm text-muted">
        Manage who has admin access to this store. Super admins can create and remove other admin
        accounts; regular admins handle day-to-day operations only.
      </p>

      <div className="mt-6 overflow-x-auto border border-border bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isSelf = admin.id === user.id;
              return (
                <tr key={admin.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {admin.email}
                    {isSelf && <span className="ml-2 text-xs text-muted">(you)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        admin.role === "super_admin" ? "bg-indigo-100 text-indigo-800" : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {admin.lastSignInAt ? new Date(admin.lastSignInAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-xs text-muted">—</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <form
                          action={async (formData: FormData) => {
                            "use server";
                            const role = formData.get("role");
                            await updateAdminRole(admin.id, role === "super_admin" ? "super_admin" : "admin");
                          }}
                          className="flex items-center gap-2"
                        >
                          <select name="role" defaultValue={admin.role ?? "admin"} className="input py-1 text-xs">
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                          <button type="submit" className="text-xs text-neutral-700 hover:text-neutral-900 hover:underline">
                            Save
                          </button>
                        </form>
                        <form action={removeAdminAccess.bind(null, admin.id)}>
                          <button type="submit" className="text-xs text-muted hover:text-red-600">
                            Remove access
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">
                  No admin accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Add Admin</h2>
        <CreateAdminForm />
      </div>
    </div>
  );
}
