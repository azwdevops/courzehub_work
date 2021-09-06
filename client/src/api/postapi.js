import API from "../shared/axios";

// user routes

// signup
export const signupUser = (newUser) => API.post("/api/user/signup/", newUser);
// activate user account
export const activateAccount = (activation_token) =>
  API.post("/api/user/activate-user-account/", { activation_token });

// resend account activation email
export const resendActivation = (email) =>
  API.post("/api/user/resend-account-activation-link/", { email });

// sign in user
export const signIn = (loginData) => API.post("/api/user/login/", loginData);

// send password reset email
export const resetPassword = (email) =>
  API.post("/api/user/user-request-password-reset/", { email });

// set new password using reset link sent from above
export const setPassword = (newPasswords, password_token) =>
  API.post("/api/user/user-set-new-password/", {
    ...newPasswords,
    password_token,
  });

// user change password
export const changePassword = (passwords, userId) =>
  API.post(`/api/user/change-user-password/${userId}/`, passwords);

// WORK API
export const addOrganization = (userId, body) =>
  API.post(`/api/work/maintain-organizations/${userId}/`, body);

// organization admin create task API
export const newOrganizationTask = (userId, body) =>
  API.post(`/api/work/maintain-organization-tasks/${userId}/`, body);

// worker application
export const workerApplication = (userId, body) =>
  API.post(`/api/work/worker-application/${userId}/`, body);
