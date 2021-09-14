// import installed packages

import { connect } from "react-redux";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
// import components/pages
import MinDialog from "../../../../components/common/MinDialog";
// import redux API
import { START_LOADING } from "../../../../redux/actions/types";
import { edit_worker_or_application } from "../../../../redux/actions/work";

const EditWorker = (props) => {
  const { openEditWorker, currentWorker, userId, loading } = props;
  const {
    setOpenEditWorker,
    setCurrentWorker,
    startLoading,
    editWorkerOrApplication,
  } = props;

  const handleChange = (e) => {
    setCurrentWorker({ ...currentWorker, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      currentWorker?.profile_status === "disabled" &&
      (currentWorker?.disabled_notes?.trim() === "" ||
        currentWorker?.disabled_notes === null)
    ) {
      return window.alert(
        "Please indicate reason for disabling worker account"
      );
    } else if (
      currentWorker?.profile_status === "suspended" &&
      (currentWorker?.suspension_notes?.trim() === "" ||
        currentWorker?.suspension_notes === null)
    ) {
      return window.alert(
        "Please indicate reason for suspending worker account"
      );
    }
    const body = {
      workerId: currentWorker?.id,
      profile_status: currentWorker?.profile_status,
      worker_or_application: "worker",
      suspension_notes: currentWorker?.suspension_notes,
      disabled_notes: currentWorker?.disabled_notes,
    };
    startLoading();
    editWorkerOrApplication(userId, body);
  };

  return (
    <MinDialog isOpen={openEditWorker} maxWidth="600px">
      <form
        className="dialog"
        onSubmit={handleSubmit}
        id={loading ? "formSubmitting" : ""}
      >
        <h3>Update Worker</h3>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "43%" }}
          />
        )}
        <div className="dialog__rowSingleItem">
          <label htmlFor="">Worker Status</label>
          <select
            name="profile_status"
            value={currentWorker?.profile_status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        {currentWorker?.profile_status === "disabled" && (
          <div className="dialog__rowSingleItem">
            <label htmlFor="">Reason for disabling worker</label>
            <textarea
              name="disabled_notes"
              onChange={handleChange}
              value={currentWorker?.disabled_notes}
            />
          </div>
        )}
        {currentWorker?.profile_status === "suspended" && (
          <div className="dialog__rowSingleItem">
            <label htmlFor="">Reason for suspending worker</label>
            <textarea
              name="suspension_notes"
              onChange={handleChange}
              value={currentWorker?.suspension_notes}
            />
          </div>
        )}

        <div className="form__Buttons">
          <button type="button" onClick={() => setOpenEditWorker(false)}>
            Close
          </button>
          <button type="submit">Update</button>
        </div>
      </form>
    </MinDialog>
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
    editWorkerOrApplication: (userId, body) =>
      dispatch(edit_worker_or_application(userId, body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditWorker);
