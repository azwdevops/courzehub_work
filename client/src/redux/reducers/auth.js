// types import
import * as actionTypes from "../actions/types";

const initialState = {
  signupForm: false,
  loginForm: false,
  loggedIn: false,
  forgotPasswordForm: false,
  resendActivationForm: false,
  resetPasswordConfirmForm: false,
  changePasswordForm: false,
  user: {},
};

const authReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.OPEN_SIGNUP:
      return {
        ...state,
        signupForm: true,
      };
    case actionTypes.CLOSE_SIGNUP:
      return {
        ...state,
        signupForm: false,
      };
    case actionTypes.OPEN_LOGIN:
      return {
        ...state,
        loginForm: true,
      };
    case actionTypes.CLOSE_LOGIN:
      return {
        ...state,
        loginForm: false,
      };
    case actionTypes.AUTH_SUCCESS:
      return { ...state, user: payload, loggedIn: true };
    case actionTypes.OPEN_FORGOT_PASSWORD:
      return {
        ...state,
        forgotPasswordForm: true,
      };
    case actionTypes.CLOSE_FORGOT_PASSWORD:
      return {
        ...state,
        forgotPasswordForm: false,
      };
    case actionTypes.OPEN_RESEND_ACTIVATION:
      return {
        ...state,
        resendActivationForm: true,
      };
    case actionTypes.CLOSE_RESEND_ACTIVATION:
      return {
        ...state,
        resendActivationForm: false,
      };
    case actionTypes.OPEN_PASSWORD_RESET_CONFIRM:
      return {
        ...state,
        resetPasswordConfirmForm: true,
      };
    case actionTypes.CLOSE_PASSWORD_RESET_CONFIRM:
      return {
        ...state,
        resetPasswordConfirmForm: false,
      };
    case actionTypes.OPEN_CHANGE_PASSWORD:
      return {
        ...state,
        changePasswordForm: true,
      };
    case actionTypes.CLOSE_CHANGE_PASSWORD:
      return {
        ...state,
        changePasswordForm: false,
      };
    case actionTypes.LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default authReducer;
