// import installed packages
import { useState, useEffect } from "react";
import { connect } from "react-redux";

// import styles

// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items

// import components/pages
import AddOrganization from "./components/AddOrganization";
import AddOrganizationAdmin from "./components/AddOrganizationAdmin";
// import redux API
import { START_LOADING } from "../../../redux/actions/types";
import {
  add_or_remove_organization_admin,
  get_organizations,
} from "../../../redux/actions/work";

const MaintainOrganizations = (props) => {
  const { organizations, userId, loading } = props;
  const { getOrganizations, startLoading, removeOrganizationAdmin } = props;
  const [openAddOrganization, setOpenAddOrganization] = useState(false);
  const [openAddOrganizationAdmin, setOpenAddOrganizationAdmin] =
    useState(false);
  const [currentOrganizationId, setCurrentOrganizationId] = useState({});

  // useEffect to get all organizations
  useEffect(() => {
    if (userId && organizations?.length === 0) {
      startLoading();
      getOrganizations(userId);
    }
  }, [startLoading, getOrganizations, organizations?.length, userId]);

  const openAddOrganizationAdminForm = (organizationId) => {
    setOpenAddOrganizationAdmin(true);
    setCurrentOrganizationId(organizationId);
  };

  // since reset form is an argument in add_or_remove action call, we just define and empty resetform function
  const resetForm = () => {};

  // function to handle remove organization admin
  const deleteOrganizationAdmin = (organizationId) => {
    if (
      window.confirm(`Are you sure you want to remove this organization admin?`)
    ) {
      startLoading();
      const body = {
        actionType: "remove_organization_admin",
        organizationId,
      };
      removeOrganizationAdmin(userId, body, resetForm);
    }
  };

  return (
    <>
      <div className="table__parent" id={loading ? "pageSubmitting" : ""}>
        <div className="table__parentHeader">
          <button
            type="button"
            className="add__button"
            onClick={() => setOpenAddOrganization(true)}
          >
            Add
          </button>
          <h3> Maintain organizations here</h3>
          {loading && <CircularProgress style={{ position: "absolute" }} />}
        </div>
        <table className="table__listing">
          {organizations?.length > 0 ? (
            <>
              <tr className="table__listingHeader">
                <th>No:</th>
                <th>Name</th>
                <th>Initials</th>
                <th>Admin</th>
              </tr>
              {organizations?.map((organization, index) => (
                <tr className="table__listingItem" key={organization?.id}>
                  <td>{index + 1}</td>
                  <td>{organization.name}</td>
                  <td>{organization.initials}</td>
                  {organization?.organization_admin_email ? (
                    <td
                      className="remove__item"
                      title="Click to remove admin"
                      onClick={() => deleteOrganizationAdmin(organization?.id)}
                    >
                      {organization?.organization_admin_email}
                    </td>
                  ) : (
                    <td
                      className="button dodgerblue bd"
                      onClick={() =>
                        openAddOrganizationAdminForm(organization?.id)
                      }
                    >
                      add
                    </td>
                  )}
                </tr>
              ))}
            </>
          ) : (
            <h4 className="not__available">No organizations available</h4>
          )}
        </table>
      </div>
      {/* child components */}
      {openAddOrganization && (
        <AddOrganization
          openAddOrganization={openAddOrganization}
          setOpenAddOrganization={setOpenAddOrganization}
        />
      )}
      {openAddOrganizationAdmin && (
        <AddOrganizationAdmin
          openAddOrganizationAdmin={openAddOrganizationAdmin}
          setOpenAddOrganizationAdmin={setOpenAddOrganizationAdmin}
          organizationId={currentOrganizationId}
        />
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    organizations: state.work?.organizations,
    userId: state.auth.user?.id,
    loading: state.shared?.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    getOrganizations: (userId) => dispatch(get_organizations(userId)),
    removeOrganizationAdmin: (userId, body, resetForm) =>
      dispatch(add_or_remove_organization_admin(userId, body, resetForm)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MaintainOrganizations);
