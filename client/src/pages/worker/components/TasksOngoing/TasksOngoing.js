// import installed packages
// import styles
// import material ui items
// import shared/global items
// import components/pages
import MaxDialog from "../../../../components/common/MaxDialog";
// import redux API

const TasksOngoing = (props) => {
  const { openTasksOngoing } = props;
  const { setOpenTasksOngoing } = props;

  return (
    <MaxDialog isOpen={openTasksOngoing} maxWidth="1200px">
      <div className="dialog">
        <h3>Tasks Ongoing</h3>
        <div className="form__Buttons">
          <button type="button" onClick={() => setOpenTasksOngoing(false)}>
            Close
          </button>
        </div>
      </div>
    </MaxDialog>
  );
};

export default TasksOngoing;
