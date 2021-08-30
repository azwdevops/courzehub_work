// import installed packages
import { useEffect, useState } from "react";
import { connect } from "react-redux";

// import styles
import "../styles/pages/Profile.css";
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
import { ifEmpty } from "../shared/sharedFunctions";
// import components/pages
import ChangePassword from "../components/users/ChangePassword";
// import redux API
import { OPEN_CHANGE_PASSWORD, START_LOADING } from "../redux/actions/types";
import { update_user } from "../redux/actions/auth";

const Profile = (props) => {
  const {
    first_name,
    last_name,
    username,
    email,
    bio,
    userId,
    loading,
  } = props; // extract state from props
  const { startLoading, updateUser, openChangePassword } = props; // extract dispatch actions from props
  // internal state
  const [updatedUser, setUpdatedUser] = useState({});

  useEffect(() => {
    setUpdatedUser({
      first_name,
      last_name,
      username,
      email,
      bio,
    });
  }, [first_name, last_name, email, username, bio]);

  // function to update user details
  const updateUserDetails = (e) => {
    e.preventDefault();
    if (ifEmpty(updatedUser)) {
      alert("Fill all fields are to update your profile");
    }
    startLoading();
    // call the signup action creator
    updateUser(updatedUser, userId);
  };

  // handle change function
  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile" id={loading ? "formSubmitting" : ""}>
      <h2>Profile Details</h2>
      <div className="profile__row">
        <span>
          <label htmlFor="">First Name</label>
          <input
            type="text"
            name="first_name"
            value={updatedUser.first_name}
            onChange={handleChange}
          />
        </span>
        <span>
          <label htmlFor="">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={updatedUser.last_name}
            onChange={handleChange}
          />
        </span>
      </div>
      {loading && (
        <CircularProgress style={{ position: "absolute", marginLeft: "30%" }} />
      )}
      <div className="profile__row">
        <span>
          <label htmlFor="">Username</label>
          <input
            type="text"
            name="username"
            value={updatedUser.username}
            onChange={handleChange}
          />
        </span>
        <span>
          <label htmlFor="">Email</label>
          <input
            type="email"
            name="email"
            value={updatedUser.email}
            onChange={handleChange}
          />
        </span>
      </div>

      <div className="profile__rowSingleItem">
        <label htmlFor="">Bio</label>
        <textarea name="bio" value={updatedUser.bio} onChange={handleChange} />
      </div>
      <div className="profile__Buttons">
        <button
          type="button"
          className="change__password"
          onClick={openChangePassword}
        >
          Change Password
        </button>
        <button type="submit" className="update" onClick={updateUserDetails}>
          Update Profile
        </button>
      </div>

      {/* linked components */}
      <ChangePassword />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    first_name: state.auth.user?.first_name,
    last_name: state.auth.user?.last_name,
    username: state.auth.user?.username,
    email: state.auth.user?.email,
    bio: state.auth.user?.bio,
    userId: state.auth.user?.id,
    loading: state.shared?.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    updateUser: (updatedUser, userId) =>
      dispatch(update_user(updatedUser, userId)),
    openChangePassword: () => dispatch({ type: OPEN_CHANGE_PASSWORD }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
