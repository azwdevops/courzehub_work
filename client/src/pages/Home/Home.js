// import installed packages
import { connect, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
// import styles
import "./Home.css";
// import material ui items
// import shared/global items
// import components/pages
// import redux API
import { OPEN_LOGIN } from "../../redux/actions/types";

const Home = (props) => {
  const { userId, profile_type } = props;
  const history = useHistory();
  const dispatch = useDispatch();

  const workerStartNow = () => {
    if (userId) {
      if (profile_type === "Worker") {
        history.push(`/worker/work-center/`);
      } else {
        history.push("/profile");
      }
    } else {
      dispatch({ type: OPEN_LOGIN });
    }
  };

  const companyGetStarted = () => {
    if (userId) {
      if (profile_type === "Organization Admin") {
        history.push(`/organization-admin/maintain-tasks/`);
      } else {
        history.push("/profile");
      }
    } else {
      dispatch({ type: OPEN_LOGIN });
    }
  };

  return (
    <div className="home">
      <div className="home__left">
        {(profile_type === "Worker" || !profile_type) && (
          <>
            <h3>Earn by using your skills.</h3>
            <button
              type="button"
              className="add__button"
              onClick={workerStartNow}
            >
              Start Now
            </button>
          </>
        )}
      </div>
      <div className="home__right">
        {(profile_type === "Organization Admin" || !profile_type) && (
          <>
            <h3>Tap into remote talent.</h3>
            <button
              type="button"
              className="add__button"
              onClick={companyGetStarted}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    userId: state.auth.user?.id,
    profile_type: state.auth.user?.profile_type,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
