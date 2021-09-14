// import installed packages
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import API from "../../../../shared/axios";
// import components/pages
import MaxDialog from "../../../../components/common/MaxDialog";
import Instructions from "./components/Instructions";
// import redux API
import { START_LOADING, STOP_LOADING } from "../../../../redux/actions/types";
import { showError } from "../../../../redux/actions/shared";

const TasksAvailable = (props) => {
  const { openTasksAvailable, userId, loading } = props;
  const { setOpenTasksAvailable, startLoading, stopLoading } = props;
  const [availableTasks, setAvailableTasks] = useState([]);

  const [openInstructions, setOpenInstructions] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [checkTasks, setCheckTasks] = useState(true);

  // useEffect to get available tasks
  useEffect(() => {
    if (userId && checkTasks) {
      startLoading();
      const fetchData = async () => {
        const url = `/api/work/worker-tasks-available/${userId}/`;
        await API.get(url).then((res) => {
          setAvailableTasks(res.data?.available_tasks);
        });
      };
      fetchData()
        .catch((err) => showError(err))
        .finally(() => {
          setCheckTasks(false);
          stopLoading();
        });
    }
  }, [startLoading, stopLoading, userId, checkTasks]);

  // function to get tasks available
  const getTasks = () => {
    setCheckTasks(true);
  };

  const handleOpenInstructions = (task) => {
    setCurrentTask(task);
    setOpenInstructions(true);
  };

  // function to accept task
  const acceptTask = (e, taskId) => {
    e.preventDefault();
    if (window.confirm(`Accept this task and start working`)) {
      startLoading();
      const postData = async () => {
        const url = `/api/work/worker-tasks-available/${userId}/`;
        const body = {
          taskId,
        };
        await API.post(url, body).then((res) => {
          // remove taken task from available tasks
          setAvailableTasks(
            availableTasks.filter((task) => task.id !== res.data?.taskId)
          );
          return window.alert(res.data?.detail);
        });
      };
      postData()
        .catch((err) => showError(err))
        .finally(() => stopLoading());
    }
  };

  return (
    <>
      <MaxDialog isOpen={openTasksAvailable} maxWidth="1200px">
        <div className="dialog" id={loading ? "pageSubmitting" : ""}>
          <h3>Tasks available</h3>
          {loading && (
            <CircularProgress
              style={{ position: "absolute", marginLeft: "45%" }}
            />
          )}
          {availableTasks?.length > 0 ? (
            <table className="table__listing">
              <tr className="table__listingHeader">
                <th>No:</th>
                <th>Title</th>
                <th>Wage (KES)</th>
                <th>Instructions</th>
                <th>Attachment</th>
                <th>Action</th>
              </tr>
              {availableTasks?.map((task, index) => (
                <tr className="table__listingItem" key={task?.id}>
                  <td>{index + 1}</td>
                  <td>{task?.title}</td>
                  <td>{task?.amount}</td>
                  <td
                    className="button dodgerblue bd"
                    onClick={() => handleOpenInstructions(task)}
                  >
                    view
                  </td>
                  <td>
                    <Link
                      to={`${task?.attachment}`}
                      className="button dodgerblue bd"
                      target="_blank"
                    >
                      Open
                    </Link>
                  </td>
                  <td
                    className="dodgerblue bd button"
                    onClick={(e) => acceptTask(e, task?.id)}
                  >
                    Accept
                  </td>
                </tr>
              ))}
            </table>
          ) : (
            <h4 className="not__available">No tasks available</h4>
          )}
          <div className="form__Buttons">
            <button type="button" onClick={() => setOpenTasksAvailable(false)}>
              Close
            </button>
            <button type="button" onClick={getTasks}>
              Refresh
            </button>
          </div>
        </div>
      </MaxDialog>
      {openInstructions && (
        <Instructions
          openInstructions={openInstructions}
          setOpenInstructions={setOpenInstructions}
          currentTask={currentTask}
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

export default connect(mapStateToProps, mapDispatchToProps)(TasksAvailable);
