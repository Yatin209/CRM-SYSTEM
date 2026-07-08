import { useEffect, useRef, useState } from "react";
import Button from "./Button.jsx";

// A small anchored popover confirmation, replacing native browser
// alert()/confirm() dialogs across the app.
//
// Usage:
//   <ConfirmPopover message='Delete this item?' onConfirm={() => remove(id)}>
//     {(open) => (
//       <Button variant="ghost" icon={Trash2} onClick={open}>Delete</Button>
//     )}
//   </ConfirmPopover>
export default function ConfirmPopover({
  message = "Are you sure?",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  children,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleConfirm() {
    setIsOpen(false);
    onConfirm();
  }

  return (
    <span className="confirm-popover-wrapper" ref={wrapperRef}>
      {children(() => setIsOpen(true))}
      {isOpen && (
        <div className="confirm-popover" role="dialog">
          <p className="confirm-popover-message">{message}</p>
          <div className="confirm-popover-actions">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              {cancelLabel}
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </span>
  );
}
