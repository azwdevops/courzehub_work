// import installed packages
import { useState, useRef } from "react";
import { connect } from "react-redux";

// import styles

// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import globals from "../../shared/globals";
import { ifEmpty, resetFormValues } from "../../shared/sharedFunctions";
// import components/pages
import MinDialog from "../common/MinDialog";

// import redux API
import {
  CLOSE_LOGIN,
  OPEN_FORGOT_PASSWORD,
  OPEN_RESEND_ACTIVATION,
  OPEN_SIGNUP,
  START_LOADING,
} from "../../redux/actions/types";
import { setAlert } from "../../redux/actions/shared";
import { login } from "../../redux/actions/auth";

const Login = (props) => {
  const { loading, alert, loginForm } = props; // extract state from props
  const {
    startLoading,
    newAlert,
    loginUser,
    closeLogin,
    openPasswordReset,
    openSignup,
    openResendActivation,
  } = props; // extract dispatch action from props
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // destructuring
  const { error } = globals;
  const { email, password } = loginData;

  // reset form values
  const resetForm = () => {
    resetFormValues(loginData);
  };

  // function to close login form
  const closeLoginForm = () => {
    closeLogin();
    resetForm();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (ifEmpty(loginData)) {
      return newAlert(error, "Email and password required");
    }
    startLoading();
    // call the signup action creator
    loginUser(loginData, resetForm);
  };

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // open password reset form
  const openPasswordResetForm = () => {
    openPasswordReset();
    closeLogin();
  };

  //open sign up form
  const openSignupForm = () => {
    openSignup();
    closeLogin();
  };
  // open resend activation
  const openResendActivationForm = () => {
    openResendActivation();
    closeLogin();
  };

  return (
    <>
      <MinDialog isOpen={loginForm}>
        <form className="dialog" id={loading ? "formSubmitting" : ""}>
          <h3>Login here</h3>
          <p className={`response__message ${alert.alertType}`}>
            {alert.status && alert.detail}
          </p>
          <div className="dialog__rowSingleItem">
            <label htmlFor="">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={email}
            />
          </div>
          {loading && (
            <CircularProgress
              style={{ position: "absolute", marginLeft: "40%" }}
            />
          )}
          <div className="dialog__rowSingleItem">
            <label htmlFor="">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={password}
            />
          </div>
          <div className="form__Buttons">
            <button type="button" onClick={closeLoginForm}>
              Close
            </button>
            <button type="submit" onClick={handleLogin}>
              Login
            </button>
          </div>
          <div className="extra__formButtons">
            <label
              htmlFor=""
              className="button"
              onClick={openPasswordResetForm}
            >
              Forgot Password
            </label>
            <label
              htmlFor=""
              className="button"
              style={{ justifySelf: "end" }}
              onClick={openSignupForm}
            >
              Create Account
            </label>
          </div>
          <div className="extra__formButtons">
            <label
              htmlFor=""
              className="button"
              onClick={openResendActivationForm}
            >
              Resend Activation
            </label>
          </div>
        </form>
      </MinDialog>
      {/* components */}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.shared?.loading,
    loginForm: state.auth.loginForm,
    alert: state.shared.alert,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    newAlert: (type, detail) => dispatch(setAlert(type, detail)),
    loginUser: (loginData, resetForm) => dispatch(login(loginData, resetForm)),
    closeLogin: () => dispatch({ type: CLOSE_LOGIN }),
    openPasswordReset: () => dispatch({ type: OPEN_FORGOT_PASSWORD }),
    openSignup: () => dispatch({ type: OPEN_SIGNUP }),
    openResendActivation: () => dispatch({ type: OPEN_RESEND_ACTIVATION }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
