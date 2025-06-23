const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskDate = document.getElementById("task-date");
let buttonPriority;
let buttonCategory;
const subtask = document.getElementById("subtask");
let subtaskArray = [];
let progressColumn;
let ticketID = 0;


function setPriority(prio) {   
    buttonPriority = prio;   
}

function setCategory(category) {   
    buttonCategory = category;  
    document.getElementById("category-button").innerText = buttonCategory; 
    document.getElementById("drop-down-category").classList.add("hide");
}

async function dropDownUsers() {
    try {
        let response = await fetch(BASE_URL_USERS);
        let responseJson = await response.json();
        console.log(responseJson);
        iterateContacts(responseJson);
    } catch (error) {
        console.log("error");
    }
}

async function iterateContacts(responseJson) {
    document.getElementById("drop-down-users").classList.toggle("hide");
    document.getElementById("drop-down-users").innerHTML = "";
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
        document.getElementById("drop-down-users").innerHTML += userDropDownTemplate(name, initials, backgroundIndex);   
    }
}

function checkRequiredInput(columnValue) {
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
    if (!hasError) {
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
    let checkboxes = document.querySelectorAll(".user-checkbox");
    let selectedUsers = [];
    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedUsers.push(cb.value);
        }
    });
    return selectedUsers;
}

function addSubtask() {
    subtaskArray.push(subtask.value);
}

async function saveTaskToFirebase(ticketData) {
  try {
    let response = await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket.json`);
    let ticket = await response.json();
    let newId = ticket.length;
    await fetch(`https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/tickets/ticket/${newId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
    });    
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}