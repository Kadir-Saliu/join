function userDropDownTemplate(name, inititals, index, id) {
    return `<div>
                <div>
                    <span class="user-icon User-bc-${index}">${inititals}</span>
                    <p>${name}</p>
                </div>
                <input type="checkbox" class="user-checkbox" value="${name}" onclick="renderSelectedUsers('${id}')">
            </div>`;
}

function ticketTemplate(title, description, category, categoryCss) {
    return `
        <div class="kanban-task" onclick="popUpAddTask(popuptask)">
            <div class="task-type ${categoryCss}">${category}</div>
            <h4>${title}</h4>
            <p>${description}</p>
            <div class="assigned-users">
              <div>
              </div>
              <img src="" alt="" />
            </div>
          </div>
    `
}