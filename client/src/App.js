// import installed packages
import { useEffect } from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// import styles
import "./App.css";
// import material ui items

// import shared/global items
import PrivateRoute from "./shared/PrivateRoute";
// import components/pages
import Header from "./components/common/Header";
// import Footer from "./components/common/Footer";
import Home from "./pages/Home/Home";
import Sidebar from "./components/common/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard";
import ActivateAccount from "./pages/ActivateAccount";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
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
        <Switch>
          {/* unauthenticated routes */}
          <Route exact path="/" component={Home} />
          <Route
            exact
            path="/user/password-reset/:password_token/"
            component={ResetPasswordConfirm}
          />
          <Route
            exact
            path="/user/activate/:activation_token/"
            component={ActivateAccount}
          />
          {/* authenticated routes */}
          {/* SYSTEM ADMIN ROUTES */}
          {profile_type === "System Admin" && (
            <>
              <PrivateRoute
                exact
                path="/sys-admin/maintain-organizations/"
                component={MaintainOrganizations}
              />
              <PrivateRoute
                exact
                path="/sys-admin/maintain-workers/"
                component={MaintainWorkers}
              />
            </>
          )}

          {/* ORGANIZATION ADMIN ROUTES */}
          {profile_type === "Organization Admin" && (
            <PrivateRoute
              exact
              path="/organization-admin/maintain-tasks/"
              component={MaintainTasks}
            />
          )}

          {/* END OF SYSTEM ADMIN LINKS */}
          {/* WORKER LINKS */}
          {profile_type === "Worker" && (
            <PrivateRoute
              exact
              path="/worker/work-center/"
              component={WorkCenter}
            />
          )}

          {/* END OF WORKER LINKS */}
          <PrivateRoute exact path="/profile" component={Profile} />
          <PrivateRoute exact path="/dashboard/" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
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
