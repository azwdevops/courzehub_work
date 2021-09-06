import * as api from "../../api";
import * as actionTypes from "./types";

import { showError, stopLoading } from "./shared";

export const add_organization =
  (userId, body, resetForm) => async (dispatch) => {
    await api
      .addOrganization(userId, body)
      .then((res) => {
        resetForm();
        window.alert(res.data?.detail);
        dispatch({
          type: actionTypes.ADD_ORGANIZATION,
          payload: res.data?.organization_data,
        });
      })
      .catch((err) => showError(err))
      .finally(() => stopLoading(dispatch));
  };

// action to get organizations
export const get_organizations = (userId) => async (dispatch) => {
  await api
    .getOrganizations(userId)
    .then((res) => {
      dispatch({
        type: actionTypes?.GET_ORGANIZATIONS,
        payload: res.data?.organizations_data,
      });
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// sys admin action to add organization admin
export const add_or_remove_organization_admin =
  (userId, body, resetForm) => async (dispatch) => {
    await api
      .addOrRemoveOrganizationAdmin(userId, body)
      .then((res) => {
        resetForm();
        dispatch({
          type: actionTypes.UPDATE_ORGANIZATION,
          payload: res.data?.updated_organization,
        });
        window.alert(res.data?.detail);
      })
      .catch((err) => showError(err))
      .finally(() => stopLoading(dispatch));
  };

// organization admin add task
export const new_organization_task =
  (userId, body, resetForm) => async (dispatch) => {
    await api
      .newOrganizationTask(userId, body)
      .then((res) => {
        resetForm();
        dispatch({
          type: actionTypes.NEW_ORGANIZATION_TASK,
          payload: res.data?.new_task,
        });
        window.alert(res.data?.detail);
      })
      .catch((err) => showError(err))
      .finally(() => stopLoading(dispatch));
  };

// organization admin get all tasks
export const get_all_tasks = (userId) => async (dispatch) => {
  await api
    .getAllTasks(userId)
    .then((res) => {
      dispatch({ type: actionTypes.GET_TASKS, payload: res.data?.tasks_data });
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// organization admin edit task
export const edit_organization_task = (userId, body) => async (dispatch) => {
  await api
    .editOrganizationTask(userId, body)
    .then((res) => {
      dispatch({
        type: actionTypes.EDIT_ORGANIZATION_TASK,
        payload: res.data?.updated_task,
      });
      window.alert(res.data?.detail);
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// POST worker application apply action
export const worker_application = (userId, body) => async (dispatch) => {
  await api
    .workerApplication(userId, body)
    .then((res) => {
      window.alert(res.data?.detail);
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// get worker application action#
export const get_workers = (userId) => async (dispatch) => {
  await api
    .getWorkers(userId)
    .then((res) => {
      dispatch({ type: actionTypes.GET_WORKERS, payload: res.data });
    })
    .catch((err) => showError(err))
    .finally(() => stopLoading(dispatch));
};

// edit worker application
export const edit_worker_or_application =
  (userId, body) => async (dispatch) => {
    await api
      .editWorkerOrApplication(userId, body)
      .then((res) => {
        dispatch({
          type: actionTypes.EDIT_WORKER,
          payload: res.data?.updated_application,
        });
        window.alert(res.data?.detail);
      })
      .catch((err) => showError(err))
      .finally(() => stopLoading(dispatch));
  };
