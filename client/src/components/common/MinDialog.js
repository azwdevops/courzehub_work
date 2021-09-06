// material ui items
import Dialog from "@material-ui/core/Dialog";

const MinDialog = (props) => {
  return (
    <Dialog
      open={props?.isOpen}
      maxWidth="sm"
      style={{ maxWidth: props?.maxWidth, margin: "auto" }}
      fullWidth
    >
      {props.children}
    </Dialog>
  );
};

export default MinDialog;
