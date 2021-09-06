import API from "../shared/axios";

// patch user data
export const updateUser = (updatedUser, userId) =>
  API.patch(`/api/user/update-user-details/${userId}/`, updatedUser);

// WORK API's
export const addOrRemoveOrganizationAdmin = (userId, body) =>
  API.patch(`/api/work/maintain-organizations/${userId}/`, body);

// organization admin edit task API
export const editOrganizationTask = (userId, body) =>
  API.patch(`/api/work/maintain-organization-tasks/${userId}/`, body);

// system admin edit worker or application
export const editWorkerOrApplication = (userId, body) =>
  API.patch(`/api/work/worker-application/${userId}/`, body);
