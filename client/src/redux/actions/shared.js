import { SET_ALERT, REMOVE_ALERT, STOP_LOADING } from "./types";
import globals from "../../shared/globals";

const { unknown_error } = globals;

export const setAlert = (alertType, detail) => async (dispatch) => {
  // set alert
  // alertType is either success or error
  // detail is the message
  dispatch({ type: SET_ALERT, payload: { status: true, alertType, detail } });

  // remove alert after 3 seconds
  setTimeout(() => {
    dispatch({
      type: REMOVE_ALERT,
      payload: { status: false, alertType: "", detail: "" },
    });
  }, 3000);
};

// START OF reusable functions
// show error function
export const showError = (err) => {
  if (
    err?.response?.status === 400 ||
    err?.response?.status === 401 ||
    err?.response?.status === 403
  ) {
    window.alert(err?.response?.data?.detail);
  } else if (err?.response?.status === 413) {
    window.alert("Video file too large, a maximum of 95MB allowed.");
  } else {
    window.alert(unknown_error);
  }
};
export const stopLoading = (dispatch) => {
  dispatch({ type: STOP_LOADING });
};

// END OF REUSABLE FUNCTIONS
