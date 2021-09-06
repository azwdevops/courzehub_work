import { combineReducers } from "redux";

import auth from "./auth";
import shared from "./shared";
import work from "./work";

export default combineReducers({
  auth,
  shared,
  work,
});
