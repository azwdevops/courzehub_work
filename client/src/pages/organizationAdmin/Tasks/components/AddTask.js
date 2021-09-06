// import installed packages
import { useState } from "react";
import { connect } from "react-redux";
// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import { ifEmpty, resetFormValues } from "../../../../shared/sharedFunctions";
// import components/pages
import MediumDialog from "../../../../components/common/MediumDialog";
import Markdown from "../../../../components/common/Markdown/Markdown";
// import redux API
import { START_LOADING } from "../../../../redux/actions/types";
import { new_organization_task } from "../../../../redux/actions/work";

const AddTask = (props) => {
  const { openAddTask, loading, userId } = props;
  const { setOpenAddTask, startLoading, newOrganizationTask } = props;
  const [newTask, setNewTask] = useState({
    title: "",
    user_minimum_rating: "",
    status: "",
    attachment: "",
  });
  const [instructions, setInstructions] = useState("");

  // DESTRUCTURING
  const { title, user_minimum_rating, status, attachment } = newTask;

  const handleChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.files[0] });
  };

  const resetForm = () => {
    resetFormValues(newTask);
    setInstructions("");
  };
  const handleClose = () => {
    resetForm();
    setOpenAddTask(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ifEmpty(newTask) || instructions.trim() === "") {
      return window.alert("Please fill all fields");
    }
    if (user_minimum_rating > 5 || user_minimum_rating < 1) {
      return window.alert(
        "User qualification rating should be between 1 and 5"
      );
    }
    startLoading();
    let formData = new FormData();
    formData.append("attachment", attachment, attachment.name);
    formData.append("user_minimum_rating", user_minimum_rating);
    formData.append("status", status);
    formData.append("title", title);
    formData.append("instructions", instructions);
    newOrganizationTask(userId, formData, resetForm);
  };

  return (
    <MediumDialog isOpen={openAddTask} maxWidth="850px">
      <form
        className="dialog"
        onSubmit={handleSubmit}
        id={loading ? "formSubmitting" : ""}
      >
        <h3>Task details</h3>
        <div className="dialog__row">
          <span>
            <label htmlFor="">Title</label>
            <input
              type="text"
              name="title"
              onChange={handleChange}
              value={title}
            />
          </span>
          <span title="The minimum qualification required for workers to work on this task">
            <label htmlFor="">User Qualification Rating (1 - 5)</label>
            <input
              type="number"
              name="user_minimum_rating"
              onChange={handleChange}
              value={user_minimum_rating}
              min="1"
              max="5"
            />
          </span>
        </div>
        {loading && (
          <CircularProgress
            style={{ position: "absolute", marginLeft: "43%" }}
          />
        )}
        <div className="dialog__row">
          <span>
            <label htmlFor="">Task Status</label>
            <select name="status" onChange={handleChange} value={status}>
              <option value="" disabled selected>
                ---select---
              </option>
              <option value="draft">Draft</option>
              <option value="available">Published</option>
            </select>
          </span>
          <span>
            <label htmlFor="">Task Attachment</label>
            <input type="file" name="attachment" onChange={handleFileChange} />
          </span>
        </div>
        <div className="dialog__rowSingleItem">
          <label htmlFor="">Task Instructions</label>
          <Markdown content={instructions} setContent={setInstructions} />
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
    newOrganizationTask: (userId, body, resetForm) =>
      dispatch(new_organization_task(userId, body, resetForm)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(AddTask);
