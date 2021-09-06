// import installed packages
import { useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { useState } from "react";

// import styles
// import material ui items
import CircularProgress from "@material-ui/core/CircularProgress";
// import shared/global items
// import components/pages
// import redux API
import { START_LOADING } from "../../../redux/actions/types";
import { get_workers } from "../../../redux/actions/work";
import EditWorkerApplication from "./components/EditWorkerApplication";

const MaintainWorkers = (props) => {
  const { workers, workers_applications, userId, loading } = props;
  const { startLoading, getWorkers } = props;
  const [openEditWorkerApplication, setOpenEditWorkerApplication] =
    useState(false);
  const [currentWorkerApplication, setCurrentWorkerApplication] = useState({});

  // useEffect to get all workers and applications
  useEffect(() => {
    if (workers_applications?.length === 0 && userId) {
      startLoading();
      getWorkers(userId);
    }
  }, [getWorkers, startLoading, userId, workers_applications?.length]);

  const openEditWorkerApplicationForm = (worker_application) => {
    setOpenEditWorkerApplication(true);
    setCurrentWorkerApplication(worker_application);
  };

  return (
    <>
      <div className="table__parent">
        <div className="table__parentHeader">
          <h3>Workers</h3>
          {loading && <CircularProgress style={{ position: "absolute" }} />}
        </div>
        <table className="table__listing">
          {workers?.length > 0 ? (
            <>
              <tr className="table__listingHeader">
                <th>No:</th>
                <th>Name</th>
              </tr>
              {workers?.map((worker, index) => (
                <tr className="table__listingItem">
                  <td>{index + 1}</td>
                  <td>{worker?.full_name}</td>
                </tr>
              ))}
            </>
          ) : (
            <h4 className="not__available">No workers yet</h4>
          )}
        </table>
        <div className="table__parentHeader">
          <h3>Workers applications</h3>
        </div>
        <table className="table__listing">
          {workers_applications?.length > 0 ? (
            <>
              <tr className="table__listingHeader">
                <th>No:</th>
                <th>Name</th>
                <th>Applied On</th>
                <th>Action</th>
              </tr>
              {workers_applications?.map((worker_application, index) => (
                <tr className="table__listingItem" key={worker_application?.id}>
                  <td>{index + 1}</td>
                  <td>{worker_application?.full_name}</td>
                  <td>{moment(worker_application.applied_on).format("LLL")}</td>
                  {worker_application?.status !== "approved" ? (
                    <td
                      className="button dodgerblue bd"
                      onClick={() =>
                        openEditWorkerApplicationForm(worker_application)
                      }
                    >
                      process
                    </td>
                  ) : (
                    <td>Approved</td>
                  )}
                </tr>
              ))}
            </>
          ) : (
            <h4 className="not__available">No workers applications yet</h4>
          )}
        </table>
      </div>
      {/* child components */}
      {openEditWorkerApplication && (
        <EditWorkerApplication
          openEditWorkerApplication={openEditWorkerApplication}
          setOpenEditWorkerApplication={setOpenEditWorkerApplication}
          currentWorkerApplication={currentWorkerApplication}
          setCurrentWorkerApplication={setCurrentWorkerApplication}
        />
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    workers: state.work?.workers,
    workers_applications: state.work?.workers_applications,
    loading: state.shared?.loading,
    userId: state.auth.user.id,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startLoading: () => dispatch({ type: START_LOADING }),
    getWorkers: (userId) => dispatch(get_workers(userId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MaintainWorkers);
