

/**
 * Generates an HTML string for rendering a subtask list item with edit and delete buttons.
 *
 * @param {string} subtaskValue - The text value of the subtask to display.
 * @param {number} subtaskCounter - The index or identifier for the subtask, used for button data attributes.
 * @returns {string} The HTML string representing the subtask list item.
 */
function addSubtaskRenderDiv(subtaskValue, subtaskCounter) {
  return /*html*/  `
  <li onmouseenter="hoverButtons(this)" onmouseleave="removeHoverButtons(this)">
      ${subtaskValue} 
      <div class="li-buttons hide">
          <button data-index="${subtaskCounter}" onclick="editSubtask(this)">
              <img src="./assets/icon/pencil.svg">
          </button>
          <div class="add-task-form-divider"></div>
          <button data-index="${subtaskCounter}" onclick="deleteSubtask(this, '${subtaskValue}')">
              <img src="./assets/icon/bin.svg">
          </button>
      </div>
  </li>
  `;
}

/**
 * Renders the HTML for editing a subtask, including input field and action buttons.
 *
 * @param {string} listValue - The value of the subtask to be edited.
 * @param {string|number} dataId - The unique identifier for the subtask.
 * @returns {string} The HTML string for the editable subtask element.
 */
function editSubtaskRender(listValue, dataId) {
  return /*html*/ `   
  <input type="text" value="${listValue}" id='${dataId}-${listValue}'/>
  <div class="edit-subtask-div li-buttons">
      <button data-index="${dataId}" ${dataTicketIndex ? `data-ticketindex="${dataTicketIndex}"` : ""} ${dataTicketCounterId ? `data-ticketcounterid="${dataTicketCounterId}"` : ""} ${dataMode ? `data-mode="${dataMode}"` : ""} onclick="deleteSubtask(this, '${listValue}'); spliceEditSubArray(this)">
          <img src="./assets/icon/bin.svg">
      </button>
      <div class="add-task-form-divider"></div>
      <button data-index="${dataId}"  onclick="confirmEditedSubtask(this, '${listValue}', '${dataId}-${listValue}', '${listValue}-${dataId}')">
          <img src="./assets/icon/check.png">
      </button>
  </div>
  `;
}

/**
 * Renders the HTML for editing a subtask in the edit menu.
 *
 * @param {string} listValue - The value of the subtask to be edited.
 * @param {string|number} dataId - The unique identifier for the subtask.
 * @returns {string} The HTML string for the subtask edit input and action buttons.
 */
function editSubtaskInEditMenuRender(listValue, dataId) {
  return /*html*/ `   
  <input type="text" value="${listValue}" id='${dataId}-${listValue}'/>
  <div class="edit-subtask-div li-buttons">
      <button data-index="${dataId}" ${dataTicketIndex ? `data-ticketindex="${dataTicketIndex}"` : ""} ${dataTicketCounterId ? `data-ticketcounterid="${dataTicketCounterId}"` : ""} ${dataMode ? `data-mode="${dataMode}"` : ""} onclick="deleteSubtask(this, '${listValue}'); spliceEditSubArray(this)">
          <img src="./assets/icon/bin.svg">
      </button>
      <div class="add-task-form-divider"></div>
      <button data-index="${dataId}"  onclick="confirmEditedSubtaskInEditMenu(this, '${listValue}', '${dataId}-${listValue}', '${listValue}-${dataId}')">
          <img src="./assets/icon/check.png">
      </button>
  </div>
  `;
}

/**
 * Renders the HTML for a subtask item with edit and delete buttons.
 *
 * @param {string} subtaskArrayText - The HTML string representing the subtask content.
 * @param {string|number} listId - The unique identifier for the subtask list.
 * @param {string|number} dataId - The unique identifier for the subtask item.
 * @returns {string} The HTML string for the subtask item with action buttons.
 */
function confirmEditedSubtaskRender(subtaskArrayText, listId, dataId) {
  return /*html*/ `
  ${subtaskArrayText}
    <div class="li-buttons hide" id="buttons-${listId}">
    <button data-index="${dataId}" onclick="editSubtask(this)">
        <img src="./assets/icon/pencil.svg">
    </button>
    <div class="add-task-form-divider"></div>
    <button data-index="${dataId}" onclick="deleteSubtask(this)">
        <img src="./assets/icon/bin.svg">
    </button>
  </div>
  `;
}

