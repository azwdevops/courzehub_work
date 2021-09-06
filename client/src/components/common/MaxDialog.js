// material ui items
import Dialog from "@material-ui/core/Dialog";

const MaxDialog = (props) => {
  return (
    <Dialog
      open={props.isOpen}
      maxWidth="lg"
      style={{ maxWidth: props?.maxWidth, margin: "auto" }}
      fullWidth
    >
      {props.children}
    </Dialog>
  );
};

export default MaxDialog;
