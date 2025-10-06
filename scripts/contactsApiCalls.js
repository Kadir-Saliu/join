/**
 * Initializes the current user by fetching user data and finding the logged-in user
 */
const initializeCurrentUser = async () => {
  if (!currentUser) {
    currentUser = Object.entries(await (await fetch(BASE_URL_USERS)).json())
      .map(([id, user]) => ({ id, ...user }))
      .find((user) => user.name === loggedInUser.username);
  }
  return currentUser;
};

/**
 * Adds a new contact to the Firebase Realtime Database for the current user.
 *
 * Sends a PUT request to the database, storing the provided contact object
 * under the path `/contacts/{currentUser.id}/{nextKey}.json` where nextKey is
 * the highest existing firebaseKey + 1, but skips 10000 (guest key).
 *
 * @async
 * @param {Object} contact - The contact object to be added to the database.
 * @returns {Promise<void>} A promise that resolves when the contact has been added.
 */
const putNewContactToDatabase = async (contact) => {
  const filteredKeys = firebaseKeys.filter((key) => key !== 10000);
  let newKey = filteredKeys.length > 0 ? Math.max(...filteredKeys) + 1 : 1;
  newKey === 10000 ? (newKey = 10001) : (newKey = newKey);
  await fetch(`${BASE_URL}contacts/${currentUser.id}/${newKey}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });
  await showContacts();
};

/**
 * Updates an existing contact in the Firebase Realtime Database with the provided edited contact data.
 *
 * @async
 * @function
 * @param {Object} editedContact - The updated contact data to be saved in the database.
 * @param {Object} contact - The original contact object, containing at least the `firebaseKey` property.
 * @returns {Promise<void>} A promise that resolves when the contact has been updated in the database.
 */
const putEditedContactToDatabase = async (editedContact, contact) => {
  await fetch(`${BASE_URL}contacts/${currentUser.id}/${contact.firebaseKey}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editedContact),
  });
  showEditSuccessMessage();
};

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
const deleteContactFromDatabase = async () => {
  const contactName = document.querySelector(".contact-information-username").innerText;
  const contact = contacts.find((contact) => contact.name === contactName);
  await fetch(`${BASE_URL}contacts/${currentUser.id}/${contact.firebaseKey}.json`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  finishEdit();
  hideContactDetails();
  showDeleteSuccessMessage();
};

/**
 * Displays the contact details header as an overlay.
 *
 * This function makes the `#header-contacts` element visible and positions it
 * as a fixed overlay between 8vh from the top and 10vh from the bottom of the viewport.
 * It also sets styling such as background color and z-index to ensure it appears
 * above other content. Additionally, it reveals the "leave contact details" button.
 *
 * @function popUpContactDetails
 * @returns {void} - No return value, modifies DOM elements directly.
 */
const popUpContactDetails = () => {
  const header = document.getElementById("header-contacts");
  if (header) {
    header.style.display = "flex";
    header.style.position = "fixed";
    header.style.top = "8vh";
    header.style.bottom = "10vh";
    header.style.left = "0";
    header.style.right = "0";
    header.style.backgroundColor = "rgb(246, 247, 248)";
    document.getElementById("leave-contact-details-btn").classList.remove("hide");
  }
};

/**
 * Hides the contact details section by setting its display style to "none".
 * Targets the element with the ID "header-contacts".
 */
const hideContactDetails = () => {
  document.getElementById("header-contacts").style.display = "none";
};

/**
 * Validates a German phone number.
 *
 * Accepts numbers starting with +49, 0049, or 0, followed by a valid mobile prefix (15, 16, or 17) and 7-8 digits.
 *
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  if (!phoneRegex.test(phone)) {
    return false;
  }
  return true;
};

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

/**
 * Scrolls to a specific contact in the contacts list
 * @param {string} contactName - The name of the contact to scroll to
 */
const scrollToNewContact = (newContact) => {
  const initials = newContact.name.split(" ")[0][0] + newContact.name.split(" ")[1][0];
  const contact = document.querySelector(`[data-contact="${newContact.name}"]`);
  const contactData = contacts.find((c) => c.name === newContact.name);
  const contactIconId = ((contactData.firebaseKey - 1) % 15) + 1;
  contact.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  showContactsDetails(initials, newContact.name, newContact.email, newContact.phone, contactIconId, contact);
};
