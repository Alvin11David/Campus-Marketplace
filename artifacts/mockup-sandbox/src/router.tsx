import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { Skeleton } from "@/components/ui/skeleton";

const Login = lazy(() => import("@/pages/auth/login"));
const Register = lazy(() => import("@/pages/auth/register"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/auth/reset-password"));
const Onboarding = lazy(() => import("@/pages/auth/onboarding"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const MyProfile = lazy(() => import("@/pages/profile/my-profile"));
const PublicProfile = lazy(() => import("@/pages/profile/public-profile"));
const CreateListing = lazy(() => import("@/pages/listings/create"));
const ListingDetail = lazy(() => import("@/pages/listings/detail"));
const EditListing = lazy(() => import("@/pages/listings/edit"));
const MyListings = lazy(() => import("@/pages/listings/my-listings"));
const Categories = lazy(() => import("@/pages/categories/index"));
const CategoryPage = lazy(() => import("@/pages/categories/category-page"));
const SearchResults = lazy(() => import("@/pages/search/index"));
const Messages = lazy(() => import("@/pages/messages/index"));
const Conversation = lazy(() => import("@/pages/messages/conversation"));
const Notifications = lazy(() => import("@/pages/notifications/index"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminCategories = lazy(() => import("@/pages/admin/categories"));

function PageFallback() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        path: "dashboard",
        element: <ProtectedRoute><SuspenseWrap><Dashboard /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "profile/me",
        element: <ProtectedRoute><SuspenseWrap><MyProfile /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "profile/:id",
        element: <ProtectedRoute><SuspenseWrap><PublicProfile /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "listings/new",
        element: <ProtectedRoute><SuspenseWrap><CreateListing /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "listings/:id",
        element: <ProtectedRoute><SuspenseWrap><ListingDetail /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "listings/:id/edit",
        element: <ProtectedRoute><SuspenseWrap><EditListing /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "my-listings",
        element: <ProtectedRoute><SuspenseWrap><MyListings /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "categories",
        element: <ProtectedRoute><SuspenseWrap><Categories /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "categories/:slug",
        element: <ProtectedRoute><SuspenseWrap><CategoryPage /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "search",
        element: <ProtectedRoute><SuspenseWrap><SearchResults /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "messages",
        element: <ProtectedRoute><SuspenseWrap><Messages /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "messages/:id",
        element: <ProtectedRoute><SuspenseWrap><Conversation /></SuspenseWrap></ProtectedRoute>,
      },
      {
        path: "notifications",
        element: <ProtectedRoute><SuspenseWrap><Notifications /></SuspenseWrap></ProtectedRoute>,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <SuspenseWrap><Login /></SuspenseWrap> },
      { path: "register", element: <SuspenseWrap><Register /></SuspenseWrap> },
      { path: "forgot-password", element: <SuspenseWrap><ForgotPassword /></SuspenseWrap> },
      { path: "reset-password", element: <SuspenseWrap><ResetPassword /></SuspenseWrap> },
      {
        path: "onboarding",
        element: <ProtectedRoute><SuspenseWrap><Onboarding /></SuspenseWrap></ProtectedRoute>,
      },
    ],
  },
  {
    path: "admin-dashboard",
    element: <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <SuspenseWrap><AdminDashboard /></SuspenseWrap> },
      { path: "users", element: <SuspenseWrap><AdminUsers /></SuspenseWrap> },
      { path: "reports", element: <SuspenseWrap><AdminReports /></SuspenseWrap> },
      { path: "analytics", element: <SuspenseWrap><AdminAnalytics /></SuspenseWrap> },
      { path: "categories", element: <SuspenseWrap><AdminCategories /></SuspenseWrap> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
