/**
 * Generates an HTML template for a user dropdown item.
 *
 * @param {string} name - The name of the user.
 * @param {string} inititals - The initials of the user to display in the icon.
 * @param {number} index - The index used for styling and data attributes.
 * @param {string|number} id - The unique identifier for the user, used in the checkbox onclick handler.
 * @returns {string} The HTML string representing the user dropdown item.
 */
function userDropDownTemplate(name, inititals, index, id) {
  return /*html*/ `
    <div>
      <div>
        <span class="user-icon User-bc-${index}" data-bcIndex="${index}">${inititals}</span>
        <p>${name}</p>
      </div>
      <input type="checkbox" class="user-checkbox" value="${name}" onclick="renderSelectedUsers('${id}')">
    </div>
  `;
}

/**
 * Generates an HTML template string for a kanban ticket/task.
 *
 * @param {number} index - The index of the ticket in the list.
 * @param {string} title - The title of the ticket.
 * @param {string} description - The description of the ticket.
 * @param {string} category - The category of the ticket.
 * @param {string} categoryCss - The CSS class for the ticket category.
 * @param {string} priority - The priority of the ticket (used for icon).
 * @param {Array} subtasks - Array of subtasks associated with the ticket.
 * @param {number|string} ticketCounterId - Unique identifier for the ticket.
 * @param {string} userSpans - HTML string representing assigned users.
 * @returns {string} HTML string representing the ticket template.
 */
const getTicketTemplate = (index, title, description, category, categoryCss, priority, subtasks, ticketCounterId, userSpans) => {
  return /*html*/ `
    <div
      draggable="true"
      ondragstart="startDragging(${index})"
      class="kanban-task"
      data-ticketIndex="${index}"
      data-ticketcounterid="${ticketCounterId}"
      data-mode="view"
      onclick="popUpAddTask(popuptask); renderTicketOverlay(this)"
    >
      <div class="task-type ${categoryCss}">${category}</div>
      <h4 class="content-limitation">${title}</h4>
      <p class="content-limitation">${description}</p>
      <div id="p-subtask-${index}" class="subtask-progress-div hide">
        <div class="subtask-progress-grey-div">
          <div class="subtask-progress-blue-div" style="width: ${subtaskWidth}%"></div>
        </div>
        <p class="subtask-count">${subtaskCount}/${subtasks.length} Subtasks</p>
      </div>
      <div class="assigned-users">
        <div>${userSpans}</div>
        <img src="${priority[0] && priority !== "-" ? `./assets/icon/${priority}.svg` : ""}" alt="" />
      </div>
    </div>
  `;
};

/**
 * Generates an HTML template containing a letter and a horizontal rule.
 *
 * @param {string} inital - The initial letter to display in the template.
 * @returns {string} The HTML string for the template.
 */
function getInitialTemplate(inital) {
  return /*html*/ `
    <div class="letter">${inital}</div>
    <hr>
  `;
}

/**
 * Generates an HTML template string for displaying a contact.
 *
 * @param {string} initials - The initials of the contact.
 * @param {string} userName - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string|number} phone - The phone number of the contact.
 * @param {string|number} contactIconId - The identifier for the contact's icon/background color.
 * @returns {string} The HTML template string representing the contact.
 */
function getContactTemplate(initials, userName, email, phone, contactIconId) {
  return /*html*/ `
    <div onclick="showContactsDetails('${initials}','${userName}', '${email}', ${phone}, ${contactIconId}, this)" class="contact" data-contact="${userName}">
        <div class="contact-initials User-bc-${contactIconId}">${initials}</div>
        <div class="contact-details">
            <div class="contact-list-name">${userName}</div>
            <div class="email-color">${email}</div>
        </div>
    </div>
  `;
}

/**
 * Generates an HTML template string for displaying contact details.
 *
 * @param {string} initials - The initials of the contact.
 * @param {string} userName - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {string|number} contactIconId - The identifier used for the contact's icon background color.
 * @returns {string} The HTML template string for the contact details.
 */
