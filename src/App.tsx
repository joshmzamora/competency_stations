import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Shell } from "./components/Shell";
import { HomePage } from "./pages/HomePage";
import { HostPage } from "./pages/HostPage";
import { PlayerPage } from "./pages/PlayerPage";
import { ResultsPage } from "./pages/ResultsPage";
import { StudyPage } from "./pages/StudyPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "host", element: <HostPage /> },
      { path: "player", element: <PlayerPage /> },
      { path: "study", element: <StudyPage /> },
      { path: "results", element: <ResultsPage /> }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
