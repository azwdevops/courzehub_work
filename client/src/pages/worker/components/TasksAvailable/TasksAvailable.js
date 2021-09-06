// import installed packages
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
// import styles
// import material ui items
// import shared/global items
import API from "../../../../shared/axios";
// import components/pages
import MaxDialog from "../../../../components/common/MaxDialog";
// import redux API
import { START_LOADING, STOP_LOADING } from "../../../../redux/actions/types";
import { showError } from "../../../../redux/actions/shared";
import Instructions from "./components/Instructions";

const TasksAvailable = (props) => {
  const { openTasksAvailable, userId, loading } = props;
  const { setOpenTasksAvailable, startLoading, stopLoading } = props;

  const [availableTasks, setAvailableTasks] = useState([]);

  const [openInstructions, setOpenInstructions] = useState(false);
  const [currentTask, setCurrentTask] = useState({});

  // useEffect to get available tasks
  useEffect(() => {
    if (userId) {
      startLoading();
      const fetchData = async () => {
        const url = `/api/work/worker-get-tasks-available/${userId}/`;
        await API.get(url).then((res) => {
          setAvailableTasks(res.data?.available_tasks);
        });
      };
      fetchData()
        .catch((err) => showError(err))
        .finally(() => stopLoading());
    }
  }, [startLoading, stopLoading, userId]);

  const handleOpenInstructions = (task) => {
    setCurrentTask(task);
    setOpenInstructions(true);
  };

  return (
    <>
      <MaxDialog isOpen={openTasksAvailable} maxWidth="1200px">
        <div className="dialog" id={loading ? "pageSubmitting" : ""}>
          <h3>Tasks available</h3>
          {availableTasks?.length > 0 ? (
            <table className="table__listing">
              <tr className="table__listingHeader">
                <th>No:</th>
                <th>Title</th>
                <th>Instructions</th>
                <th>Attachment</th>
              </tr>
              {availableTasks?.map((task, index) => (
                <tr className="table__listingItem" key={task?.id}>
                  <td>{index + 1}</td>
                  <td>{task?.title}</td>
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
