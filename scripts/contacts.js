let currentUser = null;
let contacts = [];
let currentOverlayId = null; // Track the currently open overlay

/**
 * Initializes the current user by fetching user data and finding the logged-in user
 */
async function initializeCurrentUser() {
  if (!currentUser) {
    currentUser = Object.entries(await (await fetch(BASE_URL_USERS)).json())
      .map(([id, user]) => ({ id, ...user }))
      .find((user) => user.name === loggedInUser.username);
  }
  return currentUser;
}

/**
 * This function finds the current logged in user, fetches the respective contact list and renders it after the list is sorted
 */
async function showContacts() {
  await initializeCurrentUser();
  contacts = await getContactsData(currentUser);
  contacts.sort((a, b) => a.name.localeCompare(b.name));
  let sortedContacts = {};
  contacts.forEach((contact) => {
    sortContactByInitials(contact, sortedContacts);
  });
  let contactsRef = document.getElementById("contacts");
  contactsRef.innerHTML = "";
  renderContacts(sortedContacts, contactsRef);
}

/**
 * This function takes a sorted array and saves them in an object which has the respective letters as keys
 *
 * @param {string} contact - a contact that gets sorted into respective key value in object
 * @param {Object} sortedContacts - object to save the values in
 */
function sortContactByInitials(contact, sortedContacts) {
  let inital = contact.name.charAt(0).toUpperCase();
  if (!sortedContacts[inital]) {
    sortedContacts[inital] = [];
  }
  sortedContacts[inital].push(contact);
}

/**
 * This function renders the contact list after it has been sorted.
 *
 * @param {object} sortedContacts - object that contains the sorted contacts list
 * @param {Element} contactsRef - the element where the contacts list will be rendered
 */
function renderContacts(sortedContacts, contactsRef) {
  Object.keys(sortedContacts).forEach((inital) => {
    contactsRef.innerHTML += getInitialTemplate(inital);
    sortedContacts[inital].forEach((contact) => {
      let initials = contact.name.split(" ")[0][0] + contact.name.split(" ")[1][0];
      let userName = escapeQuotes(contact.name);
      let email = escapeQuotes(contact.email);
      let phone = escapeQuotes(contact.phone);
      contactsRef.innerHTML += getContactTemplate(initials, userName, email, phone);
    });
  });
}

/**
 * Displays the contact details in the contact details section.
 * @param {string} initials - The contact's initials.
 * @param {string} userName - The contact's name.
 * @param {string} email - The contact's email address.
 * @param {string} phone - The contact's phone number.
 */
const showContactsDetails = (initials, userName, email, phone) => {
  const contactDetailsRef = document.getElementById("contactDetails");
  contactDetailsRef.innerHTML = "";
  contactDetailsRef.innerHTML = getContactDetailsTemplate(initials, userName, email, phone);
  contactDetailsRef.classList.add("active");
};

/**
 * Escapes single quotes in a string for safe usage in HTML or JS.
 * @param {string} str - The input string.
 * @returns {string} The escaped string.
 */
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

function toggleEditContactOverlay() {
  const editOverlayRef = document.getElementById("editOverlay");

  if (editOverlayRef.classList.contains("d_none")) {
    editOverlayRef.classList.remove("d_none");
    setTimeout(() => {
      editOverlayRef.classList.add("active");
    }, 10);
    document.body.addEventListener("click", toggleEditContactOverlay);
    document.querySelector(".body-background-overlay").classList.remove("d_none");
  } else {
    editOverlayRef.classList.remove("active");
    setTimeout(() => {
      editOverlayRef.classList.add("d_none");
    }, 400);
    document.body.removeEventListener("click", toggleEditContactOverlay);
    document.querySelector(".body-background-overlay").classList.add("d_none");
  }
}

/**
 * Toggles the visibility of the add contact overlay.
 */
function toggleAddContactOverlay() {
  const contactOverlayRef = document.getElementById("contactOverlay");

  if (contactOverlayRef.classList.contains("d_none")) {
    contactOverlayRef.classList.remove("d_none");
    setTimeout(() => {
      contactOverlayRef.classList.add("active");
    }, 10);
    document.body.addEventListener("click", toggleAddContactOverlay);
    document.querySelector(".body-background-overlay").classList.remove("d_none");
  } else {
    contactOverlayRef.classList.remove("active");
    setTimeout(() => {
      contactOverlayRef.classList.add("d_none");
    }, 400);
    document.body.removeEventListener("click", toggleAddContactOverlay);
    document.querySelector(".body-background-overlay").classList.add("d_none");
  }
}

