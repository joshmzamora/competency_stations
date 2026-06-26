import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Shell } from "./components/Shell";
import { HomePage } from "./pages/HomePage";
import { CompletionPage } from "./pages/CompletionPage";
import { HostPage } from "./pages/HostPage";
import { PlayerPage } from "./pages/PlayerPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "host", element: <HostPage /> },
      { path: "player", element: <PlayerPage /> },
      { path: "complete", element: <CompletionPage /> }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