/**
 * Generates HTML markup for a subtask item in the edit menu, including edit and delete buttons.
 *
 * @param {string} inputText - The text content of the subtask.
 * @param {string|number} listId - The unique identifier for the subtask list.
 * @param {number} dataIndex - The index of the subtask in the data array.
 * @returns {string} The HTML string representing the subtask item with edit and delete controls.
 */
function confirmEditedSubtaskInEditMenuRender(inputText, listId, dataIndex) {
  return /*html*/ `
  ${inputText}
  <div class="li-buttons hide" id="buttons-${listId}">
  <button data-index="${dataIndex}" onclick="editSubtask(this)">
      <img src="./assets/icon/pencil.svg">
  </button>
  <div class="add-task-form-divider"></div>
  <button data-index="${dataIndex}" onclick="deleteSubtask(this)">
      <img src="./assets/icon/bin.svg">
  </button>
  </div>
  `;
}

/**
 * Generates the HTML markup for a new subtask list item in the edit menu.
 * The subtask is rendered with edit and delete buttons, and uses values from the DOM and global variables.
 *
 * @returns {string} The HTML string representing the new subtask list item.
 */
function addNewSubtaskRender() {
  return /*html*/ `
  <li class="subtask-li" data-index="${
    subtaskEditArray.length - 1
  }" onmouseenter="hoverButtons(this)" onmouseleave="removeHoverButtons(this)">
    ${document.getElementById("edit-subtask").value}
    <div class="li-buttons hide">
      <button data-index="${
        subtaskEditArray.length - 1
      }" onclick="editSubtaskInEditMenu(this)">
          <img src="./assets/icon/pencil.svg">
      </button>
      <div class="add-task-form-divider"></div>
      <button data-index="${
        subtaskEditArray.length - 1
      }" data-ticketindex="${dataTicketIndex}" data-ticketcounterid="${dataTicketCounterId}" data-mode="${dataMode}" onclick="deleteSubtask(this, '${subtask.value}'); spliceEditSubArray(this)">
          <img src="./assets/icon/bin.svg">
      </button>
    </div>
  </li>`;
}

/**
 * Generates an HTML span element string representing a user icon for editing tickets.
 *
 * @param {string} user - The name or identifier of the user.
 * @param {number|string} safeIndex - A safe index used for generating a unique class name.
 * @param {string} initials - The initials to display inside the span.
 * @returns {string} An HTML string for the user icon span element.
 */
const getEditTicketUserSpansArrayTemplate = (user, safeIndex, initials) => {
  return /*html*/ `
    <span data-name="${user}" class="user-icon-rendered User-bc-${safeIndex} user-icon-selected">${initials}</span>
  `;
};

/**
 * Generates an HTML template string for a subtask list item in the edit ticket menu.
 *
 * @param {Object} subtask - The subtask object containing details for rendering.
 * @param {string} subtask.text - The display text of the subtask.
 * @param {string|number} subtask.value - The unique value or identifier of the subtask.
 * @param {number} i - The index of the subtask in the list.
 * @param {number|string} dataTicketIndex - The index of the ticket being edited.
 * @param {number|string} dataTicketCounterId - The counter ID associated with the ticket.
 * @param {string} dataMode - The current mode (e.g., 'edit', 'view') for the ticket.
 * @returns {string} HTML string representing the subtask list item.
 */
const getEditTicketSubtaskEleTemplate = (subtask, i, dataTicketIndex, dataTicketCounterId, dataMode) => {
  return /*html*/ `
    <li class="subtask-li" data-index="${i}" onmouseenter="hoverButtons(this)" onmouseleave="removeHoverButtons(this)">
      ${subtask.text}
      <div class="li-buttons hide">
        <button data-index="${i}" onclick="editSubtaskInEditMenu(this)">
          <img src="./assets/icon/pencil.svg">
        </button>
        <div class="add-task-form-divider"></div>
        <button data-index="${i}" data-ticketindex="${dataTicketIndex}" data-ticketcounterid="${dataTicketCounterId}" data-mode="${dataMode}" onclick="deleteSubtask(this, '${subtask.value}'); spliceEditSubArray(this)">
          <img src="./assets/icon/bin.svg">
        </button>
      </div>
    </li>
  `;
};