function toggleOverlay(id) {
  if (typeof id === "object" && id.type === "click") {
    id = currentOverlayId;
  }
  const overlayRef = document.getElementById(id);
  if (overlayRef.classList.contains("d_none")) {
    currentOverlayId = id;
    openOverlay(overlayRef);
  } else {
    closeOverlay(overlayRef);
  }
}

function openOverlay(overlayRef) {
  overlayRef.classList.remove("d_none");
  setTimeout(() => {
    overlayRef.classList.add("active");
  }, 10);
  document.body.addEventListener("click", toggleOverlay);
  document.querySelector(".body-background-overlay").classList.remove("d_none");
}

function closeOverlay(overlayRef) {
  overlayRef.classList.remove("active");
  setTimeout(() => {
    overlayRef.classList.add("d_none");
  }, 400);
  document.body.removeEventListener("click", toggleOverlay);
  document.querySelector(".body-background-overlay").classList.add("d_none");
}

/**
 * Prevents event bubbling for the given event.
 * @param {Event} event - The event to stop propagation for.
 */
function bubblingPrevention(event) {
  event.stopPropagation();
}

/**
 * Adds a click event listener to the element with the class "add-contact-button".
 * Prevents the click event from bubbling up to parent elements.
 *
 * @param {MouseEvent} event - The click event object.
 */
document.querySelector(".add-contact-button").addEventListener("click", (event) => {
  event.stopPropagation();
});

/**
 * Adds a new contact to the database using values from input fields.
 * Validates that all fields (name, email, phone) are filled.
 * If valid, creates a new contact object and saves it to the database,
 * updates the contact list, closes the add contact overlay, and clears the form.
 * Alerts the user if any field is missing.
 *
 * @async
 * @function addContactToDatabase
 * @returns {Promise<void>}
 */
async function addContactToDatabase() {
  let name = document.getElementById("contactName").value;
  let email = document.getElementById("contactEmail").value;
  let phone = document.getElementById("contactPhone").value;
  if (name && email && phone) {
    let newContact = {
      name: name,
      email: email,
      phone: phone,
    };
    putNewContactToDatabase(newContact);
    showContacts();
    toggleAddContactOverlay();
    clearContactForm();
  } else {
    alert("Please fill in all fields.");
  }
}

/**
 * Adds a new contact to the Firebase Realtime Database for the current user.
 *
 * Sends a PUT request to the database, storing the provided contact object
 * under the path `/contacts/{currentUser.id}/{contacts.length + 1}.json`.
 *
 * @async
 * @param {Object} contact - The contact object to be added to the database.
 * @returns {Promise<void>} A promise that resolves when the contact has been added.
 */
async function putNewContactToDatabase(contact) {
  await fetch(
    `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts/${currentUser.id}/${
      contacts.length + 1
    }.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    }
  );
  showContacts();
}

/**
 * Clears the values of the contact form input fields: name, email, and phone.
 * Resets the input fields with IDs 'contactName', 'contactEmail', and 'contactPhone' to empty strings.
 */
function clearContactForm() {
  document.getElementById("contactName").value = "";
  document.getElementById("contactEmail").value = "";
  document.getElementById("contactPhone").value = "";
}

/**
 * Deletes the currently selected contact from the Firebase database.
 *
 * This function retrieves the contact name from the DOM, finds the corresponding contact object,
 * and sends a DELETE request to remove the contact from the database. After deletion, it clears
 * the contact details section in the UI and refreshes the contact list.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the contact has been deleted and the UI updated.
 */
async function deleteContactFromDatabase() {
  const contactName = document.querySelector(".contact-information-username").innerText;
  const contact = contacts.find((contact) => contact.name === contactName);
  await fetch(
    `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts/${currentUser.id}/${contact.firebaseKey}.json`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  document.getElementById("contactDetails").innerHTML = "";
  showContacts();
}
