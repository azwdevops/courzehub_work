import { updateObject } from "../utility";
import * as actionTypes from "../actions/types";

const initialState = {
  organizations: [],
  organization_tasks: [],
  workers: [],
  workers_applications: [],
};

// add new organization
const addOrganization = (state, payload) => {
  return updateObject(state, {
    organizations: [...state.organizations, payload],
  });
};

// get all organizations
const getOrganizations = (state, payload) => {
  return updateObject(state, {
    organizations: payload,
  });
};

const updateOrganization = (state, payload) => {
  return updateObject(state, {
    organizations: state.organizations.map((organization) =>
      organization.organizationId === payload.organizationId
        ? payload
        : organization
    ),
  });
};

// organization admin create new task
const newOrganizationTask = (state, payload) => {
  return updateObject(state, {
    organization_tasks: [...state.organization_tasks, payload],
  });
};

// organization admin get all tasks
const getAllTasks = (state, payload) => {
  return updateObject(state, {
    organization_tasks: payload,
  });
};

// organization admin edit task
const editOrganizationTask = (state, payload) => {
  return updateObject(state, {
    organization_tasks: state.organization_tasks?.map((task) =>
      task.id === payload.id ? payload : task
    ),
  });
};

// system admin get all workers
const getWorkers = (state, payload) => {
  return updateObject(state, {
    workers: payload.workers,
    workers_applications: payload.workers_applications,
  });
};

// system admin edit worker or application
const editWorkerOrApplication = (state, payload) => {
  console.log(payload.action_type);
  // edit if worker is being edited
  if (payload.action_type === "worker") {
    return updateObject(state, {
      workers: state.workers?.map((worker) =>
        worker.id === payload.id ? payload : worker
      ),
    });
  }
  // edit if worker application is being is being edited
  else if (payload.action_type === "worker_application") {
    return updateObject(state, {
      workers_applications: state.workers_applications?.map(
        (worker_application) =>
          worker_application.id === payload.id ? payload : worker_application
      ),
    });
  } else if (payload.action_type === "worker_and_application") {
    return updateObject(state, {
      workers_applications: state.workers_applications?.map(
        (worker_application) =>
          worker_application.id === payload.id ? payload : worker_application
      ),
      workers: [...state.workers, payload.worker_data],
    });
  }
};

const workReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.ADD_ORGANIZATION:
      return addOrganization(state, payload);
    case actionTypes.GET_ORGANIZATIONS:
      return getOrganizations(state, payload);
    case actionTypes.UPDATE_ORGANIZATION:
      return updateOrganization(state, payload);
    case actionTypes.NEW_ORGANIZATION_TASK:
      return newOrganizationTask(state, payload);
    case actionTypes.GET_TASKS:
      return getAllTasks(state, payload);
    case actionTypes.EDIT_ORGANIZATION_TASK:
      return editOrganizationTask(state, payload);
    case actionTypes.GET_WORKERS:
      return getWorkers(state, payload);
    case actionTypes.EDIT_WORKER:
      return editWorkerOrApplication(state, payload);
    default:
      return state;
  }
};

export default workReducer;
