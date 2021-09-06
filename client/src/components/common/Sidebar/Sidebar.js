// import installed packages
import { Link, useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";

// import styles
import "./Sidebar.css";
// import material ui items

// import shared/global items

// import components/pages
import SysAdminLinks from "../Links/SysAdminLinks";
// import redux API
import { logout } from "../../../redux/actions/auth";
import OrganizationAdminLinks from "../Links/OrganizationAdminLinks";
import WorkerLinks from "../Links/WorkerLinks";

const Sidebar = (props) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { loggedIn, profile_type } = props;
  const { logoutUser } = props;

  return (
    <div className="left-navbar" id="nav-bar">
      <nav className="nav">
        <Link to="" className="nav__logo">
          <i className="bx bx-layer nav__logo-icon"></i>
          <span className="nav__logo-name">AZW</span>
        </Link>
        <div className="nav__list">
          {/* unprotected links */}
          <>
            <Link
              to="/"
              className={
                `${pathname}` === "/" ? "nav__link active" : "nav__link"
              }
            >
              <i class="bx bx-home"></i>
              <span className="nav__name">Home</span>
            </Link>
          </>
          {/* protected links */}
          {loggedIn && (
            <>
              {/* LINKS FOR THE SYSTEM ADMIN */}
              {profile_type === "System Admin" && (
                <SysAdminLinks Link={Link} pathname={pathname} />
              )}

              {/* LINKS FOR THE ORGANIZATION ADMINS */}
              {profile_type === "Organization Admin" && (
                <OrganizationAdminLinks Link={Link} pathname={pathname} />
              )}
              {/* LINKS FOR WORKER */}
              {profile_type === "Worker" && (
                <WorkerLinks Link={Link} pathname={pathname} />
              )}
              <Link
                to="/dashboard/"
                className={
                  `${pathname}` === "/dashboard/"
                    ? "nav__link active"
                    : "nav__link"
                }
              >
                <i className="bx bx-grid-alt nav__icon"></i>
                <span className="nav__name">Dashboard</span>
              </Link>
              <Link
                to="/profile/"
                className={
                  `${pathname}` === "/profile/"
                    ? "nav__link active"
                    : "nav__link"
                }
              >
                <i class="bx bx-user nav__icon"></i>
                <span className="nav__name">Profile</span>
              </Link>
              <Link
                to=""
                className="nav__link"
                onClick={() => logoutUser(history)}
              >
                <i className="bx bx-log-out-circle"></i>
                <span className="nav__name">Logout</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    loggedIn: state.auth?.loggedIn,
    profile_type: state.auth?.user?.profile_type,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logoutUser: (history) => dispatch(logout(history)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
