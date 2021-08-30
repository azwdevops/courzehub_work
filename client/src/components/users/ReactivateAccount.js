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
  CLOSE_RESEND_ACTIVATION,
  START_LOADING,
} from "../../redux/actions/types";
import { resend_activation } from "../../redux/actions/auth";
import { setAlert } from "../../redux/actions/shared";

const ReactivateAccount = (props) => {
  const { loading, alert, resendActivationForm } = props; // extract state from props
  const {
    startLoading,
    newAlert,
    closeResendActivation,
    resendActivation,
  } = props; // extract dispatch actions from props

  const [email, setEmail] = useState("");

  // ###################### destructuring to make code organized ######################### //
  const { error } = globals;
  // ###################### end destructuring to make code organized ######################### //

  const resetForm = () => {
    setEmail("");
  };

  const closeResendActivationForm = () => {
    closeResendActivation();
    resetForm();
  };

  // function to resend confirmation link
  const resendAccountConfirmationLink = (e) => {
    e.preventDefault();
    if (email.trim() === "") {
      return newAlert(error, "Email required");
    }
    startLoading();
    // call the signup action creator
    resendActivation(email, resetForm);
  };

  return (
    <MinDialog
      isOpen={resendActivationForm} // since the styles of min width applied globally is affecting the reactivate form width, apply inline styles
    >
      <form className="dialog" id={loading ? "formSubmitting" : ""}>
        <h3>Enter email to resend confirmation link</h3>
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
            required
          />
        </div>

        <div className="form__Buttons">
          <button type="button" onClick={closeResendActivationForm}>
            Close
          </button>
          <button type="submit" onClick={resendAccountConfirmationLink}>
            Send
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
    resendActivationForm: state.auth?.resendActivationForm,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    newAlert: (type, detail) => dispatch(setAlert(type, detail)),
    closeResendActivation: () => dispatch({ type: CLOSE_RESEND_ACTIVATION }),
    resendActivation: (email, resetForm) =>
      dispatch(resend_activation(email, resetForm)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReactivateAccount);
