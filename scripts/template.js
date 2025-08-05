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
  return `<div>
                <div>
                    <span class="user-icon User-bc-${index}" data-bcIndex="${index}">${inititals}</span>
                    <p>${name}</p>
                </div>
                <input type="checkbox" class="user-checkbox" value="${name}" onclick="renderSelectedUsers('${id}')">
            </div>`;
}

/**
 * Generates an HTML snippet for a ticket , rendering assigned user icons concurrently.
 *
 * @async
 * @param {string} title - The ticket's title.
 * @param {string} description - A brief description of the ticket.
 * @param {string} category - The category or type of the ticket.
 * @param {string} categoryCss - CSS class suffix to style the category badge.
 * @param {string[]} assignedTo - Array of user full names assigned to the ticket.
 * @param {string} priority - Priority level (e.g. "low", "medium", "high").
 * @param {number} index - Zero‑based index of the ticket in a list.
 * @param {Array<object>} subtasks - An array of subtask objects, each with its own properties.
 * @returns {Promise<string[]>} A promise that resolves to an array of HTML `<span>` strings containing rendered user icons.
 *
 */
async function ticketTemplate(title, description, category, categoryCss, assignedTo, priority, index, subtasks, ticketCounterId) {  
  let userSpansArray = await Promise.all(assignedTo
    .map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return `<span class="user-icon-rendered User-bc-${renderedUserBgIndex}">${initials}</span>`;
    }));    

    let userSpans = userSpansArray.join("");

    return `
        <div draggable="true" ondragstart="startDragging(${index})" class="kanban-task" data-ticketIndex="${index}" data-ticketcounterid="${ticketCounterId}" data-mode="view" onclick="popUpAddTask(popuptask); renderTicketOverlay(this)">
            <div class="task-type ${categoryCss}">${category}</div>
            <h4>${title}</h4>
            <p>${description}</p>
            <div id="p-subtask-${index}" class="subtask-progress-div hide">
                <div class="subtask-progress-grey-div">
                    <div class="subtask-progress-blue-div" style="width: ${subtaskWidth}%"></div>
                </div>
                <p class="subtask-count">${subtaskCount}/${subtasks.length} Subtasks</p>
            </div>
            <div class="assigned-users">
              <div>
              ${userSpans}
              </div>
              <img src="${priority[0] && priority !== '-' ? `./assets/icon/${priority}.svg` : ''}" alt="" />
            </div>
          </div>
    `;
}

function getInitialTemplate(inital) {
  return /*html*/ `
    <div class="letter">${inital}</div>
    <hr>
  `;
}

/**
 * 
 * Generates an HTML string representing a contact card.
 *
 * @param {Object} contact - Contact information object.
 * @param {string} contact.name - Full name of the contact.
 * @param {string} contact.email - Email address of the contact.
 * @param {string} initials - Initials to show in the contact icon.
 * @returns {string} An HTML snippet for the contact, including initials and contact details.
  
 */
function getContactTemplate(contact, initials) {
  return /*html*/ `
    <div class="contact">
        <div>${initials}</div>
        <div class="contact-details">
            <div class="contact-list-name">${contact.name}</div>
            <div class="email-color">${contact.email}</div>
        </div>
    </div>
  `;    
}

/**
 * Builds and returns an array of HTML snippets representing assigned users for a ticket detail view.
 * Each user is rendered with an icon (initials) styled dynamically based on user-specific details.
 *
 * @async
 * @param {string} category - The ticket's category or type.
 * @param {string} categoryColor - CSS class or color indicator for styling the category.
 * @param {string} title - Title of the ticket.
 * @param {string} description - Description text for the ticket.
 * @param {string|Date} date - Date associated with ticket (e.g. creation or due date).
 * @param {string} priority - Priority level (e.g. "low", "medium", "high").
 * @param {string[]} assignedTo - Array of full names of users assigned to the ticket.
 * @param {Array<object>} subtasks - Array of subtask objects related to the ticket.
 * @param {number} index - Zero-based index of the ticket in a list or collection.
 * @returns {Promise<string[]>} Promise resolving to an array of HTML `<div>` strings,
 * each containing user initials and name inside styled elements.
 * @throws {Error} If fetching details via `getUserDetails(user)` fails for any user.
 */
async function renderTicketDetails(category, categoryColor, title, description, date, priority, assignedTo, subtasks, index, ticketCounterId) {  
    let userSpansArray = await Promise.all(assignedTo
    .map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
        return `<div class="ticket-detail-user-div">
                    <span class="user-icon-rendered User-bc-${renderedUserBgIndex}">${initials}</span>
                    <span>${user}</span>
                </div>
        `;
    }));

    let userSpans = userSpansArray.join("");

    let subtaskEle = subtasks.map((subtask, i) => {        
        return `<li><input data-index="${i}" ${subtask.checked ? "checked" : ""} data-ticketindex="${index}" data-ticketcounterid="${ticketCounterId}" type="checkbox" onclick="toggleSubtask(this)">${subtask.text}</li>
        `;
    }).join("");
    
    document.getElementById("board-task-information").innerHTML = 
    `<div id="task-pop-up-nav">
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
        <span>${priority.charAt(0).toUpperCase() + priority.slice(1)} <img src="${priority && priority !== '-' ? `./assets/icon/${priority}.svg` : ''}" alt=""></span>
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
        <div></div>
        <button data-ticketIndex=${index} data-ticketcounterid="${ticketCounterId}" data-mode="edit" onclick="switchEditInfoMenu(this); setGlobalEditInformation(this)"><img src="./assets/icon/pencil.svg" alt="">Edit</button>
    </div>`
}


