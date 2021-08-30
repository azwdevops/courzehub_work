import { v4 as uuid } from "uuid";
import { SET_ALERT, REMOVE_ALERT } from "./types";

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
