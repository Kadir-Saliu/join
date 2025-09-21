let currentUser = null;
let contacts = [];
let currentOverlayId = null;
const firebaseKeys = [];
const name = document.getElementById("contactName");
const email = document.getElementById("contactEmail");
const phone = document.getElementById("contactPhone");

/**
 * Iterates over the global `contacts` array and pushes each contact's
 * `firebaseKey` (converted to an integer) into the global `firebaseKeys` array,
 * if the contact has a `firebaseKey` property.
 */
const cacheFirebaseKeys = () => {
  firebaseKeys.length = 0;
  contacts.forEach((contact) => {
    if (contact.firebaseKey) {
      firebaseKeys.push(parseInt(contact.firebaseKey));
    }
  });
};

/**
 * This function finds the current logged in user, fetches the respective contact list and renders it after the list is sorted
 */
const showContacts = async () => {
  await initializeCurrentUser();
  contacts = await getContactsData(currentUser);
  cacheFirebaseKeys();
  contacts.sort((a, b) => a.name.localeCompare(b.name));
  let sortedContacts = {};
  contacts.forEach(async (contact) => {
    sortContactByInitials(contact, sortedContacts);
  });
  let contactsRef = document.getElementById("contacts");
  contactsRef.innerHTML = "";
  renderContacts(sortedContacts, contactsRef);
};

/**
 * This function takes a sorted array and saves them in an object which has the respective letters as keys
 *
 * @param {string} contact - a contact that gets sorted into respective key value in object
 * @param {Object} sortedContacts - object to save the values in
 */
const sortContactByInitials = (contact, sortedContacts) => {
  let inital = contact.name.charAt(0).toUpperCase();
  if (!sortedContacts[inital]) {
    sortedContacts[inital] = [];
  }
  sortedContacts[inital].push(contact);
};

/**
 * This function renders the contact list after it has been sorted.
 *
 * @param {object} sortedContacts - object that contains the sorted contacts list
 * @param {Element} contactsRef - the element where the contacts list will be rendered
 */
const renderContacts = (sortedContacts, contactsRef) => {
  Object.keys(sortedContacts).forEach((inital) => {
    contactsRef.innerHTML += getInitialTemplate(inital);
    sortedContacts[inital].forEach((contact) => {
      let initials = contact.name.split(" ")[0][0] + contact.name.split(" ")[1][0];
      let userName = escapeQuotes(contact.name);
      let email = escapeQuotes(contact.email);
      let phone = escapeQuotes(contact.phone);
      let safeIndex = contact.firebaseKey;
      let contactIconId = ((safeIndex - 1) % 15) + 1;
      contactsRef.innerHTML += getContactTemplate(initials, userName, email, phone, contactIconId, contact);
    });
  });
};

/**
 * Displays the contact details in the contact details section.
 * @param {string} initials - The contact's initials.
 * @param {string} userName - The contact's name.
 * @param {string} email - The contact's email address.
 * @param {string} phone - The contact's phone number.
 * @param {HTMLElement} clickedElement - The clicked contact element.
 */
const showContactsDetails = (initials, userName, email, phone, contactIconId, clickedElement) => {
  document.querySelectorAll(".contact").forEach((contact) => contact.classList.remove("active"));
  document.querySelectorAll(".contact-initials").forEach((contactInitials) => contactInitials.classList.remove("active"));
  clickedElement.classList.add("active");
  const initialsElement = clickedElement.querySelector(".contact-initials");
  initialsElement.classList.add("active");
  const contactDetailsRef = document.getElementById("contactDetails");
  contactDetailsRef.innerHTML = "";
  contactDetailsRef.innerHTML = getContactDetailsTemplate(initials, userName, email, phone, contactIconId);
  contactDetailsRef.classList.add("active");
  if (window.innerWidth <= 1130) popUpContactDetails();
};

/**
 * Escapes single quotes in a string for safe usage in HTML or JS.
 * @param {string} str - The input string.
 * @returns {string} The escaped string.
 */
