// import installed packages
import { useState } from "react";
import { connect } from "react-redux";
// import styles

// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items

// import components/pages
import MinDialog from "../../../../components/common/MinDialog";

// import redux API
import { START_LOADING } from "../../../../redux/actions/types";
import { add_or_remove_organization_admin } from "../../../../redux/actions/work";

const AddOrganizationAdmin = (props) => {
  const { openAddOrganizationAdmin, userId, loading, organizationId } = props;
  const { setOpenAddOrganizationAdmin, addOrganizationAdmin, startLoading } =
    props;
  const [userEmail, setUserEmail] = useState("");

  const resetForm = () => {
    setUserEmail("");
  };

  const handleClose = () => {
    setOpenAddOrganizationAdmin(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userEmail.trim() === "") {
      return window.alert("Please enter a valid email");
    }
    const body = {
      userEmail,
      actionType: "add_organization_admin",
      organizationId,
    };
    startLoading();
    addOrganizationAdmin(userId, body, resetForm);
  };

  return (
    <MinDialog isOpen={openAddOrganizationAdmin} maxWidth="500px">
      <form
        className="dialog"
        id={loading ? "formSubmitting" : ""}
        onSubmit={handleSubmit}
      >
        <h3>Enter user email</h3>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "40%" }}
          />
        )}
        <div className="dialog__rowSingleItem">
          <label htmlFor="">Email</label>
          <input
            type="email"
            onChange={(e) => setUserEmail(e.target.value)}
            value={userEmail}
          />
        </div>

        <div className="form__Buttons">
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="submit">Submit</button>
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
    addOrganizationAdmin: (userId, body, resetForm) =>
      dispatch(add_or_remove_organization_admin(userId, body, resetForm)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddOrganizationAdmin);
