// import installed packages
import { connect } from "react-redux";
import moment from "moment";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
// import components/pages
import MediumDialog from "../../../../components/common/MediumDialog";

// import redux API
import { START_LOADING } from "../../../../redux/actions/types";
import { edit_worker_or_application } from "../../../../redux/actions/work";

const EditWorkerApplication = (props) => {
  const {
    openEditWorkerApplication,
    currentWorkerApplication,
    loading,
    userId,
  } = props;
  const {
    setOpenEditWorkerApplication,
    setCurrentWorkerApplication,
    startLoading,
    editWorkerOrApplication,
  } = props;

  // DESTRUCTURING
  const {
    id,
    full_name,
    occupation,
    mpesa_number,
    national_id,
    applied_on,
    status,
    about_worker,
    rejection_reason,
  } = currentWorkerApplication;

  const handleChange = (e) => {
    setCurrentWorkerApplication({
      ...currentWorkerApplication,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setOpenEditWorkerApplication(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      status === "rejected" &&
      (rejection_reason === "" || rejection_reason === null)
    ) {
      return window.alert("You must indicate the rejection reason");
    }
    const body = {
      applicationId: id,
      rejection_reason,
      status,
      worker_or_application: "application",
    };
    startLoading();
    editWorkerOrApplication(userId, body);
  };

  return (
    <MediumDialog isOpen={openEditWorkerApplication} maxWidth="800px">
      <form
        className="dialog"
        onSubmit={handleSubmit}
        id={loading ? "formSubmitting" : ""}
      >
        <h3>Application details</h3>
        <div className="dialog__row">
          <span>
            <label htmlFor="">Name</label>
            <input type="text" value={full_name} disabled readOnly />
          </span>
          <span>
            <label htmlFor="">Occupation</label>
            <input type="text" value={occupation} disabled readOnly />
          </span>
        </div>
        <div className="dialog__row">
          <span>
            <label htmlFor="">Mpesa Number</label>
            <input type="text" value={mpesa_number} disabled readOnly />
          </span>
          <span>
            <label htmlFor="">National ID</label>
            <input type="text" value={national_id} disabled readOnly />
          </span>
        </div>
        <div className="dialog__row">
          <span>
            <label htmlFor="">Applied On</label>
            <input
              type="text"
              value={moment(applied_on).format("LLL")}
              disabled
              readOnly
            />
          </span>
          <span>
            <label htmlFor="">Status</label>
            <select name="status" value={status} onChange={handleChange}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </span>
        </div>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "43%" }}
          />
        )}
        <div className="dialog__rowSingleItem">
          <label htmlFor="">About User</label>
          <textarea value={about_worker} disabled readOnly />
        </div>
        {status === "rejected" && (
          <div className="dialog__rowSingleItem">
            <label htmlFor="">Rejection Reason</label>
            <textarea
              name="rejection_reason"
              value={rejection_reason}
              onChange={handleChange}
            />
          </div>
        )}
        <div className="form__Buttons">
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="submit">Update</button>
        </div>
      </form>
    </MediumDialog>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditWorkerApplication);