const escapeQuotes = (str) => {
  return str.replace(/'/g, "\\'");
};

/**
 * Toggles the visibility of the "add contact" overlay.
 * If the overlay is hidden, it will be shown and an event listener will be added to close it when clicking outside.
 * Also displays a background overlay to indicate modal state.
 */
const openAddContactOverlay = (event) => {
  event.stopPropagation();
  const contactOverlayRef = document.getElementById("addContactOverlay");
  if (contactOverlayRef.classList.contains("d_none")) {
    contactOverlayRef.classList.remove("d_none");
    contactOverlayRef.classList.add("active");
    document.querySelector(".body-background-overlay").classList.remove("d_none");
    document.body.addEventListener("click", closeAddContactOverlay);
  }
};

/**
 * Closes the contact overlay by removing the "active" class and adding the "d_none" class
 * to hide the overlay and its background. Also hides the body background overlay.
 */
const closeAddContactOverlay = () => {
  const contactOverlayRef = document.getElementById("addContactOverlay");
  contactOverlayRef.classList.remove("active");
  contactOverlayRef.classList.add("d_none");
  document.querySelector(".body-background-overlay").classList.add("d_none");
  document.getElementById("name-error-msg").classList.add("hide");
  document.getElementById("email-error-msg").classList.add("hide");
  document.getElementById("phone-error-msg").classList.add("hide");
};

/**
 * Opens the edit overlay and populates it with content.
 * Shows the overlay by adding the active class, removing the hidden class,
 * displaying the background overlay, and adding a click listener to close it.
 */
const openEditOverlay = (initials, userName, email, phone, contactIconId) => {
  const editOverlayRef = document.getElementById("editOverlay");
  editOverlayRef.innerHTML = getEditOverlayContentTemplate(initials, userName, email, phone, contactIconId);
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
const openEditOverlayWithBubblingPrevention = (event, initials, userName, email, phone, contactIconId) => {
  event.stopPropagation();
  openEditOverlay(initials, userName, email, phone, contactIconId);
};

/**
 * Prevents event bubbling for the given event.
 * @param {Event} event - The event to stop propagation for.
 */
const bubblingPrevention = (event) => {
  event.stopPropagation();
};

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
 * Validates that all fields (name, email, phone) are filled and that the name
 * contains both first name and surname.
 * If valid, creates a new contact object and saves it to the database,
 * updates the contact list, closes the add contact overlay, and clears the form.
 * Alerts the user if any field is missing or name format is invalid.
 *
 * @async
 * @function addContactToDatabase
 * @returns {Promise<void>}
 */
const addContactToDatabase = async (nameVal, emailVal, phoneVal) => {
  const nameValue = name.value;
  const emailValue = email.value;
  const phoneValue = phone.value;
  if (!overlayValidation(nameValue, emailValue, phoneValue, nameVal, emailVal, phoneVal)) return;
  let newContact = { name: nameValue, email: emailValue, phone: phoneValue };
  await putNewContactToDatabase(newContact);
  closeAddContactOverlay();
  clearContactForm();
  showAddSuccessMessage();
  setTimeout(() => {
    scrollToNewContact(newContact);
  }, 100);
};

/**
 * Displays an "add contact successful" message with fade-in and fade-out animations.
 * The message appears after 50ms, stays visible for 2 seconds, then fades out
 * over 400ms before being hidden again.
 *
 * @function showAddSuccessMessage
 * @description Shows the add contact success message element by manipulating CSS classes
 * to create a smooth animation sequence (show → fade in → fade out → hide).
 */
const showAddSuccessMessage = () => {
  const successMessageRef = document.querySelector(".add-contact-successful");
  successMessageRef.classList.remove("d_none");
  setTimeout(() => {
    successMessageRef.classList.add("active");
  }, 50);
  setTimeout(() => {
    successMessageRef.classList.remove("active");
    setTimeout(() => {
      successMessageRef.classList.add("d_none");
    }, 400);
  }, 2000);
};

/**
 * Displays a "delete contact successful" message with fade-in and fade-out animations.
 * The message appears after 50ms, stays visible for 2 seconds, then fades out
 * over 400ms before being hidden again.
 *
 * @function showDeleteSuccessMessage
 * @description Shows the delete contact success message element by manipulating CSS classes
 * to create a smooth animation sequence (show → fade in → fade out → hide).
 */
const showDeleteSuccessMessage = () => {
  const successMessageRef = document.querySelector(".delete-contact-successful");
  successMessageRef.classList.remove("d_none");
  setTimeout(() => {
    successMessageRef.classList.add("active");
  }, 50);
  setTimeout(() => {
    successMessageRef.classList.remove("active");
    setTimeout(() => {
      successMessageRef.classList.add("d_none");
    }, 400);
  }, 2000);
};

/**
 * Displays an "edit contact successful" message with fade-in and fade-out animations.
 * The message appears after 50ms, stays visible for 2 seconds, then fades out
 * over 400ms before being hidden again.
 *
 * @function showEditSuccessMessage
 * @description Shows the edit contact success message element by manipulating CSS classes
 * to create a smooth animation sequence (show → fade in → fade out → hide).
 */
const showEditSuccessMessage = () => {
  const successMessageRef = document.querySelector(".edit-contact-successful");
  successMessageRef.classList.remove("d_none");
  setTimeout(() => {
    successMessageRef.classList.add("active");
  }, 50);
  setTimeout(() => {
    successMessageRef.classList.remove("active");
    setTimeout(() => {
      successMessageRef.classList.add("d_none");
    }, 400);
  }, 2000);
};

/**
 * Clears the values of the contact form input fields: name, email, and phone.
 * Resets the input fields with IDs 'contactName', 'contactEmail', and 'contactPhone' to empty strings.
 */
const clearContactForm = () => {
  document.getElementById("contactName").value = "";
  document.getElementById("contactEmail").value = "";
  document.getElementById("contactPhone").value = "";
};

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
 * Saves the edited contact information to the Firebase database.
 *
 * This function retrieves the currently selected contact's name from the DOM,
 * finds the corresponding contact object, collects the edited values from the
 * input fields, validates that the name contains both first name and surname,
 * and updates the contact in the database using a PUT request.
 * After saving, it closes the edit overlay, clears the edit form, and refreshes
 * the contact list display.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the contact has been updated and the UI refreshed.
 */
const saveEditedContactToDatabase = async (nameVal, emailVal, phoneVal) => {
  const contactName = document.querySelector(".contact-information-username").innerText;
  const contact = contacts.find((contact) => contact.name === contactName);
  const editedName = document.getElementById("editContactName").value.trim();
  const editedEmail = document.getElementById("editContactEmail").value;
  const editedPhone = document.getElementById("editContactPhone").value;
  if (!overlayValidation(editedName, editedEmail, editedPhone, nameVal, emailVal, phoneVal)) return;
  const editedContact = { name: editedName, email: editedEmail, phone: editedPhone };
  await putEditedContactToDatabase(editedContact, contact);
  finishEdit();
};

/**
 * Validates if a name contains exactly two words (first name and surname).
 * @param {string} name - The name to validate.
 * @returns {boolean} True if the name has exactly two words, false otherwise.
 */
const validateFullName = (name) => {
  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/);
  return words.length === 2 && words.every((word) => word.length > 0);
};

/**
 * Validates the input fields for editing a contact in the overlay.
 *
 * @param {string} editedName - The edited name to validate (must be a full name)
 * @param {string} editedEmail - The edited email address to validate
 * @param {string} editedPhone - The edited phone number to validate
 * @returns {boolean} Returns true if all validations pass, false otherwise
 *
 * @description This function performs the following validations:
 * - Checks if all required fields (name, email, phone) are provided
 * - Validates that the name contains both first and last name using validateFullName()
 * - Shows appropriate German error messages via alert() if validation fails
 */
const overlayValidation = (editedName, editedEmail, editedPhone, nameVal, emailVal, phoneVal) => {
  let isValid = true;
  if (!validateFullName(editedName)) {
    document.getElementById(nameVal).classList.remove("hide");
    isValid = false;
  } else document.getElementById(nameVal).classList.add("hide");
  if (!validateEmail(editedEmail)) {
    document.getElementById(emailVal).classList.remove("hide");
    isValid = false;
  } else document.getElementById(emailVal).classList.add("hide");
  if (!validatePhoneNumber(editedPhone)) {
    document.getElementById(phoneVal).classList.remove("hide");
    isValid = false;
  } else document.getElementById(phoneVal).classList.add("hide");
  return isValid;
};

/**
 * Validates whether the given string is a properly formatted email address.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} Returns true if the email is valid, otherwise false.
 */
const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return false;
  }
  return true;
};
