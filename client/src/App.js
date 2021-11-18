// import installed packages
import { useEffect } from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// import styles
import "./App.scss";
// import material ui items

// import shared/global items
import PrivateRoute from "./shared/PrivateRoute";
// import components/pages
import Header from "./components/common/Header/Header";
// import Footer from "./components/common/Footer";
import Home from "./pages/Home/Home";
import Sidebar from "./components/common/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import ActivateAccount from "./pages/ActivateAccount/ActivateAccount";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import NotFound from "./pages/NotFound/NotFound";
import Profile from "./pages/Profile/Profile";
import MaintainOrganizations from "./pages/systemAdmin/MaintainOrganizations/MaintainOrganizations";
import MaintainTasks from "./pages/organizationAdmin/Tasks/MaintainTasks";
import MaintainWorkers from "./pages/systemAdmin/MaintainWorkers/MaintainWorkers";

// import redux API
import { get_user } from "./redux/actions/auth";
import WorkCenter from "./pages/worker/WorkCenter/WorkCenter";

function App(props) {
  const { profile_type } = props;
  const { getUser } = props;
  const session_cookie = localStorage.getItem("session_cookie");

  useEffect(() => {
    // get user on page refresh
    if (session_cookie) {
      getUser();
    }
  }, [getUser, session_cookie]);

  return (
    <div id="body-pd">
      <Router>
        <Header />
        <Sidebar />
        <Routes>
          {/* unauthenticated routes */}
          <Route exact path="/" element={<Home />} />
          <Route
            exact
            path="/user/password-reset/:password_token/"
            element={<ResetPasswordConfirm />}
          />
          <Route
            exact
            path="/user/activate/:activation_token/"
            element={<ActivateAccount />}
          />
          {/* authenticated routes */}
          <Route exact path="/" element={<PrivateRoute />}>
            {/* SYSTEM ADMIN ROUTES */}
            {profile_type === "System Admin" && (
              <>
                <Route
                  exact
                  path="/sys-admin/maintain-organizations/"
                  element={<MaintainOrganizations />}
                />
                <Route
                  exact
                  path="/sys-admin/maintain-workers/"
                  element={<MaintainWorkers />}
                />
              </>
            )}

            {/* ORGANIZATION ADMIN ROUTES */}
            {profile_type === "Organization Admin" && (
              <Route
                exact
                path="/organization-admin/maintain-tasks/"
                element={<MaintainTasks />}
              />
            )}

            {/* END OF SYSTEM ADMIN LINKS */}
            {/* WORKER LINKS */}
            {profile_type === "Worker" && (
              <Route
                exact
                path="/worker/work-center/"
                element={<WorkCenter />}
              />
            )}

            {/* END OF WORKER LINKS */}
            <Route exact path="/profile" element={<Profile />} />
            <Route exact path="/dashboard/" element={<Dashboard />} />
          </Route>
          <Route element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    profile_type: state.auth.user?.profile_type,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getUser: () => dispatch(get_user()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
