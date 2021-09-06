// import installed packages
import { useState } from "react";
import TasksAvailable from "../components/TasksAvailable/TasksAvailable";
import TasksOngoing from "../components/TasksOngoing/TasksOngoing";
import TasksSubmitted from "../components/TasksSubmitted/TasksSubmitted";
// import styles
import "./WorkCenter.css";
// import material ui items
// import shared/global items
// import components/pages
// import redux API

const WorkCenter = () => {
  const [openTasksAvailable, setOpenTasksAvailable] = useState(false);
  const [openTasksOngoing, setOpenTasksOngoing] = useState(false);
  const [openTasksSubmitted, setOpenTasksSubmitted] = useState(false);

  return (
    <>
      <div className="table__parent">
        <div className="table__parentHeader">
          <h3>Your Work Center</h3>
        </div>
        <table className="table__listing">
          <tr className="table__listingHeader">
            <th>Type</th>
            <th>Action</th>
          </tr>
          <tr className="table__listingItem">
            <td>Tasks Available</td>
            <td
              className="button dodgerblue bd"
              onClick={() => setOpenTasksAvailable(true)}
            >
              View
            </td>
          </tr>
          <tr className="table__listingItem">
            <td>Ongoing Tasks</td>
            <td
              className="button dodgerblue bd"
              onClick={() => setOpenTasksOngoing(true)}
            >
              View
            </td>
          </tr>
          <tr className="table__listingItem">
            <td>Submitted Tasks</td>
            <td
              className="button dodgerblue bd"
              onClick={() => setOpenTasksSubmitted(true)}
            >
              View
            </td>
          </tr>
        </table>
      </div>
      {/* child components */}
      {openTasksAvailable && (
        <TasksAvailable
          openTasksAvailable={openTasksAvailable}
          setOpenTasksAvailable={setOpenTasksAvailable}
        />
      )}
      {openTasksOngoing && (
        <TasksOngoing
          openTasksOngoing={openTasksOngoing}
          setOpenTasksOngoing={setOpenTasksOngoing}
        />
      )}
      {openTasksSubmitted && (
        <TasksSubmitted
          openTasksSubmitted={openTasksSubmitted}
          setOpenTasksSubmitted={setOpenTasksSubmitted}
        />
      )}
    </>
  );
};

export default WorkCenter;
