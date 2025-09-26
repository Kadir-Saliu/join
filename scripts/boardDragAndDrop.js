/**
 * Handles the dragover event to highlight a drop target.
 * Prevents the default behavior and adds the "highlight-drop" CSS class
 * to the current target element to visually indicate a valid drop area.
 *
 * @param {DragEvent} ev - The drag event object.
 */
function highlightDrop(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.add("highlight-drop");
}

/**
 * Removes the "highlight-drop" CSS class from the current drop target element.
 *
 * @param {DragEvent} ev - The drag event triggered when the drop target loses focus.
 */
function removeHighlight(ev) {
  ev.currentTarget.classList.remove("highlight-drop");
}