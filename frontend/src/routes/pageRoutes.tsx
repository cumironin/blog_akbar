import PageBuilder from "@/pages/page/pageBuilder";
import PageList from "@/pages/page/pageList";
import { Route } from "react-router-dom";
import AuthorizedRoute from "./ AuthorizedRoute";

const PageRoutes = () => (
  <>
    <Route
      path="/dashboard/pages"
      element={
        <AuthorizedRoute
          element={<PageList />}
          path="/dashboard/pages"
          method="GET"
        />
      }
    />
    <Route
      path="/dashboard/pages/new"
      element={
        <AuthorizedRoute
          element={<PageBuilder />}
          path="/dashboard/pages/new"
          method="POST"
        />
      }
    />
    <Route
      path="/dashboard/pages/:id"
      element={
        <AuthorizedRoute
          element={<PageBuilder />}
          path="/dashboard/pages/:id"
          method="PATCH"
        />
      }
    />
  </>
);

export default PageRoutes;
