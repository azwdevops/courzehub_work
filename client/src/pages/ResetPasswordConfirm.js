// import installed packages
import { useRef, useState } from "react";
import { connect } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
// import styles
import "../styles/pages/ActivateAccount.css";
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import globals from "../shared/globals";
import { ifEmpty, resetFormValues } from "../shared/sharedFunctions";

// import components/pages
import MinDialog from "../components/common/MinDialog";

// import redux API
import {
  CLOSE_PASSWORD_RESET_CONFIRM,
  OPEN_PASSWORD_RESET_CONFIRM,
  START_LOADING,
} from "../redux/actions/types";
import { setAlert } from "../redux/actions/shared";
import { set_password } from "../redux/actions/auth";

const ResetPasswordConfirm = (props) => {
  const history = useHistory();
  const { password_token } = useParams();
  const { loading, alert, resetPasswordConfirmForm } = props; // extract state from props
  const {
    startLoading,
    setNewPassword,
    newAlert,
    openNewPassword,
    closeNewPassword,
  } = props; // extract dispatch actions from props
  const [newPasswords, setNewPasswords] = useState({
    new_password: "",
    confirm_password: "",
  });

  // destructure values for better code formatting
  // ########### start of destructuring #################  //
  const { new_password, confirm_password } = newPasswords;
  const { error } = globals;

  // ########### end of destructuring #################  //

  const resetForm = () => {
    resetFormValues(newPasswords);
  };

  const closeNewPasswordForm = () => {
    resetForm();
    closeNewPassword();
  };

  // handle change
  const handleChange = (e) =>
    setNewPasswords({ ...newPasswords, [e.target.name]: e.target.value });

  // function to submit new password
  const handleSetNewPassword = (e) => {
    e.preventDefault();
    if (ifEmpty(newPasswords)) {
      return newAlert(error, "Both fields are required");
    }
    startLoading();

    // call the signup action creator
    setNewPassword(newPasswords, password_token, history);
  };

  return (
    <>
      <div className="activate__account">
        <h1>Click the button to set new password</h1>
        <button type="button" onClick={openNewPassword}>
          Set New password
        </button>
      </div>
      <MinDialog isOpen={resetPasswordConfirmForm}>
        <form className="dialog" id={loading ? "formSubmitting" : ""}>
          <h3>Enter new password</h3>
          <p className={`response__message ${alert.alertType}`}>
            {alert.status && alert.detail}
          </p>
          <div className="dialog__rowSingleItem">
            <label htmlFor="">New Password</label>
            <input
              type="password"
              name="new_password"
              onChange={handleChange}
              value={new_password}
            />
          </div>
          {loading && (
            <CircularProgress
              style={{ position: "absolute", marginLeft: "43%" }}
            />
          )}
          <div className="dialog__rowSingleItem">
            <label htmlFor="">Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              onChange={handleChange}
              value={confirm_password}
            />
          </div>
          <div className="form__Buttons">
            <button type="button" onClick={closeNewPasswordForm}>
              Close
            </button>
            <button type="submit" onClick={handleSetNewPassword}>
              Submit
            </button>
          </div>
        </form>
      </MinDialog>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.shared?.loading,
    resetPasswordConfirmForm: state.auth?.resetPasswordConfirmForm,
    alert: state.shared?.alert,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    setNewPassword: (newPasswords, password_token, history) =>
      dispatch(set_password(newPasswords, password_token, history)),
    openNewPassword: () => dispatch({ type: OPEN_PASSWORD_RESET_CONFIRM }),
    closeNewPassword: () => dispatch({ type: CLOSE_PASSWORD_RESET_CONFIRM }),
    newAlert: (type, detail) => dispatch(setAlert(type, detail)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResetPasswordConfirm);
