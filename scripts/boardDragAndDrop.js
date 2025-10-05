// Drag and drop global variable
let currentDraggedElement;

/**
 * Initiates the dragging process for a task at the specified index.
 * Sets the current dragged element and toggles the visibility of the "no task" container.
 *
 * @param {number} index - The index of the task to start dragging.
 */
function startDragging(index) {
  currentDraggedElement = index;
  toggleNoTaskContainer();
}

/**
 * Enables an element to accept drop events by preventing the default handling of the dragover event.
 * Also ensures the highlight remains active during dragging.
 *
 * @param {DragEvent} ev - The drag event object.
 */
function allowDrop(ev) {
  ev.preventDefault();
  if (!ev.currentTarget.classList.contains("highlight-drop")) {
    ev.currentTarget.classList.add("highlight-drop");
  }
}

/**
 * Handles the dragenter event to highlight a drop target.
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
 * Only removes highlight if we're actually leaving the drop zone (not entering a child element).
 *
 * @param {DragEvent} ev - The drag event triggered when the drop target loses focus.
 */
function removeHighlight(ev) {
  const rect = ev.currentTarget.getBoundingClientRect();
  const x = ev.clientX;
  const y = ev.clientY;

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    ev.currentTarget.classList.remove("highlight-drop");
  }
}

/**
 * Saves the currently modified ticket to Firebase.
 *
 * Updates the corresponding ticket entry in the Firebase Realtime Database
 * using a PUT request. After saving, the updated tickets are also stored in
 * localStorage, and the UI is refreshed by calling `getTicketData()` and
 * `renderTickets()`.
 *
 * @async
 * @function saveChangedTicketInFirbase
 * @returns {Promise<void>} - Returns nothing but updates the database,
 *                            local storage, and re-renders the UI.
 */
async function saveChangedTicketInFirbase(newIndex) {
  try {
    await fetchChangedTicket(newIndex);
  } catch (error) {
    console.error("Error saving ticket:", error);
  }
}

/**
 * Updates the currently dragged ticket in the Firebase Realtime Database
 * and synchronizes the local storage with the updated tickets.
 *
 * @async
 * @function fetchChangedTicket
 * @returns {Promise<void>} Resolves once the ticket has been updated in Firebase,
 *                          stored in localStorage, and the board has been re-initialized.
 */
async function fetchChangedTicket(newIndex) {
  await fetch(
    `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${allTickets[newIndex].id}.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(allTickets[newIndex]),
    }
  );
  localStorage.setItem("tickets", JSON.stringify(allTickets));
  boardInit();
}

/**
 * Generates HTML button strings for moving a ticket between board columns based on its current column.
 *
 * @param {string} columnValue - The current column name of the ticket (e.g., "To do", "In progress", "Await feedback", "done").
 * @param {number} index - The index of the ticket in the board.
 * @returns {{upBtn: string, downBtn: string}} An object containing HTML strings for the "Up" and "Down" buttons.
 */
function getColumnValue(columnValue, index) {
  let upBtn;
  let downBtn;
  if (columnValue === "To do") {
    upBtn = ``;
    downBtn = `<button class="mobile-hide" data-ticketIndex="${index}" onclick="mobileMoveTo(this, event, 'In progress')">Down</button>`;
  } else if (columnValue === "In progress") {
    upBtn = `<button class="mobile-hide" data-ticketIndex="${index}" onclick="mobileMoveTo(this, event, 'To do')">Up</button>`;
    downBtn = `<button class="mobile-hide" data-ticketIndex="${index}" onclick="mobileMoveTo(this, event, 'Await feedback')">Down</button>`;
  } else if (columnValue === "Await feedback") {
    upBtn = `<button class="mobile-hide" data-ticketIndex="${index}" onclick="mobileMoveTo(this, event, 'In progress')">Up</button>`;
    downBtn = `<button class="mobile-hide" data-ticketIndex="${index}" onclick="mobileMoveTo(this, event, 'done')">Down</button>`;
  } else if (columnValue === "done") {
    upBtn = `<button class="mobile-hide" data-ticketIndex="${index}" onclick="mobileMoveTo(this, event, 'Await feedback')">Up</button>`;
    downBtn = ``;
  }
  return { upBtn, downBtn };
}

/**
 * Moves the currently dragged ticket to the specified category (column).
 * Only saves and rerenders if the ticket is actually moved to a different column.
 *
 * @param {string} category - The target category (column) to move the ticket to.
 */
function moveTo(category) {
  const currentColumn = allTickets[currentDraggedElement]["column"];
  if (currentColumn !== category) {
    allTickets[currentDraggedElement]["column"] = category;
    saveChangedTicketInFirbase(currentDraggedElement);
  }
  document.querySelectorAll(".highlight-drop").forEach((el) => {
    el.classList.remove("highlight-drop");
  });
}

/**
 * Moves a ticket to a specified category on mobile devices.
 * Updates the ticket's column and saves the change to Firebase.
 *
 * @param {HTMLElement} ele - The HTML element representing the ticket.
 * @param {Event} event - The event object triggered by the move action.
 * @param {string} category - The target category to move the ticket to.
 */
function mobileMoveTo(ele, event, category) {
  event.stopPropagation();
  let id = ele.dataset.ticketindex;
  allTickets[id]["column"] = category;
  saveChangedTicketInFirbase(id);
}

/**
 * Cleans up all drag and drop visual effects when dragging ends.
 * This ensures highlights are removed even if the element is dropped outside valid zones.
 */
function endDragging() {
  document.querySelectorAll(".highlight-drop").forEach((el) => {
    el.classList.remove("highlight-drop");
  });
  currentDraggedElement = null;
}
