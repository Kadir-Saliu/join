function userDropDownTemplate(name, inititals, index, id) {
  return `<div>
                <div>
                    <span class="user-icon User-bc-${index}" data-bcIndex="${index}">${inititals}</span>
                    <p>${name}</p>
                </div>
                <input type="checkbox" class="user-checkbox" value="${name}" onclick="renderSelectedUsers('${id}')">
            </div>`;
}

function ticketTemplate(title, description, category, categoryCss, assignedTo, priority) {
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
        <div class="kanban-task" onclick="popUpAddTask(popuptask)">
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
