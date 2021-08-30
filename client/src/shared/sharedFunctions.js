// check if any field in an object is empty
export const ifEmpty = (object) => {
  for (const i in object) {
    if (`${object[i]}` === "") {
      return true;
    }
  }
  return false;
};

// function to reset form values to blank
export const resetFormValues = (object) => {
  for (const i in object) {
    object[i] = "";
  }
};

// function to get max date to display on user entry form
export const maxDate = () => {
  const today = new Date();
  const day = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
  const month =
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1;
  const max_date = today.getFullYear() + "-" + month + "-" + day;
  return max_date;
};

// function to get min date to display on exam date
export const minDate = () => {
  const today = new Date();
  const day = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
  const month =
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1;
  const min_date = today.getFullYear() + "-" + month + "-" + day;
  return min_date;
};
