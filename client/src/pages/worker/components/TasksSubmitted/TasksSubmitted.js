// import installed packages
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import API from "../../../../shared/axios";
// import components/pages
import MaxDialog from "../../../../components/common/MaxDialog";
// import redux API
import { showError } from "../../../../redux/actions/shared";
import { START_LOADING, STOP_LOADING } from "../../../../redux/actions/types";
import ReviewNotes from "./components/ReviewNotes";

const TasksSubmitted = (props) => {
  const { openTasksSubmitted, userId, loading } = props;
  const { setOpenTasksSubmitted, startLoading, stopLoading } = props;
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [openReviewNotes, setOpenReviewNotes] = useState(false);
  const [currentReviewNotes, setCurrentReviewNotes] = useState("");

  // useEffect to get available tasks
  useEffect(() => {
    if (userId) {
      startLoading();
      const fetchData = async () => {
        const url = `/api/work/worker-tasks-submitted/${userId}/`;
        await API.get(url).then((res) => {
          setSubmittedTasks(res.data?.submitted_tasks);
        });
      };
      fetchData()
        .catch((err) => showError(err))
        .finally(() => stopLoading());
    }
  }, [startLoading, stopLoading, userId]);

  // function to open review notes
  const openReviewNotesForm = (review) => {
    setOpenReviewNotes(true);
    setCurrentReviewNotes(review);
  };

  return (
    <>
      <MaxDialog isOpen={openTasksSubmitted} maxWidth="1300px">
        <div className="dialog">
          <h3>Tasks Submitted</h3>
          {loading && (
            <CircularProgress
              style={{ position: "absolute", marginLeft: "45%" }}
            />
          )}
          {submittedTasks?.length > 0 ? (
            <table className="table__listing">
              <tr className="table__listingHeader">
                <th>No:</th>
                <th>Title</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Review Notes</th>
              </tr>
              {submittedTasks?.map((submitted_task, index) => (
                <tr className="table__listingItem">
                  <td>{index + 1}</td>
                  <td>{submitted_task?.task}</td>
                  <td>{moment(submitted_task?.submitted_on).format("LLL")}</td>
                  <td>{submitted_task?.submission_status}</td>
                  <td>{submitted_task?.submission_rating}</td>
                  <td
                    className="button dodgerblue bd"
                    onClick={() =>
                      openReviewNotesForm(submitted_task?.review_notes)
                    }
                  >
                    view
                  </td>
                </tr>
              ))}
            </table>
          ) : (
            <h4 className="not__available">No submitted tasks</h4>
          )}
          <div className="form__Buttons">
            <button type="button" onClick={() => setOpenTasksSubmitted(false)}>
              Close
            </button>
          </div>
        </div>
      </MaxDialog>
      {openReviewNotes && (
        <ReviewNotes
          openReviewNotes={openReviewNotes}
          setOpenReviewNotes={setOpenReviewNotes}
          currentReviewNotes={currentReviewNotes}
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

export default connect(mapStateToProps, mapDispatchToProps)(TasksSubmitted);
