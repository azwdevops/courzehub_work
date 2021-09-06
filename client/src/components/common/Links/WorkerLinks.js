// import installed packages
// import styles
// import material ui items
// import shared/global items
// import components/pages
// import redux API

const WorkerLinks = ({ Link, pathname }) => {
  return (
    <>
      <Link
        to="/worker/work-center/"
        className={
          `${pathname}` === "/worker/work-center/"
            ? "nav__link active"
            : "nav__link"
        }
      >
        <i className="fa fa-briefcase" aria-hidden="true"></i>
        <span className="nav__name">Work Center</span>
      </Link>
    </>
  );
};

export default WorkerLinks;