/**
 * Generates the HTML template for editing a ticket.
 *
 * @param {string} title - The title of the ticket.
 * @param {string} description - The description of the ticket.
 * @param {string} dateForEditOverlay - The due date for the ticket in 'YYYY-MM-DD' format.
 * @param {string} userSpans - HTML string representing assigned user elements.
 * @param {string} subtaskEle - HTML string representing subtask elements.
 * @param {number} index - The index of the ticket being edited.
 * @param {string|number} ticketCounterId - The unique identifier for the ticket.
 * @param {string} mode - The mode in which the template is rendered (e.g., 'edit', 'view').
 * @returns {string} HTML string for the edit ticket overlay.
 */
const getEditTicketTemplate = (title, description, dateForEditOverlay, userSpans, subtaskEle, index, ticketCounterId, mode) => {
  return /*html*/ `
  <button id="board-task-edit-x"  onclick="popUpAddTask(popuptask)">X</button>
    <div class="add-task-text-div" id="edit-add-task-text-div">
        <div class="span-div">
            <p>Title</p>
        </div>
        <input type="text" value="${title}" placeholder="Title" id="task-title-edit">
        <p class="margin-top-24">Description</p>
        <textarea name="" id="task-description-edit" placeholder="Description">${description}</textarea>
        <div class="span-div">
            <p class="margin-top-24">Due date</p>
        </div>
        <input type="date" id="task-date-edit" value="${dateForEditOverlay}">
        <p class="margin-top-24">Priority</p>
        <div class="add-task-importance-selection">
            <button class="priority-button set-priority" onclick="setPriority('urgent', this)">Urgent <img src="./assets/icon/red-arrows.svg" alt=""></button>
            <button class="priority-button set-priority" onclick="setPriority('medium', this)">Medium <img src="./assets/icon/orange-same.svg" alt=""></button>
            <button class="priority-button set-priority" onclick="setPriority('low', this)">Low <img src="./assets/icon/green-arrows.svg" alt=""></button>
        </div>
        <p class="margin-top-24">Assigned to</p>
        <div id="drop-down-users-input-div">
          <input id="drop-down-users-input" class="drop-down-selection edit-302" placeholder="Select Contacts to assign" oninput="filterUsers('drop-down-users-edit', 'edit-render-user', 'drop-down-users-input')" onclick="dropDownUsers('drop-down-users-edit', 'edit-render-user', 'drop-down-users-input-img-edit', 'drop-down-users-input')" autocomplete="off" />
          <div id="drop-down-users-input-img-div"  onclick="dropDownUsers('drop-down-users-edit', 'edit-render-user', 'drop-down-users-input-img-edit', 'drop-down-users-input')">
                <img src="./assets/imgs/arrow_down.png" id="drop-down-users-input-img-edit" alt="">
              </div>
        </div>
        <div id="drop-down-users-edit" class="hide">
        </div>
        <div id="edit-render-user">${userSpans}</div>
        <p class="margin-top-24">Subtasks</p>
        <div class="subtask-div">
            <input type="text" name="" id="edit-subtask" placeholder="Add new subtask" oninput="removeHideOnInput(this)" />
            <div id="subtask-button-div">
              <button id="subtask-clear-button" class="hide" onclick="clearSubtaskValue('edit-subtask')">X</button>
              <div id="subtask-button-div-divider" class="hide">
                <div id="subtask-button-divider"></div>
              </div>
              <button id="subtask-button" onclick="addNewSubtask()">+</button>
            </div>
          </div>
        <ul id="subtask-render-div">
        ${subtaskEle}
        </ul>
    </div>
    <button id="board-task-edit-ok" data-ticketindex="${index}" data-ticketcounterid="${ticketCounterId}" data-mode="${mode}" onclick="switchEditInfoMenu(this); checkEditedValues(this, '.user-checkbox-edit')">Ok</button>
  `;
};
