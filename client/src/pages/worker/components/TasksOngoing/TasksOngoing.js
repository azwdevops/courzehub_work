// import installed packages
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import moment from "moment";
// import styles
import "./TasksOngoing.scss";
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import API from "../../../../shared/axios";
// import components/pages
import MaxDialog from "../../../../components/common/MaxDialog";
// import redux API
import { START_LOADING, STOP_LOADING } from "../../../../redux/actions/types";
import { showError } from "../../../../redux/actions/shared";

const TasksOngoing = (props) => {
  const { openTasksOngoing, userId, loading } = props;
  const { setOpenTasksOngoing, startLoading, stopLoading } = props;
  const [ongoingTasks, setOngoingTasks] = useState([]);
  const [taskAttachment, setTaskAttachment] = useState("");

  // useEffect to get available tasks
  useEffect(() => {
    if (userId) {
      startLoading();
      const fetchData = async () => {
        const url = `/api/work/worker-tasks-ongoing/${userId}/`;
        await API.get(url).then((res) => {
          setOngoingTasks(res.data?.ongoing_tasks);
        });
      };
      fetchData()
        .catch((err) => showError(err))
        .finally(() => stopLoading());
    }
  }, [startLoading, stopLoading, userId]);

  const handleFileChange = (e) => {
    setTaskAttachment(e.target.files[0]);
  };

  // function to handle work submission
  const handleSubmit = (e, taskId) => {
    e.preventDefault();
    if (taskAttachment === "") {
      return window.alert(`Please attach a valid file`);
    }
    startLoading();
    const postData = async () => {
      const url = `/api/work/worker-tasks-ongoing/${userId}/`;
      let body = new FormData();
      body.append("attachment", taskAttachment, taskAttachment.name);
      body.append("taskId", taskId);
      await API.post(url, body).then((res) => {
        setOngoingTasks(
          ongoingTasks?.filter((task) => task.id !== res.data?.taskId)
        );
        return window.alert(res.data?.detail);
      });
    };
    postData()
      .catch((err) => showError(err))
      .finally(() => stopLoading());
  };

  // function to handle returning a task
  const handleReturnTask = async (taskSubmissionId) => {
    if (window.confirm("Are you sure you want to return this task?")) {
      const url = `/api/work/worker-tasks-ongoing/${userId}/`;
      startLoading();
      await API.patch(url, { taskSubmissionId })
        .then((res) => {
          setOngoingTasks(
            ongoingTasks?.filter(
              (ongoing_task) => ongoing_task?.id !== taskSubmissionId
            )
          );
          window.alert(res.data?.detail);
        })
        .catch((err) => showError(err))
        .finally(() => stopLoading());
    }
  };

  return (
    <MaxDialog isOpen={openTasksOngoing} maxWidth="1400px">
      <div className="dialog" id={loading ? "pageSubmitting" : ""}>
        <h3>Tasks Ongoing</h3>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "45%" }}
          />
        )}
        {ongoingTasks?.length > 0 ? (
          <table className="table__listing">
            <tr className="table__listingHeader">
              <th>No:</th>
              <th>Title</th>
              <th>Taken On</th>
              <th>Status</th>
              <th>Requirements</th>
              <th>Submit Work</th>
              <th title="return if unable to complete task">Return Task ?</th>
            </tr>
            {ongoingTasks?.map((ongoing_task, index) => (
              <tr className="table__listingItem">
                <td>{index + 1}</td>
                <td>{ongoing_task?.task}</td>
                <td>{moment(ongoing_task?.taken_on).format("LLL")}</td>
                <td>{ongoing_task?.submission_status}</td>
                <td>
                  <Link
                    to={`${ongoing_task?.attachment}`}
                    className="button dodgerblue bd"
                    target="_blank"
                  >
                    Open
                  </Link>
                </td>
                <td className="task__submissionForm">
                  <form onSubmit={(e) => handleSubmit(e, ongoing_task?.id)}>
                    <input type="file" name="" onChange={handleFileChange} />
                    <button type="submit" className="add__button">
                      Submit
                    </button>
                  </form>
                </td>
                <td
                  className="button__sp red bd"
                  onClick={() => handleReturnTask(ongoing_task?.id)}
                >
                  Return
                </td>
              </tr>
            ))}
          </table>
        ) : (
          <h4 className="not__available">No ongoing tasks</h4>
        )}
        <div className="form__Buttons">
          <button type="button" onClick={() => setOpenTasksOngoing(false)}>
            Close
          </button>
        </div>
      </div>
    </MaxDialog>
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

export default connect(mapStateToProps, mapDispatchToProps)(TasksOngoing);
