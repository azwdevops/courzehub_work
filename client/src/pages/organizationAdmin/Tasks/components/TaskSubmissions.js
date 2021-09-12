// import installed packages
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import API from "../../../../shared/axios";
// import components/pages
import MaxDialog from "../../../../components/common/MaxDialog";
// import redux API
import { START_LOADING, STOP_LOADING } from "../../../../redux/actions/types";
import { showError, stopLoading } from "../../../../redux/actions/shared";
import RateWork from "./RateWork";

const TaskSubmissions = (props) => {
  const { openTaskSubmissions, userId, currentTaskId, loading } = props;
  const { setOpenTaskSubmissions, startLoading, stopLoading } = props;
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [openWorkRating, setOpenWorkRating] = useState(false);
  const [currentTaskSubmission, setCurrentTaskSubmission] = useState({});

  useEffect(() => {
    startLoading();
    const fetchData = async () => {
      const url = `/api/work/organization-admin-maintain-task-submissions/${userId}/${currentTaskId}/`;
      await API.get(url).then((res) => {
        setTaskSubmissions(res.data?.task_submissions);
      });
    };
    fetchData()
      .catch((err) => showError(err))
      .finally(() => stopLoading());
  }, [startLoading, stopLoading, userId, currentTaskId]);

  // function to open work rating
  const openWorkRatingForm = (taskSubmission) => {
    setOpenWorkRating(true);
    setCurrentTaskSubmission(taskSubmission);
  };

  return (
    <>
      <MaxDialog isOpen={openTaskSubmissions} maxWidth="1300px">
        <div className="dialog" id={loading ? "formSubmitting" : ""}>
          <h3>Task submissions</h3>
          {loading && (
            <CircularProgress
              style={{ position: "absolute", marginLeft: "45%" }}
            />
          )}
          {taskSubmissions?.length > 0 ? (
            <table className="table__listing">
              <tr className="table__listingHeader">
                <th>No:</th>
                <th>Title</th>
                <th>Date Submitted</th>
                <th>Work Submitted</th>
                <th>Rating</th>
              </tr>
              {taskSubmissions?.map((task_submission, index) => (
                <tr className="table__listingItem">
                  <td>{index + 1}</td>
                  <td>{task_submission?.task}</td>
                  <td>{moment(task_submission?.submitted_on).format("LLL")}</td>
                  <td>
                    <Link
                      to={`${task_submission?.attachment}`}
                      className="button dodgerblue bd"
                      target="_blank"
                    >
                      View
                    </Link>
                  </td>
                  {task_submission?.submission_rating ? (
                    <td>{task_submission?.submission_rating}</td>
                  ) : (
                    <td
                      className="button dodgerblue bd"
                      onClick={() => openWorkRatingForm(task_submission)}
                    >
                      Rate Work
                    </td>
                  )}
                </tr>
              ))}
            </table>
          ) : (
            <h4 className="not__available">No task submissions yet</h4>
          )}
          <div className="form__Buttons">
            <button type="button" onClick={() => setOpenTaskSubmissions(false)}>
              Close
            </button>
          </div>
        </div>
      </MaxDialog>
      {/* child components */}
      {openTaskSubmissions && (
        <RateWork
          setOpenWorkRating={setOpenWorkRating}
          openWorkRating={openWorkRating}
          currentTaskSubmissionId={currentTaskSubmission?.id}
          setTaskSubmissions={setTaskSubmissions}
          taskSubmissions={taskSubmissions}
          stopLoading={stopLoading}
          startLoading={startLoading}
          userId={userId}
          loading={loading}
        />
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    userId: state.auth.user?.id,
    loading: state.shared?.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    stopLoading: () => dispatch({ type: STOP_LOADING }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskSubmissions);
