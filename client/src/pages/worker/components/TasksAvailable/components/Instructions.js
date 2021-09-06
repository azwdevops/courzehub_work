// import installed packages
import parse from "html-react-parser";
// import styles
// import material ui items
// import shared/global items
// import components/pages
import MediumDialog from "../../../../../components/common/MediumDialog";
// import redux API

const Instructions = (props) => {
  const { openInstructions, currentTask, setOpenInstructions } = props;
  return (
    <MediumDialog isOpen={openInstructions} maxWidth="1000px">
      <div className="dialog">
        <h3>Task Instructions</h3>
        <div>{parse(`${currentTask?.instructions}`)}</div>
        <div className="form__Buttons">
          <button type="button" onClick={() => setOpenInstructions(false)}>
            Close
          </button>
        </div>
      </div>
    </MediumDialog>
  );
};

export default Instructions;
