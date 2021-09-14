// import installed packages
import { useState } from "react";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import { ifEmpty, resetFormValues } from "../../../../shared/sharedFunctions";
import API from "../../../../shared/axios";
// import components/pages
import MediumDialog from "../../../../components/common/MediumDialog";

// import redux API
import { showError } from "../../../../redux/actions/shared";

const RateWork = (props) => {
  const {
    openWorkRating,
    currentTaskSubmissionId,
    userId,
    loading,
    taskSubmissions,
  } = props;
  const { setOpenWorkRating, setTaskSubmissions, startLoading, stopLoading } =
    props;

  const [workRating, setWorkRating] = useState({
    submission_rating: "",
    review_notes: "",
    submission_status: "",
  });

  // DESTRUCTURING
  const { submission_rating, review_notes, submission_status } = workRating;

  const resetForm = () => {
    resetFormValues(workRating);
  };

  const handleClose = () => {
    setOpenWorkRating(false);
    resetForm();
  };

  const handleChange = (e) => {
    setWorkRating({ ...workRating, [e.target.name]: e.target.value });
  };

  // function to handle rating submission
  const rateWorkSubmission = (e) => {
    e.preventDefault();
    if (ifEmpty(workRating)) {
      return window.alert("Please fill all fields");
    }
    startLoading();
    const postData = async () => {
      const url = `/api/work/organization-admin-maintain-task-submissions/${userId}/${currentTaskSubmissionId}/`;
      const body = {
        ...workRating,
      };

      await API.post(url, body).then((res) => {
        if (submission_status === "rejected") {
          // if submission was rejected, remove it from submissions
          setTaskSubmissions(
            taskSubmissions.filter(
              (task_submission) =>
                task_submission.id !== currentTaskSubmissionId
            )
          );
        } else if (submission_status === "approved") {
          // if submission was approved, update the status
          setTaskSubmissions(
            taskSubmissions.map((task_submission) =>
              task_submission.id === res.data?.rated_submission?.id
                ? res.data?.rated_submission
                : task_submission
            )
          );
        }

        window.alert(res.data?.detail);
        setOpenWorkRating(false);
      });
    };
    postData()
      .catch((err) => showError(err))
      .finally(() => stopLoading());
  };

  return (
    <MediumDialog isOpen={openWorkRating} maxWidth="650px">
      <form
        className="dialog"
        id={loading ? "formSubmitting" : ""}
        onSubmit={rateWorkSubmission}
      >
        <h3>Rate the work submitted</h3>
        <div className="dialog__row">
          <span>
            <label htmlFor="">Rating (1 - 5)</label>
            <input
              type="number"
              name="submission_rating"
              onChange={handleChange}
              value={submission_rating}
              step="0.1"
              min="1"
              max="5"
            />
          </span>
          <span>
            <label htmlFor="">Action</label>
            <select
              name="submission_status"
              onChange={handleChange}
              value={submission_status}
            >
              <option value="" selected disabled>
                Select action
              </option>
              <option value="approved">Accept Work</option>
              <option value="rejected">Reject Work</option>
            </select>
          </span>
        </div>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "45%" }}
          />
        )}
        <div className="dialog__rowSingleItem">
          <label htmlFor="">Comments</label>
          <textarea
            name="review_notes"
            onChange={handleChange}
            value={review_notes}
          />
        </div>
        <div className="form__Buttons">
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </MediumDialog>
  );
};

export default RateWork;
