
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
  Settings,
  ArrowLeft,
  Package,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ROLES, type Role } from "@/lib/role";

// 2. Define User interface
type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  banned?: boolean | null;
  createdAt?: Date;
};

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>(ROLES.SALES_EXECUTIVE);
  const [creating, setCreating] = useState(false);
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit,
          offset,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });
      if (error) throw error;
      setUsers(data?.users ?? []);
      setTotal(data?.total ?? 0);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset]);

  async function setRole(userId: string, role: Role) {
    try {
      // Type casting 'role' to 'any' avoids TS errors if client types aren't updated yet
      const { error } = await authClient.admin.setRole({ userId, role: role as any });
      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success(`Role updated to ${role}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update user role");
      load();
    }
  }

  async function ban(userId: string) {
    setBanningUserId(userId);
    try {
      const { error } = await authClient.admin.banUser({ userId, banReason: "Admin Action" });
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, banned: true } : u));
      toast.success(`User banned`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to ban user");
    } finally {
      setBanningUserId(null);
    }
  }

  async function unban(userId: string) {
    setBanningUserId(userId);
    try {
      const { error } = await authClient.admin.unbanUser({ userId });
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, banned: false } : u));
      toast.success(`User unbanned`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to unban user");
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
      setNewRole(ROLES.SALES_EXECUTIVE);

      await load();
      toast.success(`User created successfully`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function removeUser(userId: string) {
    if (!confirm(`Permanently delete this user?`)) return;

    try {
      const { error } = await authClient.admin.removeUser({ userId });
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
      setTotal(t => t - 1);
      toast.success(`User deleted`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete user");
    }
  }

  return (
    <RoleGate allow="admin" fallback={<div className="p-10 text-center">You are not authorized to view this page.</div>}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users and permissions</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Total Users" value={total} icon={Users} color="text-blue-500" bg="bg-blue-500/10" />
            <StatsCard
              title="Admins"
              value={users.filter(u => u.role === "admin").length}
              icon={ShieldCheck}
              color="text-purple-500"
              bg="bg-purple-500/10"
            />
            <StatsCard
              title="Banned"
              value={users.filter(u => u.banned).length}
              icon={Ban}
              color="text-red-500"
              bg="bg-red-500/10"
            />
          </div>

          {/* Create User Form */}
          <div className="bg-card rounded-xl p-6 shadow-sm border mb-8">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Create New User</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={newEmail}
                  // 3. FIXED: Added explicit event type
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  // 3. FIXED: Added explicit event type
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newName}
                  // 3. FIXED: Added explicit event type
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                  placeholder="Full Name"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                    <SelectItem value={ROLES.INVENTORY_MANAGER}>Inventory Manager</SelectItem>
                    <SelectItem value={ROLES.SALES_EXECUTIVE}>Sales Executive</SelectItem>

                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={createUser} disabled={creating || !newEmail || !newPassword} className="w-full md:w-auto">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Create User
            </Button>
          </div>

          {/* Users Table */}
          <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-medium">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/50 transition-colors">

                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {(u.name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{u.name || "No Name"}</div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role Selection */}
                        <td className="px-6 py-4">
                          <Select
                            value={u.role || ROLES.SALES_EXECUTIVE}
                            onValueChange={(val) => setRole(u.id, val as Role)}
                          >
                            <SelectTrigger className="w-[180px] h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl shadow-lg">
                              <SelectItem value={ROLES.ADMIN}>
                                <div className="flex items-center gap-2 text-red-600">
                                  <Shield className="w-3 h-3" /> <span>Admin</span>
                                </div>
                              </SelectItem>
                              <SelectItem value={ROLES.INVENTORY_MANAGER}>
                                <div className="flex items-center gap-2 text-blue-600">
                                  <Package className="w-3 h-3" /> <span>Inventory Manager</span>
                                </div>
                              </SelectItem>
                              <SelectItem value={ROLES.SALES_EXECUTIVE}>
                                <div className="flex items-center gap-2 text-green-600">
                                  <Briefcase className="w-3 h-3" /> <span>Sales Executive</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {u.banned ? (
                            <Badge variant="destructive" className="gap-1"><Ban className="w-3 h-3" /> Banned</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 gap-1"><Unlock className="w-3 h-3" /> Active</Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.banned ? (
                              <Button size="sm" variant="outline" onClick={() => unban(u.id)} disabled={banningUserId === u.id}>
                                <Unlock className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="text-orange-500 hover:text-orange-600 hover:bg-orange-50" onClick={() => ban(u.id)} disabled={banningUserId === u.id}>
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeUser(u.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(o => o + limit)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </RoleGate>
  );
}

// 4. FIXED: Explicit Props Interface for Helper Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function StatsCard({ title, value, icon: Icon, color, bg }: StatsCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}