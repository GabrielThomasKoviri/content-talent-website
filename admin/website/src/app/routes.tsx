import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import ContentManagement from "./pages/ContentManagement";
import Subscribers from "./pages/Subscribers";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import Analytics from "./pages/Analytics";
import Revenue from "./pages/Revenue";
import Community from "./pages/Community";
import Branding from "./pages/Branding";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "content", Component: ContentManagement },
      { path: "subscribers", Component: Subscribers },
      { path: "plans", Component: SubscriptionPlans },
      { path: "analytics", Component: Analytics },
      { path: "revenue", Component: Revenue },
      { path: "community", Component: Community },
      { path: "branding", Component: Branding },
      { path: "categories", Component: Categories },
      { path: "settings", Component: Settings },
    ],
  },
]);
