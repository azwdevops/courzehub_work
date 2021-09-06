// import installed packages
import { useState } from "react";
import { connect } from "react-redux";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import { ifEmpty } from "../../../shared/sharedFunctions";
// import components/pages
import Markdown from "../../../components/common/Markdown/Markdown";
import MediumDialog from "../../../components/common/MediumDialog";
// import redux API
import { START_LOADING } from "../../../redux/actions/types";
import { worker_application } from "../../../redux/actions/work";

const WorkerApplication = (props) => {
  const { openWorkerApplication, loading, userId } = props;
  const { setOpenWorkerApplication, startLoading, workerApplication } = props;
  const [description, setDescription] = useState("");
  const [applicationDetails, setApplicationDetails] = useState({
    mpesa_number: "",
    national_id: "",
    occupation: "",
  });

  const handleChange = (e) => {
    setApplicationDetails({
      ...applicationDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setOpenWorkerApplication(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ifEmpty(applicationDetails) || description.trim() === "") {
      return window.alert("Please fill all fields");
    }
    startLoading();
    const body = {
      ...applicationDetails,
      about_worker: description,
    };
    workerApplication(userId, body);
  };

  // DESTRUCTURING
  const { mpesa_number, national_id, occupation } = applicationDetails;
  return (
    <MediumDialog isOpen={openWorkerApplication} maxWidth="800px">
      <form
        className="dialog"
        onSubmit={handleSubmit}
        id={loading ? "formSubmitting" : ""}
      >
        <h3>Enter your details</h3>
        <div className="dialog__row">
          <span>
            <label htmlFor="">National ID</label>
            <input
              type="number"
              name="national_id"
              value={national_id}
              onChange={handleChange}
            />
          </span>
          <span>
            <label htmlFor="">Mpesa Number</label>
            <input
              type="number"
              name="mpesa_number"
              value={mpesa_number}
              onChange={handleChange}
            />
          </span>
        </div>
        <div className="dialog__rowSingleItem">
          <label htmlFor="">Occupation</label>
          <input
            type="text"
            name="occupation"
            onChange={handleChange}
            value={occupation}
          />
        </div>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "43%" }}
          />
        )}
        <div className="dialog__rowSingleItem">
          <label htmlFor="">About yourself</label>
          <Markdown content={description} setContent={setDescription} />
        </div>
        <div className="form__Buttons">
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </MediumDialog>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.shared?.loading,
    userId: state.auth.user?.id,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    workerApplication: (userId, body) =>
      dispatch(worker_application(userId, body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkerApplication);
