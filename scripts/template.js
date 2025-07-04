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
    let userSpans = assignedTo.map((user, i) => {
        let initials = user.split(" ").map(n => n[0]).join("").toUpperCase();
        return `<span class="user-icon User-bc-${(i + 1) % 15}">${initials}</span>`;
    }).join("");
    

    return `
        <div class="kanban-task" data-ticketIndex="${index}" onclick="popUpAddTask(popuptask); renderTicketOverlay(this)">
            <div class="task-type ${categoryCss}">${category}</div>
            <h4>${title}</h4>
            <p>${description}</p>
            <div>
                <div>
                    <div></div>
                </div>
                <p></p>
            </div>
            <div class="assigned-users">
              <div>
              ${userSpans}
              </div>
              <img src="./assets/icon/${priority}.svg" alt="" />
            </div>
          </div>
    `
}

async function renderTicketDetails(category, categoryColor, title, description, date, priority, assignedTo, subtasks) {
    let userSpans = assignedTo.map((user, i) => {
        let initials = user.split(" ").map(n => n[0]).join("").toUpperCase();
        return `<span class="user-icon User-bc-${(i + 1) % 15}">${initials}</span>
                <span>${user}</span>
        `;
    }).join("");

    let subtaskEle = subtasks.map((subtask) => {        
        return `<p >${subtask}</p>
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
        ${subtaskEle}
    </div>
    <div id="pop-up-bottom-buttons">
        <button><img src="./assets/icon/bin.svg" alt="">Delete</button>
        <div></div>
        <button onclick="switchEditInfoMenu()"><img src="./assets/icon/pencil.svg" alt="">Edit</button>
    </div>`
}