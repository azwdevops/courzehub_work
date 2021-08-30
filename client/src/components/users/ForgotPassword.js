// import installed packages
import { useState } from "react";
import { connect } from "react-redux";
// import styles

// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";

// import shared/global items
import globals from "../../shared/globals";

// import components/pages
import MinDialog from "../common/MinDialog";

// import redux API
import {
  CLOSE_FORGOT_PASSWORD,
  START_LOADING,
} from "../../redux/actions/types";
import { setAlert } from "../../redux/actions/shared";
import { reset_password } from "../../redux/actions/auth";

const ForgotPassword = (props) => {
  const { loading, alert, forgotPasswordForm } = props; // extract state from props
  const { startLoading, newAlert, resetPassword, closeForgotPassword } = props; // extract dispatch actions from props

  const [email, setEmail] = useState("");

  //############### destructuring code ###################//
  const { error } = globals;

  //#################end of destructuring ###########//

  const resetForm = () => {
    setEmail("");
  };

  const closeForgotPasswordForm = () => {
    closeForgotPassword();
    resetForm();
  };

  // function to reset password (send reset password email)

  const sendPasswordResetEmail = (e) => {
    e.preventDefault();

    if (email.trim() === "") {
      return newAlert(error, "Email required");
    }
    startLoading();
    // call the signup action creator
    resetPassword(email, resetForm);
  };

  return (
    <MinDialog isOpen={forgotPasswordForm}>
      <form className="dialog" id={loading ? "formSubmitting" : ""}>
        <h3>Enter your email to reset password</h3>
        <p className={`response__message ${alert.alertType}`}>
          {alert.status && alert.detail}
        </p>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "40%" }}
          />
        )}
        <div className="dialog__rowSingleItem">
          <label htmlFor="">Email</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        <div className="form__Buttons">
          <button type="button" onClick={closeForgotPasswordForm}>
            Close
          </button>
          <button type="submit" onClick={sendPasswordResetEmail}>
            Reset
          </button>
        </div>
      </form>
    </MinDialog>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.shared?.loading,
    alert: state.shared?.alert,
    forgotPasswordForm: state.auth?.forgotPasswordForm,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    newAlert: (type, detail) => dispatch(setAlert(type, detail)),
    resetPassword: (email, resetForm) =>
      dispatch(reset_password(email, resetForm)),
    closeForgotPassword: () => dispatch({ type: CLOSE_FORGOT_PASSWORD }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