function getContactDetailsTemplate(initials, userName, email, phone, contactIconId) {
  return /*html*/ `
    <div class="contact-information-mt">
      <div class="initials-and-username">
        <span class="contact-information-initials User-bc-${contactIconId}">${initials}</span>
        <div>
          <div class="contact-information-username">${userName}</div>
          <div class="edit-and-delete">
            <div onclick="openEditOverlayWithBubblingPrevention(event, '${initials}', '${userName}', '${email}', '${phone}')" class="align-icon-and-text">
              <img class="edit-delete-icons" src="../assets/icon/edit_contact.svg" alt="">
              <span>Edit</span>
            </div>
            <div onclick="deleteContactFromDatabase()" class="align-icon-and-text">
              <img class="edit-delete-icons" src="../assets/icon/delete_contact.svg" alt="">
              <span>Delete</span>
            </div>
          </div>
        </div>
      </div>  
    </div>
    <div class="contact-information-headline">Contact Information</div>
    <div class="contact-information">
      <span><b>Email</b></span>
      <span class="email-color">${email}</span>
      <span><b>Phone</b></span>
      <span>+${phone}</span>
    </div>
  `;
}

/**
 * Generates the HTML content for the edit contact overlay.
 *
 * @param {string} initials - The initials of the contact to display.
 * @param {string} userName - The name of the contact to prefill in the input.
 * @param {string} email - The email of the contact to prefill in the input.
 * @param {string} phone - The phone number of the contact to prefill in the input.
 * @returns {string} The HTML string for the edit contact overlay.
 */
function getEditOverlayContentTemplate(initials, userName, email, phone) {
  return /*html*/ `
  <img class="close-icon" src="./assets/icon/close.svg" alt="" onclick="closeEditOverlay()" />
    <div class="contact-overlay-header">
        <img class="join-logo-img" src="./assets/imgs/join_navigation.png" alt="" />
        <h1>Edit contact</h1>
        <img class="add-contact-overlay-line" src="./assets/icon/add_contact_overlay_line.svg" alt="" />
      </div>
      <div class="contact-inputs-container">
        <div class="edit-overlay-initials">${initials}</div>
        <div class="contact-inputs">
          <div>
            <input
              id="editContactName"
              class="contact-input"
              type="text"
              placeholder="Name"
              spellcheck="false"
              value="${userName}"
              required
            />
            <img src="./assets/icon/user_grey.svg" alt="" class="icon" />
          </div>
          <div>
            <input
              id="editContactEmail"
              class="contact-input"
              type="text"
              placeholder="Email"
              spellcheck="false"
              value="${email}"
              required
            />
            <img src="./assets/icon/mail-icon-grey.svg" alt="" class="icon" />
          </div>
          <div>
            <input
              id="editContactPhone"
              class="contact-input"
              type="text"
              placeholder="Phone"
              spellcheck="false"
              value="${phone}"
              required
            />
            <img src="./assets/icon/call-grey.svg" alt="" class="icon" />
          </div>
          <div class="contact-inputs-buttons">
            <button onclick="deleteContactFromDatabase()" class="cancel-button">Delete</button>
            <button onclick="saveEditedContactToDatabase()" class="create-contact-button">Save &#10003;</button>
          </div>
        </div>
      </div>
  `;
}

/**
 * Generates an HTML template string for a subtask list item in ticket details.
 *
 * @param {number} i - The index of the subtask in the list.
 * @param {{ checked: boolean, text: string }} subtask - The subtask object containing its checked state and text.
 * @param {number} index - The index of the ticket.
 * @param {number|string} ticketCounterId - The unique identifier for the ticket counter.
 * @returns {string} The HTML string representing the subtask list item.
 */
const getRenderTicketDetailsSubtaskEleTemplate = (i, subtask, index, ticketCounterId) => {
  return /*html*/ `
    <li><input data-index="${i}" ${
    subtask.checked ? "checked" : ""
  } data-ticketindex="${index}" data-ticketcounterid="${ticketCounterId}" type="checkbox" onclick="toggleSubtask(this)">${subtask.text}</li>
  `;
};

