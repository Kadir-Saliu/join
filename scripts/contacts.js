let currentUser = null;
let contacts = [];
let currentOverlayId = null;
const firebaseKeys = [];
const name = document.getElementById("contactName");
const email = document.getElementById("contactEmail");
const phone = document.getElementById("contactPhone");

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

const cacheFirebaseKeys = () => {
  contacts.forEach((contact) => {
    if (contact.firebaseKey) {
      firebaseKeys.push(parseInt(contact.firebaseKey));
    }
  });
};

/**
 * This function finds the current logged in user, fetches the respective contact list and renders it after the list is sorted
 */
async function showContacts() {
  await initializeCurrentUser();
  contacts = await getContactsData(currentUser);
  cacheFirebaseKeys();
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

/**
 * Toggles the visibility of an overlay element by its ID.
 * If the overlay is hidden, it opens it; if it's visible, it closes it.
 * Handles both string IDs and click event objects.
 *
 * @param {string|Event} id - The overlay element ID or a click event object
 */
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

/**
 * Opens an overlay by removing the hidden class and adding the active class.
 * Also adds a click listener to the body and shows the background overlay.
 *
 * @param {HTMLElement} overlayRef - The overlay DOM element to open
 */
function openOverlay(overlayRef) {
  overlayRef.classList.remove("d_none");
  setTimeout(() => {
    overlayRef.classList.add("active");
  }, 10);
  document.body.addEventListener("click", toggleOverlay);
  document.querySelector(".body-background-overlay").classList.remove("d_none");
}

/**
 * Closes an overlay by removing the active class and adding the hidden class.
 * Also removes the click listener from the body and hides the background overlay.
 *
 * @param {HTMLElement} overlayRef - The overlay DOM element to close
 */
function closeOverlay(overlayRef) {
  overlayRef.classList.remove("active");
  setTimeout(() => {
    overlayRef.classList.add("d_none");
  }, 400);
  document.body.removeEventListener("click", toggleOverlay);
  document.querySelector(".body-background-overlay").classList.add("d_none");
}

/**
 * Opens the edit overlay and populates it with content.
 * Shows the overlay by adding the active class, removing the hidden class,
 * displaying the background overlay, and adding a click listener to close it.
 */
const openEditOverlay = (initials, userName, email, phone) => {
  const editOverlayRef = document.getElementById("editOverlay");
  editOverlayRef.innerHTML = getEditOverlayContentTemplate(initials, userName, email, phone);
  if (editOverlayRef.classList.contains("d_none")) {
    editOverlayRef.classList.add("active");
    editOverlayRef.classList.remove("d_none");
    document.querySelector(".body-background-overlay").classList.remove("d_none");
    document.body.addEventListener("click", closeEditOverlay);
  }
};

/**
 * Closes the edit overlay by removing the active class and adding the hidden class.
 * Also hides the background overlay and removes event listeners.
 */
const closeEditOverlay = () => {
  const editOverlayRef = document.getElementById("editOverlay");
  editOverlayRef.classList.remove("active");
  editOverlayRef.classList.add("d_none");
  document.querySelector(".body-background-overlay").classList.add("d_none");
};

/**
 * Opens the edit overlay while preventing event bubbling.
 * Stops the propagation of the given event and then opens the edit overlay.
 *
 * @param {Event} event - The event object to stop propagation for
 */
const openEditOverlayWithBubblingPrevention = (event, initials, userName, email, phone) => {
  event.stopPropagation();
  openEditOverlay(initials, userName, email, phone);
};

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
  if (!name.value || !email.value || !phone.value) {
    alert("Bitte fülle alle Felder aus.");
    return;
  }
  let newContact = {
    name: name.value,
    email: email.value,
    phone: phone.value,
  };
  putNewContactToDatabase(newContact);
  showContacts();
  toggleOverlay("contactOverlay");
  clearContactForm();
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
 * Clears the values of the edit contact form fields (name, email, and phone).
 * Resets the input fields to empty strings if they exist in the DOM.
 */
const clearEditForm = () => {
  const editContactName = document.getElementById("editContactName");
  const editContactEmail = document.getElementById("editContactEmail");
  const editContactPhone = document.getElementById("editContactPhone");

  if (editContactName && editContactEmail && editContactPhone) {
    editContactName.value = "";
    editContactEmail.value = "";
    editContactPhone.value = "";
  }
};

/**
 * Adds a new contact to the Firebase Realtime Database for the current user.
 *
 * Sends a PUT request to the database, storing the provided contact object
 * under the path `/contacts/{currentUser.id}/{nextKey}.json` where nextKey is
 * the highest existing firebaseKey + 1.
 *
 * @async
 * @param {Object} contact - The contact object to be added to the database.
 * @returns {Promise<void>} A promise that resolves when the contact has been added.
 */
async function putNewContactToDatabase(contact) {
  const newKey = Math.max(...firebaseKeys) + 1;
  await fetch(
    `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts/${currentUser.id}/${newKey}.json`,
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
 * Saves the edited contact information to the Firebase database.
 *
 * This function retrieves the currently selected contact's name from the DOM,
 * finds the corresponding contact object, collects the edited values from the
 * input fields, and updates the contact in the database using a PUT request.
 * After saving, it closes the edit overlay, clears the edit form, and refreshes
 * the contact list display.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the contact has been updated and the UI refreshed.
 */
async function saveEditedContactToDatabase() {
  const contactName = document.querySelector(".contact-information-username").innerText;
  const contact = contacts.find((contact) => contact.name === contactName);
  const editedContact = {
    name: document.getElementById("editContactName").value,
    email: document.getElementById("editContactEmail").value,
    phone: document.getElementById("editContactPhone").value,
  };
  await fetch(
    `https://join-3193b-default-rtdb.europe-west1.firebasedatabase.app/contacts/${currentUser.id}/${contact.firebaseKey}.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedContact),
    }
  );
  finishEdit();
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
  finishEdit();
}

/**
 * Finalizes the contact editing process by clearing the contact details display,
 * closing the edit overlay, resetting the edit form, and refreshing the contact list.
 */
const finishEdit = () => {
  document.getElementById("contactDetails").innerHTML = "";
  closeEditOverlay();
  clearEditForm();
  showContacts();
};
