"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { RoleGate } from "@/lib/use-role";

type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  banned?: boolean | null;
};

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  // Create user form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [creating, setCreating] = useState(false);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await (authClient.admin.listUsers as any)({
        query: {
          limit,
          offset,
          sortBy: "name",
          sortDirection: "asc",
        },
      });
      if (error) throw error;
      setUsers(data?.users ?? []);
      setTotal(data?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset]);

  async function setRole(userId: string, role: "admin" | "user") {
    await authClient.admin.setRole({ userId, role });
    await load();
  }

  async function ban(userId: string) {
    await authClient.admin.banUser({ userId, banReason: "Spamming" });
    await load();
  }

  async function unban(userId: string) {
    await authClient.admin.unbanUser({ userId });
    await load();
  }

  async function createUser() {
    if (!newEmail || !newPassword) return;
    setCreating(true);
    try {
      const { error } = await authClient.admin.createUser({
        email: newEmail,
        password: newPassword,
        name: newName,
        role: newRole,
      });
      if (error) throw error;
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewRole("user");
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function removeUser(userId: string) {
    await authClient.admin.removeUser({ userId });
    await load();
  }

  return (
    <RoleGate allow="ADMIN" fallback={<div>Not authorized</div>}>
      <div style={{ padding: 16 }}>
        <h1>Admin</h1>

        {/* Create User */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 140px 120px", gap: 8, margin: "16px 0" }}>
          <input
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            type="email"
          />
          <input
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
          />
          <input
            placeholder="Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            type="text"
          />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value as "admin" | "user")}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button disabled={creating || !newEmail || !newPassword} onClick={createUser}>
            {creating ? "Creating..." : "Create User"}
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            Page size:&nbsp;
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <button disabled={loading || offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
            Prev
          </button>
          <div>
            Page {page} / {totalPages} (total {total})
          </div>
          <button
            disabled={loading || offset + limit >= total}
            onClick={() => setOffset(Math.min(offset + limit, Math.max(0, total - 1)))}
          >
            Next
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <table cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Email</th>
                <th align="left">Role</th>
                <th align="left">Banned</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                  <td>{u.name ?? "-"}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={(u.role || "").toString().toLowerCase() === "admin" ? "admin" : "user"}
                      onChange={(e) => setRole(u.id, e.target.value as "admin" | "user")}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{u.banned ? "Yes" : "No"}</td>
                  <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!u.banned ? (
                      <button onClick={() => ban(u.id)}>Ban</button>
                    ) : (
                      <button onClick={() => unban(u.id)}>Unban</button>
                    )}
                    <button onClick={() => removeUser(u.id)} style={{ color: "#b00020" }}>Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} align="center">
                    No users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </RoleGate>
  );
}


