// import installed packages
import { useState } from "react";
import { connect } from "react-redux";

// import styles

// import material ui items
import { CircularProgress } from "@material-ui/core";
// import shared/global items
import { ifEmpty, resetFormValues } from "../../../../shared/sharedFunctions";
// import components/pages

import MediumDialog from "../../../../components/common/MediumDialog";
import { START_LOADING } from "../../../../redux/actions/types";
import { add_organization } from "../../../../redux/actions/work";
// import redux API

const AddOrganization = (props) => {
  const { openAddOrganization, loading, userId } = props;
  const { setOpenAddOrganization, startLoading, addOrganization } = props;
  const [newOrganization, setNewOrganization] = useState({
    name: "",
    initials: "",
  });

  ////////// DESTRUCTURING VALUES
  const { name, initials } = newOrganization;

  const handleChange = (e) => {
    setNewOrganization({ ...newOrganization, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    resetFormValues(newOrganization);
  };

  const handleClose = () => {
    resetForm();
    setOpenAddOrganization(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ifEmpty(newOrganization)) {
      return window.alert("All fields are required");
    }
    startLoading();
    addOrganization(userId, newOrganization, resetForm);
  };

  return (
    <MediumDialog isOpen={openAddOrganization} maxWidth="800px">
      <form className="dialog" id={loading ? "formSubmitting" : ""}>
        <h3>Organization details</h3>
        <div className="dialog__row">
          <span>
            <label htmlFor="">Name</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              value={name}
            />
          </span>
          {loading && (
            <CircularProgress
              style={{ position: "absolute", marginLeft: "42%" }}
            />
          )}
          <span>
            <label htmlFor="">Initials</label>
            <input
              type="text"
              name="initials"
              onChange={handleChange}
              value={initials}
            />
          </span>
        </div>
        <div className="form__Buttons">
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
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
    addOrganization: (userId, body, resetForm) =>
      dispatch(add_organization(userId, body, resetForm)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddOrganization);
