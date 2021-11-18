// axios items
import * as api from "../../api/index";

// redux API items

import * as actionTypes from "../actions/types";
import { showError, stopLoading } from "./shared";
// shared items
import globals from "../../shared/globals";

const { success, unknown_error } = globals;

// sign up user
export const signup_user = (newUser, resetForm) => async (dispatch) => {
  await api
    .signupUser(newUser)
    .then((res) => {
      // dispatch({ type: AUTH_SUCCESS, payload: data?.user });
      window.alert(res.data?.detail);
      resetForm();
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// activate user account
export const activate_account = (body) => async (dispatch) => {
  const { activation_token, navigate } = body;
  await api
    .activateAccount(activation_token)
    .then((res) => {
      alert(res.data?.detail);
      dispatch({ type: actionTypes.OPEN_LOGIN });
    })
    .catch((err) => {
      if (err.response.status === 400) {
        window.alert(err.response.data?.detail);
        // if token has expired or is invalid, open this form for user to request a new token
        dispatch({ type: actionTypes.OPEN_RESEND_ACTIVATION });
      } else {
        window.alert(unknown_error);
      }
    })
    .finally(() => {
      dispatch({ type: actionTypes.STOP_LOADING });
      navigate("/", { replace: true });
    });
};

// resend user account activation link
export const resend_activation = (email, resetForm) => async (dispatch) => {
  await api
    .resendActivation(email)
    .then((res) => {
      window.alert(res.data?.detail);
      resetForm();
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// login user
export const login = (loginData, resetForm) => async (dispatch) => {
  await api
    .signIn(loginData)
    .then((res) => {
      localStorage.setItem("session_cookie", res.data?.access);
      resetForm();
      // dispatch success message
      dispatch({ type: actionTypes.CLOSE_LOGIN });
      // get user details
      dispatch(get_user());
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// reset user password by sending an email with a reset link
export const reset_password = (email, resetForm) => async (dispatch) => {
  await api
    .resetPassword(email)
    .then((res) => {
      window.alert(res.data?.detail);
      resetForm();
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// set new user password
export const set_password =
  (newPasswords, password_token, navigate) => async (dispatch) => {
    await api
      .setPassword(newPasswords, password_token)
      .then((res) => {
        alert(res.data?.detail);
        dispatch({ type: actionTypes.CLOSE_PASSWORD_RESET_CONFIRM });
        navigate("/", { replace: true });
        dispatch({ type: actionTypes.OPEN_LOGIN });
      })
      .catch((err) => showError(err))
      .finally(() => stopLoading(dispatch));
  };

// patch/update user data
export const update_user = (updatedUser, userId) => async (dispatch) => {
  await api
    .updateUser(updatedUser, userId)
    .then((res) => {
      dispatch({ type: actionTypes.AUTH_SUCCESS, payload: res.data?.user });
      alert(res.data?.detail);
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// user change password
export const change_password =
  (passwords, userId, navigate) => async (dispatch) => {
    await api
      .changePassword(passwords, userId)
      .then((res) => {
        window.alert(res.data?.detail);
        dispatch({ type: actionTypes.CLOSE_CHANGE_PASSWORD });
        dispatch(logout(navigate));
        dispatch({ type: actionTypes.OPEN_LOGIN });
      })
      .catch((err) => showError(err))
      .finally(() => stopLoading(dispatch));
  };

// get user data
export const get_user = () => async (dispatch) => {
  await api
    .getUser()
    .then((res) => {
      dispatch({ type: actionTypes.AUTH_SUCCESS, payload: res.data?.user });
    })
    .catch((err) => {
      dispatch({ type: actionTypes.LOGOUT });
      localStorage.clear();
    });
};

// logout user
export const logout = (navigate) => async (dispatch) => {
  localStorage.clear();
  dispatch({ type: actionTypes.LOGOUT });
  navigate("/", { replace: true });
};
