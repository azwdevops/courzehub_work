import "./Toolbar.css";

// alternative to exec
//github.com/basecamp/trix

const Toolbar = () => {
  function format(com, val) {
    document.execCommand(com, false, val);
  }

  return (
    <div id="toolbar">
      {/* bold text */}

      <button onClick={(e) => format("bold")} type="button">
        <i class="fa fa-bold"></i>
      </button>
      {/* italic text */}
      <button onClick={(e) => format("italic")} type="button">
        <i class="fa fa-italic"></i>
      </button>
      {/* unordered list */}
      <button onClick={(e) => format("insertUnorderedList")} type="button">
        <i class="fa fa-list-ul"></i>
      </button>
      {/* ordered list */}
      <button onClick={(e) => format("insertOrderedList")} type="button">
        <i class="fa fa-list-ol"></i>
      </button>
      {/* underline text */}
      <button onClick={(e) => format("underline")} type="button">
        <i class="fa fa-underline"></i>
      </button>
      {/* subscript */}
      <button onClick={(e) => format("subscript")} type="button">
        <i class="fa fa-subscript"></i>
      </button>
      {/* superscript */}
      <button onClick={(e) => format("superscript")} type="button">
        <i class="fa fa-superscript"></i>
      </button>
      {/* outdent / indent left */}
      <button onClick={(e) => format("outdent")} type="button">
        <i class="fa fa-outdent"></i>
      </button>
      {/* indent right */}
      <button onClick={(e) => format("indent")} type="button">
        <i class="fa fa-indent"></i>
      </button>

      {/* align full */}
      <button onClick={(e) => format("justifyFull")} type="button">
        <i class="fa fa-align-justify"></i>
      </button>
      {/* align left */}
      <button onClick={(e) => format("justifyLeft")} type="button">
        <i class="fa fa-align-left"></i>
      </button>
      {/* align center */}
      <button onClick={(e) => format("justifyCenter")} type="button">
        <i class="fa fa-align-center"></i>
      </button>
      {/* align right */}
      <button onClick={(e) => format("justifyRight")} type="button">
        <i class="fa fa-align-right"></i>
      </button>

      {/* undo */}
      <button onClick={(e) => format("undo")} type="button">
        <i class="fa fa-undo"></i>
      </button>
      {/* redo */}
      <button onClick={(e) => format("redo")} type="button">
        <i class="fa fa-repeat"></i>
      </button>
      {/* strike through */}
      <button onClick={(e) => format("strikethrough")} type="button">
        <i class="fa fa-strikethrough"></i>
      </button>
      <button onClick={() => format("selectAll")} type="button">
        All
      </button>
    </div>
  );
};

export default Toolbar;