/**
 * Generates an HTML template string for rendering ticket user details.
 *
 * @param {number|string} safeIndex - A safe index used for generating a unique CSS class for the user icon.
 * @param {string} initials - The initials of the user to display inside the user icon.
 * @param {string} user - The full name or identifier of the user to display.
 * @returns {string} An HTML string representing the user details section.
 */
const getRenderTicketDetailsUserSpansArrayTemplate = (safeIndex, initials, user) => {
  return /*html*/ `
    <div class="ticket-detail-user-div">
      <span class="user-icon-rendered User-bc-${safeIndex}">${initials}</span>
      <span>${user}</span>
    </div>
  `;
};

/**
 * Generates an HTML template string for rendering ticket details in a pop-up.
 *
 * @param {string} category - The category of the ticket.
 * @param {string} categoryColor - The CSS class for the category color.
 * @param {string} title - The title of the ticket.
 * @param {string} description - The description of the ticket.
 * @param {string} date - The due date of the ticket.
 * @param {string} priority - The priority level of the ticket.
 * @param {number} index - The index of the ticket in the list.
 * @param {number|string} ticketCounterId - The unique identifier for the ticket.
 * @param {string} userSpans - HTML string representing assigned users.
 * @param {string} subtaskEle - HTML string representing subtasks.
 * @returns {string} The HTML template string for the ticket details pop-up.
 */
