// import installed packages
import { useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
// import styles

// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import { ifEmpty, resetFormValues } from "../../shared/sharedFunctions";
// import components/pages
import MinDialog from "../common/MinDialog";

// import redux API
import {
  CLOSE_CHANGE_PASSWORD,
  START_LOADING,
} from "../../redux/actions/types";
import { change_password } from "../../redux/actions/auth";

const ChangePassword = (props) => {
  const navigate = useNavigate();
  const { loading, changePasswordForm, userId } = props; // extract state from props
  const { startLoading, changeUserPassword, closeChangePassword } = props; // extract dispatch actions from props

  // internal state
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  //############### destructuring code ###################//
  const { current_password, new_password, confirm_new_password } = passwords;
  //#################end of destructuring ###########//

  const resetForm = () => {
    resetFormValues(passwords);
  };

  const closeChangePasswordForm = () => {
    resetForm();
    closeChangePassword();
  };

  // handle change function
  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // function to handle password change
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (ifEmpty(passwords)) {
      return window.alert("All fields are required");
    }
    startLoading();
    // call the signup action creator
    changeUserPassword(passwords, userId, navigate, resetForm);
  };
  return (
    <MinDialog isOpen={changePasswordForm}>
      <form className="dialog" id={loading ? "formSubmitting" : ""}>
        <h3>Change your password here</h3>
        <div className="dialog__rowSingleItem">
          <label htmlFor="">Old Password</label>
          <input
            type="password"
            name="current_password"
            value={current_password}
            onChange={handleChange}
          />
        </div>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "40%" }}
          />
        )}
        <div className="dialog__rowSingleItem">
          <label htmlFor="">New Password</label>
          <input
            type="password"
            name="new_password"
            value={new_password}
            onChange={handleChange}
          />
        </div>
        <div className="dialog__rowSingleItem">
          <label htmlFor="">Confirm New Password</label>
          <input
            type="password"
            name="confirm_new_password"
            value={confirm_new_password}
            onChange={handleChange}
          />
        </div>
        <div className="form__Buttons">
          <button type="button" onClick={closeChangePasswordForm}>
            Close
          </button>
          <button type="submit" onClick={handlePasswordChange}>
            Submit
          </button>
        </div>
      </form>
    </MinDialog>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.shared?.loading,
    changePasswordForm: state.auth?.changePasswordForm,
    userId: state.auth.user?.id,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    changeUserPassword: (passwords, userId, history, resetForm) =>
      dispatch(change_password(passwords, userId, history, resetForm)),
    closeChangePassword: () => dispatch({ type: CLOSE_CHANGE_PASSWORD }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
