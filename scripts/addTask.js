const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskDate = document.getElementById("task-date");
let buttonPriority;
let buttonCategory;
const subtask = document.getElementById("subtask");
let subtaskArray = [];
let progressColumn;
let ticketID = 0;
const addedUserfeedback = document.getElementById("added-userfeedback");
let subtaskCounter = 0;
let columnVal = 'To do';
let ticketCounter = 0;

document.getElementById("create-task-button").onclick = function () {
    checkRequiredInput(columnVal, true);
};

function setPriority(prio, clickedButton) {   
    buttonPriority = prio;
    let buttons = document.querySelectorAll(".priority-button");
    buttons.forEach(btn => btn.classList.remove("urgent", "medium", "low"));
    clickedButton.classList.add(clickedButton.innerText.toLowerCase().trim());
}

function setCategory(category, idButton, idDropDown) {   
    buttonCategory = category;  
    document.getElementById(idButton).innerText = buttonCategory; 
    document.getElementById(idDropDown).classList.add("hide");
}

async function dropDownUsers(id, renderId, imgId) {
    try {
        let response = await fetch(BASE_URL_USERS);
        let responseJson = await response.json();
        changeDropDownArrow(imgId);
        iterateContacts(responseJson, id, renderId);
    } catch (error) {
        console.log("error");
    }
}

async function filterUsers(id, renderId) {
    try {
        let response = await fetch(BASE_URL_USERS);
        let responseJson = await response.json();
        iterateUsers(responseJson, id, renderId);
    } catch (error) {
        console.log("error");
    }
}

function iterateUsers(users, dropDownId, renderId) {
    let name;
    let initials;
    let id;
    document.getElementById('drop-down-users').innerHTML = "";
    users.forEach(user => {
        if(user?.name.toLowerCase().includes(document.getElementById("drop-down-users-input").value.toLowerCase())) {
            name = user?.name;
            id= user?.id;
            initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
            document.getElementById(dropDownId).innerHTML += userDropDownTemplate(name, initials, id, renderId); 
        }  
    });
}

async function iterateContacts(responseJson, id, renderId) {
    document.getElementById(id).classList.toggle("hide");
    document.getElementById(id).innerHTML = "";
    let backgroundIndex = 0;
    for (let index = 0; index < responseJson.length; index++) {
        let name = responseJson[index]?.name
        if (!name) {
            continue;
        }
        if(backgroundIndex > 14) {
            backgroundIndex = 1;
        } else {
            backgroundIndex ++;
        }
        let initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
        document.getElementById(id).innerHTML += userDropDownTemplate(name, initials, backgroundIndex, renderId);   
    }
}

async function changeDropDownArrow(id) {
    if(document.getElementById(id).src.includes("arrow_down")) {
        document.getElementById(id).src = "./assets/imgs/arrow_up.png"
    } else if (document.getElementById(id).src.includes("arrow_up")) {
        document.getElementById(id).src = "./assets/imgs/arrow_down.png"
    }
};

function checkRequiredInput(columnValue, validation) {
    let hasError = false;
    if (!taskTitle.value) {
        document.getElementById("missing-title-info").classList.remove("hide");
        taskTitle.style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-title-info").classList.add("hide");
        taskTitle.style.border = "";
    }
    if (!taskDate.value) {
        document.getElementById("missing-date-info").classList.remove("hide");
        taskDate.style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-date-info").classList.add("hide");
        taskDate.style.border = "";
    }
    if (document.getElementById("category-button").innerText === "Select task category") {
        document.getElementById("missing-category-info").classList.remove("hide");
        document.getElementById("category-button").style.border = "1px solid red";
        hasError = true;
    } else {
        document.getElementById("missing-category-info").classList.add("hide");
        document.getElementById("category-button").style.border = "";
    }
    if (!hasError && validation) {
        createNewTicket(columnValue);
    }
}

