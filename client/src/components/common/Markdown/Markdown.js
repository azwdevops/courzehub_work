import ContentEditable from "react-contenteditable";

import Toolbar from "./Toolbar";

// styles
import "./Markdown.scss";

const Markdown = ({ content, setContent }) => {
  // there is no need to maintain state as we can just access the data through getting the element and then the innerHTML
  // in addition, onChange events as well as blur events as causing a problem with operation
  // const handleSubmit = () => {
  // const content = document.getElementById("editorContent").innerHTML;
  // console.log(content);
  // };
  return (
    <div className="editor">
      <div className="editor__buttons">
        <Toolbar />
      </div>
      <div className="editor__edit">
        {/* we use a div to allow html because a textarea does not support html */}
        <ContentEditable
          id="editorContent"
          onChange={(e) => setContent(e.target.value)}
          html={content}
        />
      </div>
    </div>
  );
};

export default Markdown;
