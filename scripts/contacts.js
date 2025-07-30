/**
 * This function finds the current logged in user, fetches the respective contact list and renders it after the list is sorted
 */
async function showContacts() {
  let user = Object.entries(await (await fetch(BASE_URL_USERS)).json())
    .map(([id, user]) => ({ id, ...user }))
    .find((user) => user.name === loggedInUser.username);
  let contacts = await getContactsData(user);
  window.contactsList = contacts;
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
  contactDetailsRef.innerHTML = getContactDetailsTemplate(initials, userName, email, phone);
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
  } else {
    contactOverlayRef.classList.remove("active");
    setTimeout(() => {
      contactOverlayRef.classList.add("d_none");
    }, 400);
    document.body.removeEventListener("click", toggleAddContactOverlay);
  }
}

/**
 * Prevents event bubbling for the given event.
 * @param {Event} event - The event to stop propagation for.
 */
function bubblingPrevention(event) {
  event.stopPropagation();
}

document.querySelector(".add-contact-button").addEventListener("click", (event) => {
  event.stopPropagation();
});
