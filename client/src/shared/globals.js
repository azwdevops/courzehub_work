const globals = {
  success: "success",
  error: "error",
  fillFields: "Please fill all fields",
  unknown_error: "An unknown error occurred, please try again later",
  dev: true,
  testProduction: false, // for use in heroku
  liveProduction: false, // for work.courzehub.com domain
  devHome: "http://localhost:8000", // for local development
  testHome: "https://courzehub-work.herokuapp.com", // for heroku production
  productionHome: "https://work.courzehub.com", // for live production
};
export default globals;
