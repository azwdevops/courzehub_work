// import installed packages
import { connect } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
// import styles
import "../styles/pages/ActivateAccount.css";
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
import { activate_account } from "../redux/actions/auth";

// import shared/global items

// import components/pages

// import redux API
import { START_LOADING } from "../redux/actions/types";

const ActivateAccount = (props) => {
  const { activation_token } = useParams();
  const history = useHistory();
  const { loading } = props; //get state from props
  const { startLoading, activateUser } = props; //get dispatch actions from props

  const handleActivate = () => {
    // dispatch the loading action
    startLoading();
    activateUser(activation_token, history);
  };

  return (
    <div className="activate__account" id={loading ? "formSubmitting" : ""}>
      <h1>Click on the button below to verify your account</h1>
      {loading && (
        <CircularProgress style={{ position: "absolute", marginLeft: "1%" }} />
      )}
      <button type="button" onClick={handleActivate}>
        Verify
      </button>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.shared?.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    activateUser: (activation_token, history) =>
      dispatch(activate_account({ activation_token, history })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivateAccount);
