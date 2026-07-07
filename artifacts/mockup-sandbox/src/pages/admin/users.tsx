import { useState, useMemo } from "react";
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
import { MOCK_USER } from "@/lib/api";
import type { User } from "@/lib/api";

interface MockUser extends User {
  listing_count: number;
  report_count: number;
}

const mockUsers: MockUser[] = [
  { ...MOCK_USER, listing_count: 5, report_count: 0 },
  {
    id: 2, full_name: "Taban James", email: "taban@students.vu.ac.ug", phone: "", bio: null,
    profile_photo_url: null, campus_location_id: null, campus_location_name: null,
    is_provider: true, is_seller: false, is_admin: false, is_verified: true,
    is_active: true, is_suspended: false, avg_rating: 4.8, rating_count: 9,
    created_at: "2026-05-01T10:00:00Z", listing_count: 3, report_count: 0,
  },
  {
    id: 3, full_name: "Sarah Nakato", email: "sarah@students.vu.ac.ug", phone: "", bio: null,
    profile_photo_url: null, campus_location_id: null, campus_location_name: null,
    is_provider: true, is_seller: false, is_admin: false, is_verified: false,
    is_active: true, is_suspended: false, avg_rating: 4.5, rating_count: 8,
    created_at: "2026-05-03T10:00:00Z", listing_count: 2, report_count: 1,
  },
  {
    id: 4, full_name: "Grace Achieng", email: "grace@students.vu.ac.ug", phone: "", bio: null,
    profile_photo_url: null, campus_location_id: null, campus_location_name: null,
    is_provider: true, is_seller: true, is_admin: false, is_verified: true,
    is_active: true, is_suspended: false, avg_rating: 4.9, rating_count: 15,
    created_at: "2026-04-28T10:00:00Z", listing_count: 4, report_count: 0,
  },
  {
    id: 10, full_name: "Suspicious User", email: "suspicious@students.vu.ac.ug", phone: "", bio: null,
    profile_photo_url: null, campus_location_id: null, campus_location_name: null,
    is_provider: false, is_seller: true, is_admin: false, is_verified: false,
    is_active: true, is_suspended: true, avg_rating: null, rating_count: 0,
    created_at: "2026-06-15T10:00:00Z", listing_count: 1, report_count: 3,
  },
];

const roleFilters = ["All", "Provider", "Seller", "Admin"] as const;

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [suspendUser, setSuspendUser] = useState<MockUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [reactivateUser, setReactivateUser] = useState<MockUser | null>(null);
  const [verifyUser, setVerifyUser] = useState<MockUser | null>(null);

  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
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
  }, [search, roleFilter]);

  function getRoles(user: MockUser) {
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

  function getStatus(user: MockUser) {
    if (user.is_suspended) return { label: "Suspended", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" };
    if (user.is_active) return { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" };
    return { label: "Inactive", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  }

  function handleSuspend() {
    if (!suspendUser) return;
    setSuspendUser(null);
    setSuspendReason("");
    toast.success(`${suspendUser.full_name} has been suspended`);
  }

  function handleReactivate() {
    if (!reactivateUser) return;
    setReactivateUser(null);
    toast.success(`${reactivateUser.full_name} has been reactivated`);
  }

  function handleVerify() {
    if (!verifyUser) return;
    setVerifyUser(null);
    toast.success(`${verifyUser.full_name} has been verified`);
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
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center text-sm">{user.listing_count}</TableCell>
                      <TableCell className="hidden sm:table-cell text-center text-sm">{user.report_count}</TableCell>
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
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
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
