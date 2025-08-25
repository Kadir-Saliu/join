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
  let userSpansArray = await Promise.all(
    assignedTo.map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return `<span class="user-icon-rendered User-bc-${safeIndex}">${initials}</span>`;
    })
  );

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
              <img src="${priority[0] && priority !== "-" ? `./assets/icon/${priority}.svg` : ""}" alt="" />
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

function getEditOverlayContentTemplate(initials, userName, email, phone) {
  return /*html*/ `
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
async function renderTicketDetails(
  category,
  categoryColor,
  title,
  description,
  date,
  priority,
  assignedTo,
  subtasks,
  index,
  ticketCounterId
) {
  let userSpansArray = await Promise.all(
    assignedTo.map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return `<div class="ticket-detail-user-div">
                    <span class="user-icon-rendered User-bc-${safeIndex}">${initials}</span>
                    <span>${user}</span>
                </div>
        `;
    })
  );

  let userSpans = userSpansArray.join("");

  let subtaskEle = subtasks
    .map((subtask, i) => {
      return `<li><input data-index="${i}" ${
        subtask.checked ? "checked" : ""
      } data-ticketindex="${index}" data-ticketcounterid="${ticketCounterId}" type="checkbox" onclick="toggleSubtask(this)">${
        subtask.text
      }</li>
        `;
    })
    .join("");

  document.getElementById("board-task-information").innerHTML = `<div id="task-pop-up-nav">
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
        <div></div>
        <button data-ticketIndex=${index} data-ticketcounterid="${ticketCounterId}" data-mode="edit" onclick="switchEditInfoMenu(this); setGlobalEditInformation(this)"><img src="./assets/icon/pencil.svg" alt="">Edit</button>
    </div>`;
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
async function editTicket(title, description, priority, assignedTo, subtasks, index, mode, ticketCounterId) {
  let userSpansArray = await Promise.all(
    assignedTo.map(async (user, i) => {
      let renderedUserBgIndex = await getUserDetails(user);
      let safeIndex = ((renderedUserBgIndex - 1) % 15) + 1;
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return `<span data-name="${user}" class="user-icon-rendered User-bc-${safeIndex} user-icon-selected">${initials}</span>`;
    })
  );

  let userSpans = userSpansArray.join("");

  let subtaskEle = subtasks
    .map((subtask, i) => {
      return `<li class="subtask-li" data-index="${i}" onmouseenter="hoverButtons(this)" onmouseleave="removeHoverButtons(this)">
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
    })
    .join("");
  subtaskEditArray = [];
  subtasks.forEach((subtask) => subtaskEditArray.push(subtask.text));
  console.log(subtaskEditArray.length);

  document.getElementById("subtask-render-div").innerHTML = "";
  document.getElementById("board-task-edit").innerHTML = /*html*/ `
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
        <input type="date" id="task-date-edit">
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
    <button id="board-task-edit-ok" data-ticketindex="${index}" data-ticketcounterid="${ticketCounterId}" data-mode="${mode}" onclick="switchEditInfoMenu(); checkEditedValues(this)">Ok</button>
  `;
  document.querySelectorAll(".set-priority").forEach((ele) => {
    if (ele.innerText.toLowerCase().trim() === priority) {
      ele.classList.add(priority);
      buttonPriority = priority;
    } else {
      ele.classList.remove(ele.innerText.toLowerCase().trim());
    }
  });
}

function getRenderTasksTemplate() {
  return `
             <div onclick="goToBoardHtml()" class="toDo-and-done">
              <div class="to-do">
                <a href=""
                  ><svg xmlns="http://www.w3.org/2000/svg" width="69" height="70" viewBox="0 0 69 70" fill="none">
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
                    </g></svg
                ></a>
                <div class="center">
                  <h3>${toDos}</h3>
                  <p>To-do</p>
                </div>
              </div>
              <div onclick="goToBoardHtml()" class="done">
                <a href=""
                  ><svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
                    <circle class="change-circle-color" cx="35" cy="35" r="34.5" fill="#2A3647" />
                    <path
                      class="change-contents-color"
                      d="M20.0283 35.0001L31.2571 46.0662L49.9717 23.9341"
                      stroke="white"
                      stroke-width="7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg
                ></a>
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
