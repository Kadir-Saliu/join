function userDropDownTemplate(name, inititals, index, id) {
  return `<div>
                <div>
                    <span class="user-icon User-bc-${index}" data-bcIndex="${index}">${inititals}</span>
                    <p>${name}</p>
                </div>
                <input type="checkbox" class="user-checkbox" value="${name}" onclick="renderSelectedUsers('${id}')">
            </div>`;
}

function ticketTemplate(title, description, category, categoryCss, assignedTo, priority, index) {
  let userSpans = assignedTo
    .map((user, i) => {
      let initials = user
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return `<span class="user-icon User-bc-${(i + 1) % 15}">${initials}</span>`;
    })
    .join("");    

    return `
        <div class="kanban-task" data-ticketIndex="${index}" data-mode="view" onclick="popUpAddTask(popuptask); renderTicketOverlay(this)">
            <div class="task-type ${categoryCss}">${category}</div>
            <h4>${title}</h4>
            <p>${description}</p>
            <div>
                <div>
                    <div></div>
                </div>
                <p id="p-subtask-${index}" class="hide">Subtasks</p>
            </div>
            <div class="assigned-users">
              <div>
              ${userSpans}
              </div>
              <img src="./assets/icon/${priority}.svg" alt="" />
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

async function renderTicketDetails(category, categoryColor, title, description, date, priority, assignedTo, subtasks, index) {  
    let userSpans = assignedTo.map((user, i) => {
        let initials = user.split(" ").map(n => n[0]).join("").toUpperCase();
        return `<div class="ticket-detail-user-div">
                    <span class="user-icon User-bc-${(i + 1) % 15}">${initials}</span>
                    <span>${user}</span>
                </div>
        `;
    }).join("");

    let subtaskEle = subtasks.map((subtask, i) => {        
        return `<li><input data-index="${i}" ${subtask.checked ? "checked" : ""} data-ticketindex="${index}" type="checkbox" onclick="toggleSubtask(this)">${subtask.text}</li>
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
        <span>${priority} <img src="./assets/icon/${priority}.svg" alt=""></span>
    </div>
    <div class="pop-up-margin-b-25" id="assigned-users-div">
       ${userSpans}
    </div>
    <div id="subtasks-div" class="pop-up-margin-b-25">
        <p>Subtasks</p>
        <ul>${subtaskEle}</ul>
    </div>
    <div id="pop-up-bottom-buttons">
        <button onclick="deleteTicket(${index})"><img src="./assets/icon/bin.svg" alt="">Delete</button>
        <div></div>
        <button data-ticketIndex=${index} data-mode="edit" onclick="switchEditInfoMenu(this)"><img src="./assets/icon/pencil.svg" alt="">Edit</button>
    </div>`
}



async function editTicket (title, description, priority, assignedTo, subtasks, index, mode) {
  let userSpans = assignedTo.map((user, i) => {
        let initials = user.split(" ").map(n => n[0]).join("").toUpperCase();
        return `<span data-name="${user}" class="user-icon User-bc-${(i + 1) % 15} user-icon-selected">${initials}</span>`;
    }).join("");
  let subtaskEle = subtasks.map((subtask, i) => {        
      return `<li class="subtask-li" data-index="${i}">${subtask.text}</li>
      `;
  }).join("");

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
        <input id="drop-down-users-input" class="drop-down-selection" placeholder="Select Contacts to assign" onclick="dropDownUsers('drop-down-users-edit', 'edit-render-user')">
        <div id="drop-down-users-edit" class="hide">
        </div>
        <div id="edit-render-user">${userSpans}</div>
        <p class="margin-top-24">Subtasks</p>
        <div class="subtask-div">
            <input type="text" name="" id="edit-subtask" placeholder="Add new subtask">
            <button onclick="addNewSubtask()">+</button>
        </div>
        <ul id="subtask-edit-render">
        ${subtaskEle}
        </ul>
    </div>
    <button id="board-task-edit-ok" data-ticketindex="${index}" data-mode="${mode}" onclick="switchEditInfoMenu(); checkEditedValues(this)">Ok</button>
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
