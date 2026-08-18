import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext,
} from "@/components/ui/pagination";
import { apiGet, apiPost } from "@/lib/api";
import type { User } from "@/lib/api";

interface AdminUser extends User {
  listing_count?: number;
  report_count?: number;
}

const roleFilters = ["All", "Provider", "Seller", "Admin"] as const;

function mapAdminUser(data: any): AdminUser {
  return {
    id: data.id,
    full_name: data.fullName,
    email: data.email ?? "",
    phone: "",
    bio: data.bio ?? null,
    profile_photo_url: data.profilePhotoUrl ?? null,
    campus_location_id: data.campusLocation?.id ?? null,
    campus_location_name: data.campusLocation?.name ?? null,
    is_provider: data.isProvider ?? false,
    is_seller: data.isSeller ?? false,
    is_admin: data.isAdmin ?? false,
    is_verified: data.isVerified ?? false,
    is_active: data.isActive ?? true,
    is_suspended: data.isSuspended ?? false,
    avg_rating: data.avgRating ?? null,
    rating_count: data.ratingCount ?? 0,
    created_at: data.createdAt ?? "",
    listing_count: 0,
    report_count: 0,
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [suspendUser, setSuspendUser] = useState<AdminUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [reactivateUser, setReactivateUser] = useState<AdminUser | null>(null);
  const [verifyUser, setVerifyUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    apiGet<any>(`/admin/users?page=${page}&pageSize=20`)
      .then((data) => {
        setUsers((data.content ?? []).map(mapAdminUser));
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => {});
  }, [page]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole =
        roleFilter === "All" ||
        (roleFilter === "Provider" && u.is_provider) ||
        (roleFilter === "Seller" && u.is_seller) ||
        (roleFilter === "Admin" && u.is_admin);
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter, users]);

  function getRoles(user: AdminUser) {
    const roles: { label: string; className: string }[] = [];
    if (user.is_admin) roles.push({ label: "Admin", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800" });
    if (user.is_provider) roles.push({ label: "Provider", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800" });
    if (user.is_seller) roles.push({ label: "Seller", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800" });
    if (!user.is_provider && !user.is_seller && !user.is_admin) {
      roles.push({ label: "Seeker", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700" });
    }
    return roles;
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getStatus(user: AdminUser) {
    if (user.is_suspended) return { label: "Suspended", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" };
    if (user.is_active) return { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" };
    return { label: "Inactive", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  }

  async function handleSuspend() {
    if (!suspendUser) return;
    try {
      await apiPost(`/admin/users/${suspendUser.id}/suspend`, { reason: suspendReason || "No reason provided" });
      setUsers((prev) => prev.map((u) => u.id === suspendUser.id ? { ...u, is_suspended: true } : u));
      toast.success(`${suspendUser.full_name} has been suspended`);
    } catch {
      toast.error("Failed to suspend user");
    }
    setSuspendUser(null);
    setSuspendReason("");
  }

  async function handleReactivate() {
    if (!reactivateUser) return;
    try {
      await apiPost(`/admin/users/${reactivateUser.id}/reactivate`, {});
      setUsers((prev) => prev.map((u) => u.id === reactivateUser.id ? { ...u, is_suspended: false } : u));
      toast.success(`${reactivateUser.full_name} has been reactivated`);
    } catch {
      toast.error("Failed to reactivate user");
    }
    setReactivateUser(null);
  }

  async function handleVerify() {
    if (!verifyUser) return;
    try {
      await apiPost(`/admin/users/${verifyUser.id}/verify`, {});
      setUsers((prev) => prev.map((u) => u.id === verifyUser.id ? { ...u, is_verified: true } : u));
      toast.success(`${verifyUser.full_name} has been verified`);
    } catch {
      toast.error("Failed to verify user");
    }
    setVerifyUser(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all platform users, roles, and account status
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {roleFilters.map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role)}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filtered.length} user{filtered.length !== 1 && "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-center">Listings</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Reports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filtered.map((user) => {
                  const status = getStatus(user);
                  const roles = getRoles(user);
                  return (
                    <motion.tr
                      key={user.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile_photo_url ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{user.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {roles.map((role) => (
                            <Badge key={role.label} className={role.className}>
                              {role.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-center text-sm">{user.listing_count ?? "-"}</TableCell>
                      <TableCell className="hidden sm:table-cell text-center text-sm">{user.report_count ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!user.is_admin && (
                            <>
                              {!user.is_suspended ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive h-8 px-2"
                                  onClick={() => { setSuspendUser(user); setSuspendReason(""); }}
                                >
                                  <ShieldAlert className="h-3.5 w-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">Suspend</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 h-8 px-2"
                                  onClick={() => setReactivateUser(user)}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">Reactivate</span>
                                </Button>
                              )}
                              {!user.is_verified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => setVerifyUser(user)}
                                >
                                  <UserCheck className="h-3.5 w-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">Verify</span>
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); if (page > 0) setPage(page - 1); }}
            />
          </PaginationItem>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                isActive={page === i}
                onClick={(e) => { e.preventDefault(); setPage(i); }}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); if (page < totalPages - 1) setPage(page + 1); }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Dialog open={!!suspendUser} onOpenChange={(open) => { if (!open) setSuspendUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{suspendUser?.full_name}</strong>?
              They will not be able to use the platform while suspended.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="suspend-reason">Reason for suspension</Label>
            <Textarea
              id="suspend-reason"
              placeholder="Provide a reason..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleSuspend}>
              Suspend User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reactivateUser} onOpenChange={(open) => { if (!open) setReactivateUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to reactivate <strong>{reactivateUser?.full_name}</strong>?
              They will regain full access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReactivate}>Reactivate User</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!verifyUser} onOpenChange={(open) => { if (!open) setVerifyUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify User</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark <strong>{verifyUser?.full_name}</strong> as verified?
              This will add a verification badge to their profile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleVerify}>Verify User</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
