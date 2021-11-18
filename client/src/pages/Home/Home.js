// import installed packages
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// import styles
import "./Home.scss";
// import material ui items
// import shared/global items
// import components/pages
// import redux API
import { OPEN_LOGIN } from "../../redux/actions/types";

const Home = (props) => {
  const { userId, profile_type } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const workerStartNow = () => {
    if (userId) {
      if (profile_type === "Worker") {
        navigate(`/worker/work-center/`, { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } else {
      dispatch({ type: OPEN_LOGIN });
    }
  };

  const companyGetStarted = () => {
    if (userId) {
      if (profile_type === "Organization Admin") {
        navigate(`/organization-admin/maintain-tasks/`, { replace: true });
      } else {
        navigate("/profile", { replace: true });
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
