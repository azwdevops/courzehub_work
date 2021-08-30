// axios items
import * as api from "../../api/index";

// redux API items

import * as actionTypes from "../actions/types";
import { setAlert } from "./shared";

// shared items
import globals from "../../shared/globals";

const { error, success, unknown_error } = globals;

// sign up user
export const signup_user = (newUser, resetForm) => async (dispatch) => {
  await api
    .signupUser(newUser)
    .then((res) => {
      // dispatch({ type: AUTH_SUCCESS, payload: data?.user });
      dispatch(setAlert(success, res.data?.detail));
      resetForm();
    })
    .catch((err) => {
      // if bad client request
      if (err.response?.status === 400) {
        dispatch(setAlert(error, err.response.data?.detail));
      } else {
        alert(unknown_error);
      }
    })
    .finally(() => {
      dispatch({ type: actionTypes.STOP_LOADING });
    });
};

// activate user account
export const activate_account = (body) => async (dispatch) => {
  const { activation_token, history } = body;
  await api
    .activateAccount(activation_token)
    .then((res) => {
      alert(res.data?.detail);
      dispatch({ type: actionTypes.OPEN_LOGIN });
    })
    .catch((err) => {
      if (err.response.status === 400) {
        alert(err.response.data?.detail);
        // if token has expired or is invalid, open this form for user to request a new token
        dispatch({ type: actionTypes.OPEN_RESEND_ACTIVATION });
      } else {
        alert(unknown_error);
      }
    })
    .finally(() => {
      dispatch({ type: actionTypes.STOP_LOADING });
      history.replace("/");
    });
};

// resend user account activation link
export const resend_activation = (email, resetForm) => async (dispatch) => {
  await api
    .resendActivation(email)
    .then((res) => {
      dispatch(setAlert(success, "Activation link sent to email."));
      resetForm();
    })
    .catch((err) => {
      // if bad client request
      if (err.response?.status === 400) {
        dispatch(setAlert(error, err.response.data?.detail));
      } else {
        dispatch(setAlert(error, "An error occurred, please try again later"));
      }
    })
    .finally(() => {
      // dispatch the stop loading action
      dispatch({ type: actionTypes.STOP_LOADING });
    });
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
    .catch((err) => {
      if (err.response?.status === 400) {
        dispatch(setAlert(error, err.response.data?.detail));
      } else if (err.response?.status === 401) {
        dispatch(
          setAlert(error, "Invalid login, ensure your account is activated")
        );
      } else {
        console.log(err);
      }
    })
    .finally(() => {
      // dispatch the stop loading action
      dispatch({ type: actionTypes.STOP_LOADING });
    });
};

// reset user password by sending an email with a reset link
export const reset_password = (email, resetForm) => async (dispatch) => {
  await api
    .resetPassword(email)
    .then((res) => {
      dispatch(setAlert(success, res.data?.detail));
      resetForm();
    })
    .catch((err) => {
      if (err.response?.status === 400) {
        dispatch(setAlert(error, err.response.data?.detail));
      } else {
        dispatch(setAlert(error, unknown_error));
      }
    })
    .finally(() => {
      dispatch({ type: actionTypes.STOP_LOADING });
    });
};

// set new user password
export const set_password = (newPasswords, password_token, history) => async (
  dispatch
) => {
  await api
    .setPassword(newPasswords, password_token)
    .then((res) => {
      alert(res.data?.detail);
      dispatch({ type: actionTypes.CLOSE_PASSWORD_RESET_CONFIRM });
      history.replace("/");
      dispatch({ type: actionTypes.OPEN_LOGIN });
    })
    .catch((err) => {
      if (err.response?.status === 400) {
        dispatch(setAlert(error, err.response.data?.detail));
      } else {
        dispatch(setAlert(error, unknown_error));
      }
    })
    .finally(() => {
      dispatch({ type: actionTypes.STOP_LOADING });
    });
};

// patch/update user data
export const update_user = (updatedUser, userId) => async (dispatch) => {
  await api
    .updateUser(updatedUser, userId)
    .then((res) => {
      dispatch({ type: actionTypes.AUTH_SUCCESS, payload: res.data?.user });
      alert(res.data?.detail);
    })
    .catch((err) => {
      if (err.response?.status === 400) {
        alert(err.response.data?.detail);
      } else {
        alert(unknown_error);
      }
    })
    .finally(() => {
      dispatch({ type: actionTypes.STOP_LOADING });
    });
};

// user change password
export const change_password = (passwords, userId, history) => async (
  dispatch
) => {
  await api
    .changePassword(passwords, userId)
    .then((res) => {
      alert(success, res.data?.detail);
      dispatch({ type: actionTypes.CLOSE_CHANGE_PASSWORD });
      dispatch(logout(history));
      dispatch({ type: actionTypes.OPEN_LOGIN });
    })
    .catch((err) => {
      if (err.response?.status === 400) {
        dispatch(setAlert(error, err.response.data?.detail));
      } else {
        dispatch(setAlert(error, unknown_error));
      }
    })
    .finally(() => {
      dispatch({ type: actionTypes.STOP_LOADING });
    });
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
export const logout = (history) => async (dispatch) => {
  localStorage.clear();
  dispatch({ type: actionTypes.LOGOUT });
  history.replace("/");
};
