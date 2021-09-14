// import installed packages
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";

// import shared/global items
// import components/pages
import AddTask from "./components/AddTask";
import EditTask from "./components/EditTask";
// import redux API
import { START_LOADING } from "../../../redux/actions/types";
import { get_all_tasks } from "../../../redux/actions/work";
import TaskSubmissions from "./components/TaskSubmissions";

const MaintainTasks = (props) => {
  const { loading, organizationTasks, userId } = props;
  const { startLoading, getAllTasks } = props;
  const [openAddTask, setOpenAddTask] = useState(false);
  const [openEditTask, setOpenEditTask] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [openTaskSubmissions, setOpenTaskSubmissions] = useState(false);

  useEffect(() => {
    if (organizationTasks?.length === 0 && userId) {
      startLoading();
      getAllTasks(userId);
    }
  }, [userId, startLoading, organizationTasks?.length, getAllTasks]);

  const openEditTaskForm = (task) => {
    setOpenEditTask(true);
    setCurrentTask(task);
  };

  // open submissions form
  const openTaskSubmissionsForm = (task) => {
    setOpenTaskSubmissions(true);
    setCurrentTask(task);
  };

  return (
    <>
      <div className="table__parent">
        <div className="table__parentHeader">
          <button
            type="button"
            className="add__button"
            onClick={() => setOpenAddTask(true)}
          >
            Add
          </button>
          <h3> Maintain Tasks here</h3>
          {loading && <CircularProgress style={{ position: "absolute" }} />}
        </div>
        <table className="table__listing">
          {organizationTasks?.length > 0 ? (
            <>
              <tr className="table__listingHeader">
                <th>No:</th>
                <th>Title</th>
                <th>Edit</th>
                <th>Task Attachment</th>
                <th>Payment Status</th>
                <th>Submissions</th>
              </tr>
              {organizationTasks?.map((task, index) => (
                <tr className="table__listingItem">
                  <td>{index + 1}</td>
                  <td>{task?.title}</td>
                  <td
                    className="dodgerblue bd button__sp"
                    onClick={() => openEditTaskForm(task)}
                  >
                    edit
                  </td>
                  <td>
                    <Link
                      to={`${task?.attachment}`}
                      className="button dodgerblue bd"
                      target="_blank"
                    >
                      view
                    </Link>
                  </td>
                  <td>
                    {task?.payment_status === null ? (
                      <a
                        href={`/accounting/make-payment/${task?.id}/${
                          task?.amount
                        }/${Math.floor(Math.random() * 10000000)}/`}
                        className="red bd button"
                      >
                        Pay
                      </a>
                    ) : task?.payment_status === "paid" ? (
                      <span className="green bd button">Paid</span>
                    ) : (
                      task?.pesapal && (
                        <a
                          href={`/pesapal/transaction/completed/?pesapal_merchant_reference=${task?.pesapal_transaction?.pesapal_merchant_reference}&pesapal_transaction_tracking_id=${task?.pesapal_transaction?.pesapal_transaction_tracking_id}`}
                          className="dodgerblue bd button__sp"
                        >
                          Confirm Payment
                        </a>
                      )
                    )}
                  </td>
                  <td
                    className="button__sp dodgerblue bd"
                    onClick={() => openTaskSubmissionsForm(task)}
                  >
                    View
                  </td>
                </tr>
              ))}
            </>
          ) : (
            <h4 className="not__available">No tasks available</h4>
          )}
        </table>
      </div>
      {/* child components */}
      {openAddTask && (
        <AddTask openAddTask={openAddTask} setOpenAddTask={setOpenAddTask} />
      )}
      {openEditTask && (
        <EditTask
          openEditTask={openEditTask}
          setOpenEditTask={setOpenEditTask}
          currentTask={currentTask}
          setCurrentTask={setCurrentTask}
        />
      )}
      {openTaskSubmissions && (
        <TaskSubmissions
          openTaskSubmissions={openTaskSubmissions}
          setOpenTaskSubmissions={setOpenTaskSubmissions}
          currentTaskId={currentTask?.id}
        />
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    userId: state.auth.user?.id,
    loading: state.shared?.loading,
    organizationTasks: state.work?.organization_tasks,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    getAllTasks: (userId) => dispatch(get_all_tasks(userId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MaintainTasks);
