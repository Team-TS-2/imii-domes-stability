import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./components/Dashboard";
import { StructuralMonitoring } from "./components/StructuralMonitoring";
import { ForeignMaterialDetection } from "./components/ForeignMaterialDetection";
import { InventoryMonitoring } from "./components/InventoryMonitoring";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "structural", Component: StructuralMonitoring },
      { path: "foreign-material", Component: ForeignMaterialDetection },
      { path: "inventory", Component: InventoryMonitoring },
      { path: "*", Component: NotFound },
    ],
  },
]);
