import API from "../shared/axios";

// get user data
export const getUser = () => API.get("/api/user/get-user-data/");

// WORK API's

export const getOrganizations = (userId) =>
  API.get(`/api/work/maintain-organizations/${userId}/`);

// get all tasks for organization
export const getAllTasks = (userId) =>
  API.get(`/api/work/maintain-organization-tasks/${userId}/`);

// get worker applications
export const getWorkers = (userId) =>
  API.get(`/api/work/worker-application/${userId}/`);
