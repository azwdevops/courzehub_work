// import installed packages
// import styles

// import material ui items

// import shared/global items

// import components/pages

// import redux API

const OrganizationAdminLinks = ({ Link, pathname }) => {
  return (
    <>
      <Link
        to="/organization-admin/maintain-tasks/"
        className={
          `${pathname}` === "/organization-admin/maintain-tasks/"
            ? "nav__link active"
            : "nav__link"
        }
      >
        <i className="fa fa-briefcase" aria-hidden="true"></i>
        <span className="nav__name">Tasks</span>
      </Link>
    </>
  );
};

export default OrganizationAdminLinks;
