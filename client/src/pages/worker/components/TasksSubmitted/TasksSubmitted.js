// import installed packages
// import styles
// import material ui items
// import shared/global items
// import components/pages
import MaxDialog from "../../../../components/common/MaxDialog";
// import redux API

const TasksSubmitted = (props) => {
  const { openTasksSubmitted } = props;
  const { setOpenTasksSubmitted } = props;

  return (
    <MaxDialog isOpen={openTasksSubmitted} maxWidth="1200px">
      <div className="dialog">
        <h3>Tasks Submitted</h3>
        <div className="form__Buttons">
          <button type="button" onClick={() => setOpenTasksSubmitted(false)}>
            Close
          </button>
        </div>
      </div>
    </MaxDialog>
  );
};

export default TasksSubmitted;