const getRenderTicketDetailsTemplate = (
  category,
  categoryColor,
  title,
  description,
  date,
  priority,
  index,
  ticketCounterId,
  userSpans,
  subtaskEle
) => {
  return /*html*/ `
    <div id="task-pop-up-nav">
      <p class="${categoryColor}">${category}</p>
      <button  onclick="popUpAddTask(popuptask)">X</button>
    </div>
    <h1 class="pop-up-margin-b-25">${title}</h1>
    <p class="pop-up-margin-b-25" id="pop-up-task-description">${description}</p>
    <div class="pop-up-margin-b-25 gap-10" id="pop-up-deadline">
      <p>Due date:</p>
      <p>${date}</p>
    </div>
    <div class="pop-up-margin-b-25 gap-10">
      <p>Priority:</p>
      <span>${priority.charAt(0).toUpperCase() + priority.slice(1)} <img src="${
    priority && priority !== "-" ? `./assets/icon/${priority}.svg` : ""
  }" alt=""></span>
    </div>
    <div class="pop-up-margin-b-25" id="assigned-users-div">
       ${userSpans}
    </div>
    <div id="subtasks-div" class="pop-up-margin-b-25">
      <p>Subtasks</p>
      <ul>${subtaskEle}</ul>
    </div>
    <div id="pop-up-bottom-buttons">
      <button onclick="deleteTicket(${ticketCounterId})"><img src="./assets/icon/bin.svg" alt="">Delete</button>
      <button data-ticketIndex=${index} data-ticketcounterid="${ticketCounterId}" data-mode="edit" onclick="switchEditInfoMenu(this); setGlobalEditInformation(this)"><img src="./assets/icon/pencil.svg" alt="">Edit</button>
    </div>`;
};

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
          <input id="drop-down-users-input" class="drop-down-selection edit-302" placeholder="Select Contacts to assign" oninput="filterUsers('drop-down-users-edit', 'edit-render-user', 'drop-down-users-input')" onclick="dropDownUsers('drop-down-users-edit', 'edit-render-user', 'drop-down-users-input-img-edit')">
          <div id="drop-down-users-input-img-div"  onclick="dropDownUsers('drop-down-users-edit', 'edit-render-user', 'drop-down-users-input-img-edit')">
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
    <button id="board-task-edit-ok" data-ticketindex="${index}" data-ticketcounterid="${ticketCounterId}" data-mode="${mode}" onclick="switchEditInfoMenu(this); checkEditedValues(this)">Ok</button>
  `;
};

/**
 * Generates an HTML template string for rendering task statistics on the dashboard.
 *
 * The template includes sections for:
 * - To-do and Done tasks
 * - Urgent tasks and upcoming deadlines
 * - Tasks in board, in progress, and awaiting feedback
 *
 * The template expects the following variables to be defined in the scope:
 * - toDos: Number of to-do tasks
 * - done: Number of completed tasks
 * - urgentTickets: Number of urgent tasks
 * - deadline: Upcoming deadline (string or date)
 * - currentTickets: Array of current tickets/tasks
 * - inProgress: Number of tasks in progress
 * - awaitFeedback: Number of tasks awaiting feedback
 *
 * @returns {string} HTML template string for rendering the dashboard task statistics.
 */
function getRenderTasksTemplate() {
  return /*html*/ `
             <div onclick="goToBoardHtml()" class="toDo-and-done">
              <div class="to-do">
                <a href="">
                  <svg xmlns="http://www.w3.org/2000/svg" width="69" height="70" viewBox="0 0 69 70" fill="none">
                    <circle class="change-circle-color" cx="34.5" cy="35" r="34.5" fill="#2A3647" />
                    <mask
                      id="mask0_319113_6282"
                      style="mask-type: alpha"
                      maskUnits="userSpaceOnUse"
                      x="18"
                      y="19"
                      width="33"
                      height="32"
                    >
                      <rect x="18.5" y="19" width="32" height="32" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_319113_6282)">
                      <path
                        class="change-contents-color"
                        d="M25.1667 44.3332H27.0333L38.5333 32.8332L36.6667 30.9665L25.1667 42.4665V44.3332ZM44.2333 30.8998L38.5667 25.2998L40.4333 23.4332C40.9444 22.9221 41.5722 22.6665 42.3167 22.6665C43.0611 22.6665 43.6889 22.9221 44.2 23.4332L46.0667 25.2998C46.5778 25.8109 46.8444 26.4276 46.8667 27.1498C46.8889 27.8721 46.6444 28.4887 46.1333 28.9998L44.2333 30.8998ZM42.3 32.8665L28.1667 46.9998H22.5V41.3332L36.6333 27.1998L42.3 32.8665Z"
                        fill="white"
                      />
                    </g>
                  </svg>
                </a>
                <div class="center">
                  <h3>${toDos}</h3>
                  <p>To-do</p>
                </div>
              </div>
              <div onclick="goToBoardHtml()" class="done">
                <a href="">
                  <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
                    <circle class="change-circle-color" cx="35" cy="35" r="34.5" fill="#2A3647" />
                    <path
                      class="change-contents-color"
                      d="M20.0283 35.0001L31.2571 46.0662L49.9717 23.9341"
                      stroke="white"
                      stroke-width="7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </a>
                <div  class="center">
                  <h3>${done}</h3>
                  <p>Done</p>
                </div>
              </div>
            </div>
            <div onclick="goToBoardHtml()" class="urgent-and-date">
              <div class="urgent">
                <a href=""><img src="./assets/icon/urgent-orange-icon.svg" alt="" /></a>
                <div>
                  <h3>${urgentTickets}</h3>
                  <p>Urgent</p>
                </div>
              </div>
              <img src="./assets/icon/hyphen.svg" alt="" />
              <div class="deadline">
                <h4>${deadline}</h4>
                <p>Upcoming Deadline</p>
              </div>
            </div>
            <div onclick="goToBoardHtml()" class="tasks-in-editing">
              <div class="tasks-in-board">
                <h3>${currentTickets.length}</h3>
                <p>
                  Tasks in <br />
                  Board
                </p>
              </div>
              <div onclick="goToBoardHtml()" class="tasks-in-progress">
                <h3>${inProgress}</h3>
                <p>
                  Tasks in <br />
                  Progress
                </p>
              </div>
              <div onclick="goToBoardHtml()" class="awaiting-feedback">
                <h3>${awaitFeedback}</h3>
                <p>
                  Awaiting <br />
                  Feedback
                </p>
              </div>
            </div>
  `;
}

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