/**
 * Generates an array of HTML `<span>` snippets representing users assigned to a ticket in edit mode.
 * Fetches user-specific styling information concurrently and renders each user's initials with styling.
 *
 * @async
 * @param {string} title - The ticket title.
 * @param {string} description - A description of the ticket.
 * @param {string} priority - Priority level (e.g. "low", "medium", "high").
 * @param {string[]} assignedTo - Array of full names of users assigned to the ticket.
 * @param {Array<object>} subtasks - Array of subtask objects related to the ticket.
 * @param {number} index - Zero-based index of the ticket in the list or UI.
 * @param {string} mode - Mode identifier indicating how the ticket is being edited.
 * @returns {Promise<string[]>} A promise resolving to an array of `<span>` HTML strings,
 * each showing a user's initials, styled dynamically, and with a data-name attribute.
 * @throws {Error} If any call to `getUserDetails(user)` fails.
 */
async function editTicket (title, description, priority, assignedTo, subtasks, index, mode, ticketCounterId) {
  let userSpansArray = await Promise.all(assignedTo
    .map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
        return `<span data-name="${user}" class="user-icon-rendered User-bc-${renderedUserBgIndex} user-icon-selected">${initials}</span>`;
    }));

    let userSpans = userSpansArray.join("");

  let subtaskEle = subtasks.map((subtask, i) => {
      return `<li class="subtask-li" data-index="${i}" onmouseenter="hoverButtons(this)" onmouseleave="removeHoverButtons(this)">
                ${subtask.text}
                <div class="li-buttons hide">
                  <button data-index="${i}" onclick="editSubtask(this)">
                      <img src="./assets/icon/pencil.svg">
                  </button>
                  <div class="add-task-form-divider"></div>
                  <button data-index="${i}" data-ticketindex="${dataTicketIndex}" data-ticketcounterid="${dataTicketCounterId}" data-mode="${dataMode}" onclick="deleteSubtask(this, '${subtask.value}'); spliceEditSubArray(this)">
                      <img src="./assets/icon/bin.svg">
                  </button>
                </div>
              </li>
      `;
  }).join("");
  subtaskEditArray = [];
  subtasks.forEach(subtask => subtaskEditArray.push(subtask.text)
  );
  console.log(subtaskEditArray.length);
  
  document.getElementById("subtask-render-div").innerHTML = "";
  document.getElementById("board-task-edit").innerHTML =
  `
<button id="board-task-edit-x"  onclick="popUpAddTask(popuptask)">X</button>
    <div class="add-task-text-div" id="edit-add-task-text-div">
        <div class="span-div">
            <p>Title</p>
        </div>
        <input type="text" placeholder="${title}" id="task-title-edit">
        <p class="margin-top-24">Description</p>
        <textarea name="" id="task-description-edit" placeholder="${description}"></textarea>
        <div class="span-div">
            <p class="margin-top-24">Due date</p>
        </div>
        <input type="date" id="task-date-edit">
        <p class="margin-top-24">Priority</p>
        <div class="add-task-importance-selection">
            <button class="priority-button set-priority" onclick="setPriority('urgent', this)">Urgent <img src="./assets/icon/red-arrows.svg" alt=""></button>
            <button class="priority-button set-priority" onclick="setPriority('medium', this)">Medium <img src="./assets/icon/orange-same.svg" alt=""></button>
            <button class="priority-button set-priority" onclick="setPriority('low', this)">Low <img src="./assets/icon/green-arrows.svg" alt=""></button>
        </div>
        <p class="margin-top-24">Assigned to</p>
        <div id="drop-down-users-input-div">
          <input id="drop-down-users-input" class="drop-down-selection" placeholder="Select Contacts to assign" oninput="filterUsers('drop-down-users-edit', 'edit-render-user', 'drop-down-users-input')" onclick="dropDownUsers('drop-down-users-edit', 'edit-render-user', 'drop-down-users-input-img-edit')">
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
    <button id="board-task-edit-ok" data-ticketindex="${index}" data-ticketcounterid="${ticketCounterId}" data-mode="${mode}" onclick="switchEditInfoMenu(); checkEditedValues(this)">Ok</button>
  `;
  document.querySelectorAll(".set-priority").forEach((ele) => {
  if(ele.innerText.toLowerCase().trim() === priority) {
    ele.classList.add(priority);
    buttonPriority = priority;
  } else {
    ele.classList.remove(ele.innerText.toLowerCase().trim());
  }
  });
}
