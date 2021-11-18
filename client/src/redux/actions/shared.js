import { SET_ALERT, REMOVE_ALERT, STOP_LOADING } from "./types";
import globals from "../../shared/globals";

const { unknown_error } = globals;

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
