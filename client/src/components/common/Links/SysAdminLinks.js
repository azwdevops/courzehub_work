// import installed packages
// import styles

// import material ui items

// import shared/global items

// import components/pages

// import redux API

const SysAdminLinks = ({ Link, pathname }) => {
  return (
    <>
      <Link
        to="/sys-admin/maintain-organizations/"
        className={
          `${pathname}` === "/sys-admin/maintain-organizations/"
            ? "nav__link active"
            : "nav__link"
        }
      >
        <i className="bx bxs-school"></i>
        <span className="nav__name">Organizations</span>
      </Link>
      <Link
        to="/sys-admin/maintain-workers/"
        className={
          `${pathname}` === "/sys-admin/maintain-workers/"
            ? "nav__link active"
            : "nav__link"
        }
      >
        <i className="fa fa-users" aria-hidden="true"></i>
        <span className="nav__name">Workers</span>
      </Link>
    </>
  );
};

export default SysAdminLinks;
