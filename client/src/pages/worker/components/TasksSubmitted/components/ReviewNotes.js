// import installed packages
// import styles
// import material ui items
// import shared/global items
// import components/pages
import MinDialog from "../../../../../components/common/MinDialog";
// import redux API

const ReviewNotes = (props) => {
  const { openReviewNotes, setOpenReviewNotes, currentReviewNotes } = props;
  return (
    <MinDialog isOpen={openReviewNotes}>
      <div className="dialog">
        <h3>Review notes for this task</h3>
        <br />
        <textarea name="" value={currentReviewNotes} disabled readOnly />
        <div className="form__Buttons">
          <button type="button" onClick={() => setOpenReviewNotes(false)}>
            Close
          </button>
        </div>
      </div>
    </MinDialog>
  );
};

export default ReviewNotes;
