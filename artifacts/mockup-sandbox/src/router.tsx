import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { ProtectedRoute } from "@/components/shared/protected-route";

import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import Onboarding from "@/pages/auth/onboarding";
import Dashboard from "@/pages/dashboard";
import MyProfile from "@/pages/profile/my-profile";
import PublicProfile from "@/pages/profile/public-profile";
import CreateListing from "@/pages/listings/create";
import ListingDetail from "@/pages/listings/detail";
import EditListing from "@/pages/listings/edit";
import MyListings from "@/pages/listings/my-listings";
import Categories from "@/pages/categories/index";
import CategoryPage from "@/pages/categories/category-page";
import SearchResults from "@/pages/search/index";
import Messages from "@/pages/messages/index";
import Conversation from "@/pages/messages/conversation";
import Notifications from "@/pages/notifications/index";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminReports from "@/pages/admin/reports";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminCategories from "@/pages/admin/categories";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> },
      {
        path: "dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: "profile/me",
        element: <ProtectedRoute><MyProfile /></ProtectedRoute>,
      },
      {
        path: "profile/:id",
        element: <ProtectedRoute><PublicProfile /></ProtectedRoute>,
      },
      {
        path: "listings/new",
        element: <ProtectedRoute><CreateListing /></ProtectedRoute>,
      },
      {
        path: "listings/:id",
        element: <ProtectedRoute><ListingDetail /></ProtectedRoute>,
      },
      {
        path: "listings/:id/edit",
        element: <ProtectedRoute><EditListing /></ProtectedRoute>,
      },
      {
        path: "my-listings",
        element: <ProtectedRoute><MyListings /></ProtectedRoute>,
      },
      {
        path: "categories",
        element: <ProtectedRoute><Categories /></ProtectedRoute>,
      },
      {
        path: "categories/:slug",
        element: <ProtectedRoute><CategoryPage /></ProtectedRoute>,
      },
      {
        path: "search",
        element: <ProtectedRoute><SearchResults /></ProtectedRoute>,
      },
      {
        path: "messages",
        element: <ProtectedRoute><Messages /></ProtectedRoute>,
      },
      {
        path: "messages/:id",
        element: <ProtectedRoute><Conversation /></ProtectedRoute>,
      },
      {
        path: "notifications",
        element: <ProtectedRoute><Notifications /></ProtectedRoute>,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      {
        path: "onboarding",
        element: <ProtectedRoute><Onboarding /></ProtectedRoute>,
      },
    ],
  },
  {
    path: "admin-dashboard",
    element: <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "reports", element: <AdminReports /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "categories", element: <AdminCategories /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