async function createNewTicket(columnValue) {
    let selectedUsers = getSelectedUsers();
    let newTicket = {
        title: taskTitle.value,
        description: taskDescription.value,
        date: taskDate.value,
        priority: buttonPriority,
        assignedTo: selectedUsers,
        category: buttonCategory,
        subtask: subtaskArray,
        column: columnValue,
    }
    await saveTaskToFirebase(newTicket);
}

function getSelectedUsers() {
    let userIcons = document.querySelectorAll(".user-icon-selected");
    let selectedUsers = [];
    userIcons.forEach(uI => {
            selectedUsers.push(uI.dataset.name);
        }
    );
    return selectedUsers;
}

function renderSelectedUsers(id) {
    let checkboxes = document.querySelectorAll(".user-checkbox");
    let userIconClasses = document.querySelectorAll(".user-icon");
    document.getElementById(id).innerHTML = "";        
    checkboxes.forEach(cb => {
        if (cb.checked) {
            let userIconColor = "";            
            let initials = cb.value.split(" ").map(n => n[0]).join("").toUpperCase();
            userIconClasses.forEach(spanClass => {
                if(spanClass.innerText === initials) {
                    userIconColor = spanClass.dataset.bcindex;
                } 
            });
            document.getElementById(id).innerHTML += `<span class="user-icon-selected User-bc-${userIconColor}" data-bcindex="${userIconColor}" data-name="${cb.value}">${initials}</span>`
        }
    }); 
}

function addSubtask() {
    if(subtask.value) {
        subtaskArray.push({
            text: subtask.value,
            checked: subtask.checked
        });
        document.getElementById("subtask-render-div").innerHTML +=`<li onmouseenter="hoverButtons(this)" onmouseleave="removeHoverButtons(this)">
                                                                        ${subtask.value} 
                                                                        <div class="li-buttons hide">
                                                                            <button>
                                                                                <img src="./assets/icon/pencil.svg">
                                                                            </button>
                                                                            <div class="add-task-form-divider"></div>
                                                                            <button data-index="${subtaskCounter}" onclick="deleteSubtask(this)">
                                                                                <img src="./assets/icon/bin.svg">
                                                                            </button>
                                                                        </div>
                                                                    </li>`;
        subtaskCounter++;
        subtask.value = "";
    }
}

function hoverButtons(ele) {
    console.log(ele.firstElementChild);
    ele.firstElementChild.classList.remove("hide");
}

function removeHoverButtons(ele) {
    ele.firstElementChild.classList.add("hide");
}

function clearTask() {
    taskTitle.value = "";
    taskDescription.value = "";
    taskDate.value = "";
    resetPriority();
    document.getElementById("render-selected-users").innerHTML = "";
    setCategory("Select task category");
    subtaskArray = [];
    document.getElementById("subtask-render-div").innerHTML = "";
}

function resetPriority() {   
    buttonPriority = "";
    let buttons = document.querySelectorAll(".priority-button");
    buttons.forEach(btn => btn.classList.remove("urgent", "medium", "low"));
}

function deleteSubtask(ele) {
    for (let index = 0; index < subtaskArray.length; index++) {
        if(ele.parentElement.parentElement.innerText === subtaskArray[index].text && ele.dataset.index == index) {
            subtaskArray.splice(index, 1);         
        }
    }
    subtaskCounter--;
    ele.parentElement.parentElement.remove();
}

async function saveTaskToFirebase(ticketData) {
  try {
    let counterResponse = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticketCounter.json`);
    let ticketCounter = await counterResponse.json();

    if (ticketCounter === null) {
      ticketCounter = 0;
    }
    ticketCounter++;

    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${ticketCounter}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
    });
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticketCounter.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketCounter)
    });
    addedUserfeedback.classList.remove("hide");
    addedUserfeedback.classList.add("show");
    setTimeout(() => {
      window.location.href = "board.html";
    }, 1000);
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}