function userDropDownTemplate(name, inititals, index) {
    return `<div>
                <div>
                    <span class="user-icon User-bc-${index}">${inititals}</span>
                    <p>${name}</p>
                </div>
                <input type="checkbox" class="user-checkbox" value="${name}">
            </div>`;
}