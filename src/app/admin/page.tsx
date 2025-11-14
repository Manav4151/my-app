"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { RoleGate } from "@/lib/use-role";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Ban,
  Unlock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  User,
  Settings,
  ArrowLeft,
  Home,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

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
    try {
      const { error } = await authClient.admin.setRole({ userId, role });
      if (error) throw error;
      await load();
      toast.success(`User role updated to ${role}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update user role");
    }
  }

  async function ban(userId: string) {
    const user = users.find((u) => u.id === userId);
    const userName = user?.name || user?.email || "User";
    
    setBanningUserId(userId);
    try {
      const { error } = await authClient.admin.banUser({ userId, banReason: "Spamming" });
      if (error) throw error;
      await load();
      toast.success(`${userName} has been banned`);
    } catch (error: any) {
      toast.error(error?.message || `Failed to ban ${userName}`);
    } finally {
      setBanningUserId(null);
    }
  }

  async function unban(userId: string) {
    const user = users.find((u) => u.id === userId);
    const userName = user?.name || user?.email || "User";
    
    setBanningUserId(userId);
    try {
      const { error } = await authClient.admin.unbanUser({ userId });
      if (error) throw error;
      await load();
      toast.success(`${userName} has been unbanned`);
    } catch (error: any) {
      toast.error(error?.message || `Failed to unban ${userName}`);
    } finally {
      setBanningUserId(null);
    }
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
      toast.success(`User ${newEmail} created successfully`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function removeUser(userId: string) {
    const user = users.find((u) => u.id === userId);
    const userName = user?.name || user?.email || "User";
    
    if (!confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await authClient.admin.removeUser({ userId });
      if (error) throw error;
      await load();
      toast.success(`${userName} has been deleted`);
    } catch (error: any) {
      toast.error(error?.message || `Failed to delete ${userName}`);
    }
  }

  return (
    <RoleGate allow="ADMIN" fallback={<div>Not authorized</div>}>
      <div className="min-h-screen bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-md">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
                  <p className="text-[var(--text-secondary)]">Manage users and system settings</p>
                </div>
              </div>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to App</span>
                  <Home className="w-4 h-4 sm:hidden" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[var(--surface)] rounded-xl p-6 shadow-md border border-[var(--border)] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{total}</p>
                </div>
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </div>
            <div className="bg-[var(--surface)] rounded-xl p-6 shadow-md border border-[var(--border)] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Admins</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {users.filter((u) => (u.role || "").toString().toLowerCase() === "admin").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </div>
            <div className="bg-[var(--surface)] rounded-xl p-6 shadow-md border border-[var(--border)] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Banned Users</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {users.filter((u) => u.banned).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--error)]/10 rounded-lg flex items-center justify-center">
                  <Ban className="w-6 h-6 text-[var(--error)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Create User Card */}
          <div className="bg-[var(--surface)] rounded-xl p-6 shadow-md border border-[var(--border)] mb-8">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Create New User</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  name="new-user-email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  type="email"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-password">Password</Label>
                <Input
                  id="new-user-password"
                  name="new-user-password"
                  placeholder="Enter password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Name (Optional)</Label>
                <Input
                  id="new-user-name"
                  name="new-user-name"
                  placeholder="Full name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  type="text"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as "admin" | "user")}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        User
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={createUser}
              disabled={creating || !newEmail || !newPassword}
              className="w-full md:w-auto bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>

          {/* Users Table Card */}
          <div className="bg-[var(--surface)] rounded-xl shadow-md border border-[var(--border)] overflow-hidden">
            {/* Table Controls */}
            <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-hover)]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="page-size" className="text-sm font-medium text-[var(--text-primary)]">
                    Page size:
                  </Label>
                  <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                    <SelectTrigger id="page-size" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-[var(--text-primary)]">
                    Page <span className="font-semibold text-[var(--text-primary)]">{page}</span> of{" "}
                    <span className="font-semibold text-[var(--text-primary)]">{totalPages}</span> (
                    <span className="font-semibold text-[var(--text-primary)]">{total}</span> total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading || offset === 0}
                      onClick={() => setOffset(Math.max(0, offset - limit))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading || offset + limit >= total}
                      onClick={() => setOffset(Math.min(offset + limit, Math.max(0, total - 1)))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--surface-hover)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-medium shadow-sm">
                              {(u.name || u.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                              {u.name ?? "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Mail className="w-4 h-4 text-[var(--primary)]" />
                            {u.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select
                            value={(u.role || "").toString().toLowerCase() === "admin" ? "admin" : "user"}
                            onValueChange={(value) => setRole(u.id, value as "admin" | "user")}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  User
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.banned ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <Ban className="w-3 h-3" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10">
                              <Unlock className="w-3 h-3" />
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {!u.banned ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => ban(u.id)}
                                disabled={banningUserId === u.id}
                                className="text-[var(--warning)] hover:text-[var(--warning)] hover:bg-[var(--warning)]/10 border-[var(--warning)]/30"
                              >
                                {banningUserId === u.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Banning...
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-4 h-4 mr-1" />
                                    Ban
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unban(u.id)}
                                disabled={banningUserId === u.id}
                                className="text-[var(--success)] hover:text-[var(--success)] hover:bg-[var(--success)]/10 border-[var(--success)]/30"
                              >
                                {banningUserId === u.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Unbanning...
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-4 h-4 mr-1" />
                                    Unban
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeUser(u.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="w-12 h-12 text-[var(--text-secondary)]" />
                            <p className="text-[var(--text-secondary)]">No users found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGate>
  );
}


