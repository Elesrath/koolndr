let userType = 0;
let calendar;
let selectedCalendarID;
let selectedCalendarType;
let selectedCalendarName;
let selectedShareRecipientUserID;
let selectedEvent;
let eventlist = [];

// function addUserEditPermissions(id, cb){
//     $.post( "/shareCalendarAddEditUser", {userID: id, calendarID: selectedCalendarID}, function(result) {
//         cb(result);
//     });
// }

function handleUpdateUser() {
    let pass1 = $.trim($('#passwordInput1').val());

    let pass2 = $.trim($('#passwordInput2').val());
    let passNew = $.trim($('#newPasswordInput').val());

    if (pass1 !== pass2) {
        alert("Original passwords don't match!");
        return false;
    }

    if (passNew.length < 3) {
        alert("new password must exceed minimum length 3!");
        return false;
    }


    changeUserInfo(passNew, function (result) {
        if (result === "success") {
            $('#myAccountModal').modal('hide');
        }
        else {
            alert("Password change failed: " + result);
        }
    });
}

//newName, newPassword, newEmail

function changeUserInfo(newPassword, cb) {
    $.post("/changeUserInfo", { newPassword: newPassword }, function (result) {
        cb(result);
    });
}

function changeUserType(userType, cb) {
    $.post("/changeUserType", { userType: userType }, function (result) {
        cb(result);
    });
}

function handleChangeUserTypeClick() {
    changeUserType(userType, function (result) {
        if (result === "success") {
            $('#myAccountModal').modal('hide');
            window.location.reload();
        }
        else {
            alert("Changing user type failed: " + result);
        }
    });
}


function addCalendar(calendarName, cb) {
    $.post("/addCalendar", { name: calendarName }, function (result) {
        cb(result);
    });
}

function editCalendar(calendarID, calendarName, cb) {
    $.post("/editCalendar", { id: calendarID, name: calendarName }, function (result) {
        cb(result);
    });
}

function deleteCalendar(calendarID, cb) {
    $.post("/deleteCalendar", { id: calendarID }, function (result) {
        cb(result);
    });
}

function getOwnCalendars(cb) {
    $.get("/getOwnCalendars", function (calendars) {
        let own = $("#calendarsOwn");
        own.empty();
        for (let i = 0; i < calendars.length; i++) {
            own.append('<a class="nav-link custom-link" href="#" id=' + 'ownCalendar' + calendars[i].calendarID +
                ' data-ctype="own" data-cid=' + calendars[i].calendarID +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendars[i].name + '</span></a>');
        }
        cb(true);
    });
}

function getEditCalendars() {
    $.get("/getEditCalendars", function (calendars) {
        let edit = $("#calendarsEdit");
        edit.empty();
        for (let i = 0; i < calendars.length; i++) {
            edit.append('<a class="nav-link custom-link" href="#" id=' + 'editCalendar' + calendars[i].calendarID +
                ' data-ctype="edit" data-cid=' + calendars[i].calendarID +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendars[i].name + '</span></a>');
        }
    });
}

function getViewCalendars() {
    $.get("/getViewCalendars", function (calendars) {
        let view = $("#calendarsView");
        view.empty();
        for (let i = 0; i < calendars.length; i++) {
            view.append('<a class="nav-link custom-link" href="#" id=' + 'viewCalendar' + calendars[i].calendarID +
                ' data-ctype="view" data-cid=' + calendars[i].calendarID +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendars[i].name + '</span></a>');
        }
    });
}

function getEditPermissionUsers() {
    let editUsersContainer = $("#editPermissionUsers");
    editUsersContainer.empty();
    $.post("/getCalendarEditUsers", { id: selectedCalendarID }, function (users) {
        for (let i = 0; i < users.length; i++) {
            editUsersContainer.append(
                '<div class="alert alert-secondary alert-dismissible fade show m-1" role="alert">' +
                users[i].username +
                '<button type="button" class="close" aria-label="Close"' +
                ' onclick="handleRemoveSharedWithUserClick(this.id);" id=' + users[i].uuid + '>' +
                '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                '</div>');
        }
    });
}

function getViewPermissionUsers() {
    let viewUsersContainer = $("#viewPermissionUsers");
    viewUsersContainer.empty();
    $.post("/getCalendarViewUsers", { id: selectedCalendarID }, function (users) {
        for (let i = 0; i < users.length; i++) {
            viewUsersContainer.append(
                '<div class="alert alert-secondary alert-dismissible fade show m-1" role="alert">' +
                users[i].username +
                '<button type="button" class="close" aria-label="Close"' +
                ' onclick="handleRemoveSharedWithUserClick(this.id);" id=' + users[i].uuid + '>' +
                '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                '</div>');
        }
    });
}

function getUserSearchResults(searchTerm, cb) {
    $.post("/searchUsers", { searchTerm: searchTerm }, function (result) {
        cb(result);
    });
}

function addUserEditPermissions(id, cb) {
    $.post("/shareCalendarAddEditUser", { userID: id, calendarID: selectedCalendarID }, function (result) {
        cb(result);
    });
}

function addUserViewPermissions(id, cb) {
    $.post("/shareCalendarAddViewUser", { userID: id, calendarID: selectedCalendarID }, function (result) {
        cb(result);
    });
}

function removeUserPermissions(id, cb) {
    $.post("/removeUserAccessPermissions", { userID: id, calendarID: selectedCalendarID }, function (result) {
        cb(result);
    });
}

function handleCalendarNavClick(id) {

    $(".sidebar-selected").removeClass("sidebar-selected");
    document.getElementById(id).classList.add("sidebar-selected");

    let selectedCalendar = $('#' + id);
    selectedCalendarID = selectedCalendar.attr("data-cid");
    selectedCalendarName = $('#' + id + ' > span').text();
    selectedCalendarType = selectedCalendar.attr("data-ctype");

    getEvents(selectedCalendarID, function (results) { });

    if (selectedCalendarType === "own") {
        calendar.setOption('header', {
            left: 'editButton, shareButton, deleteButton',
            center: 'title',
            right: 'today, prev,next',
        });
    }
    else if (selectedCalendarType === "edit") {
        calendar.setOption('header', {
            left: 'shareButton',
            center: 'title',
            right: 'today, prev,next',
        });
    }
    else {
        calendar.setOption('header', {
            left: '',
            center: 'title',
            right: 'today, prev,next',
        });
    }
    calendar.setOption('selectable', true);
}

function handleAddNewCalendarClick() {
    let calendarName = $.trim($('#addNewCalendarNameInput').val());
    if (calendarName === '') {
        alert('Input can not be left blank');
        return false;
    }
    addCalendar(calendarName, function (result) {
        if (result === "success") {
            getOwnCalendars();
            $('#addNewCalendarNameInput').val('');
            $('#addNewCalendarModal').modal('hide');
        }
        else {
            alert("Add new calendar failed: " + result);
        }
    });
}

function handleEditCalendarClick() {
    let calendarName = $.trim($('#editCalendarNameInput').val());
    if (calendarName === '') {
        alert('Input can not be left blank');
        return false;
    }
    editCalendar(selectedCalendarID, calendarName, function (result) {
        if (result === "success") {
            getOwnCalendars(function () {
                handleCalendarNavClick(selectedCalendarID);
            });
            $('#editCalendarNameInput').val('');
            $('#editCalendarModal').modal('hide');
        }
        else {
            alert("Edit calendar failed: " + result);
        }
    });
}

function handleDeleteCalendarClick() {
    deleteCalendar(selectedCalendarID, function (result) {
        if (result === "success") {
            $('#deleteCalendarModal').modal('hide');
            window.location.reload();
        }
        else {
            alert("Delete calendar failed: " + result);
        }
    });
}

function handleSearchUsersClick() {
    $("#editSharePermissionButton").attr("disabled", true);
    $("#viewSharePermissionButton").attr("disabled", true);
    let searchTerm = $.trim($("#shareCalendarSearchInput").val());
    if (searchTerm === '') {
        alert('Input can not be left blank');
    }
    else {
        getUserSearchResults(searchTerm, function (results) {
            let searchResults = $('#searchResults');
            searchResults.empty();
            if (results.length === 0) {
                searchResults.append('<button type="button" class="list-group-item list-group-item-action">No Users Found</button>');
            }
            else {
                for (let i = 0; i < results.length; i++) {
                    searchResults.append('<button type="button" class="list-group-item list-group-item-action" ' +
                        'onclick="handleSearchUserResultClick(this.id);" id=' + results[i].uuid + '>' +
                        results[i].username + '</button>');
                }
            }
        })
    }
}

function handleSearchUserResultClick(id) {
    $("#editSharePermissionButton").attr("disabled", false);
    $("#viewSharePermissionButton").attr("disabled", false);
    selectedShareRecipientUserID = id;
}

function handleAddUserEditPermissionsClick() {
    addUserEditPermissions(selectedShareRecipientUserID, function (result) {
        if (result === "success") {
            getEditPermissionUsers();
        }
        else {
            alert("Add edit permission failed: " + result);
        }
    });
}



function handleAddUserViewPermissionsClick() {
    addUserViewPermissions(selectedShareRecipientUserID, function (result) {
        if (result === "success") {
            getViewPermissionUsers();
        }
        else {
            alert("Add view permission failed: " + result);
        }
    });
}

function handleRemoveSharedWithUserClick(id) {
    removeUserPermissions(id, function (result) {
        if (result === "success") {
            getEditPermissionUsers();
            getViewPermissionUsers();
        }
        else {
            alert("Remove access permissions failed: " + result);
        }
    });
}

function addEvent(calendarID, eventName, startDate, endDate, eventDescription, cb) {
    $.post("/addEvent", { calendarID: calendarID, eventName: eventName, startDate: startDate, endDate: endDate, eventDescription: eventDescription }, function (result) {
        cb(result);
    });
}

function editEvent(calendarID, eventID, startDate, endDate, eventName, eventDescription, cb) {
    $.post("/editEvent", { calendarID: calendarID, eventID: eventID, startDate: startDate, endDate: endDate, eventName: eventName, eventDescription: eventDescription }, function (result) {
        cb(result);
    });
}

function removeEvent(calendarID, eventID, cb) {
    $.post("/removeEvent", { calendarID: calendarID, eventID: eventID }, function (result) {
        cb(result);
    });
}

function getEvents(calendarID, cb) {

    let starting = new Date();
    starting = calendar.getDate();
    starting.setFullYear(starting.getFullYear() - 5);

    let ending = new Date();
    ending = calendar.getDate();
    ending.setFullYear(ending.getFullYear() + 5);

    let rangeBegin = starting.getUTCFullYear() +
        '-' + pad(starting.getUTCMonth() + 1) +
        '-' + pad(starting.getUTCDate());

    let rangeEnd = ending.getUTCFullYear() +
        '-' + pad(ending.getUTCMonth() + 1) +
        '-' + pad(ending.getUTCDate());

    $.post("/getEvents", { calendarID: calendarID, rangeBegin: rangeBegin, rangeEnd: rangeEnd }, function (events) {

        let old_events = calendar.getEvents();
        old_events.forEach(function (event) {
            event.remove();
        });

        eventlist.length = 0;
        for (let i = 0; i < events.length; i++) {
            let inst = {};
            inst.id = events[i].eventID;
            inst.calendarID = events[i].calendarID;
            inst.start = events[i].startDate;
            inst.end = events[i].endDate;
            inst.title = events[i].eventName;
            inst.description = events[i].eventDescription;
            eventlist.push(inst);
        }

        eventlist.forEach(function (event) {
            calendar.addEvent(event);
        });

        cb(events);
    });
}

function handleAddEventClick() {
    let eventName = $.trim($('#eventNameInput').val());
    if (eventName === '') {
        alert('Event name can not be left blank');
        return false;
    }
    let eventStart = $.trim($('#eventStartDate').val());
    let eventEnd = $.trim($('#eventEndDate').val());
    let eventDescription = $.trim($('#eventDescription').val());

    addEvent(selectedCalendarID, eventName, eventStart, eventEnd, eventDescription, function (result) {
        if (result === "success") {
            getEvents(selectedCalendarID, function (results) {
            });
            $('#eventNameInput').val('');
            $('#eventStartDate').val('');
            $('#eventEndDate').val('');
            $('#eventDescription').val('');
            $('#addEventModal').modal('hide');
        }
        else {
            alert("Creating event failed: " + result);
        }
    });
}

function handleEditEventClick() {
    let eventName = $.trim($('#eventNewName').val());
    if (eventName === '') {
        alert('Event name can not be left blank');
        return false;
    }
    let eventStart = $.trim($('#eventNewStart').val());
    let eventEnd = $.trim($('#eventNewEnd').val());
    let eventDescription = $.trim($('#eventNewDescription').val());

    let eventID = selectedEvent.id;

    editEvent(selectedCalendarID, eventID, eventStart, eventEnd, eventName, eventDescription, function (result) {
        if (result === "success") {
            getEvents(selectedCalendarID, function (results) {
            });
            $('#eventNewName').val('');
            $('#eventNewStart').val('');
            $('#eventNewEnd').val('');
            $('#eventNewDescription').val('');
            $('#editEventModal').modal('hide');
        }
        else {
            alert("Editing event failed: " + result);
        }
    });
}

function handleDeleteEventClick() {

    let eventID = selectedEvent.id;

    removeEvent(selectedCalendarID, eventID, function (result) {
        if (result === "success") {
            getEvents(selectedCalendarID, function (results) {
            });
            $('#editEventModal').modal('hide');
        }
        else {
            alert("Delete event failed: " + result);
        }
    });
}

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

$(document).ready(function () {
    userType = $("input[name='user-userType']").val();
    $('#eventStartDate').datepicker({ dateFormat: "yy-mm-dd" });
    $('#eventEndDate').datepicker({ dateFormat: "yy-mm-dd" });
    $('#eventNewStart').datepicker({ dateFormat: "yy-mm-dd" });
    $('#eventNewEnd').datepicker({ dateFormat: "yy-mm-dd" });

    if (userType) {
        getOwnCalendars(function () { });
    }
    getEditCalendars();
    getViewCalendars();

    let calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid', 'interaction', 'bootstrap'],
        defaultView: 'dayGridMonth',
        height: 'parent',
        customButtons: {
            editButton: {
                text: 'Edit',
                click: function () {
                    $("#editCalendarModalTitle").text("Edit Calendar: " + selectedCalendarName);
                    $('#editCalendarModal').modal('show');
                }
            },
            shareButton: {
                text: 'Share',
                click: function () {
                    $("#shareCalendarModalTitle").text("Share Calendar: " + selectedCalendarName);
                    getEditPermissionUsers();
                    getViewPermissionUsers();
                    $('#shareCalendarModal').modal('show');
                }
            },
            deleteButton: {
                text: 'Delete',
                click: function () {
                    $("#deleteCalendarModalTitle").text("Delete Calendar: " + selectedCalendarName);
                    $('#deleteCalendarModal').modal('show');
                }
            }
        },
        header: {
            left: '',
            center: 'title',
            right: 'today, prev,next',
        },
        editable: true,
        eventLimit: 4,
        selectable: false,
        allDayDefault: true,
        select: function (selectionInfo) {
            /*
            let starting = selectionInfo.start;
            let ending = selectionInfo.end;
            ending.setDate(ending.getDate() - 1);

            let starting_str = starting.getUTCFullYear() +
                '-' + pad(starting.getUTCMonth() + 1) +
                '-' + pad(starting.getUTCDate());

            let ending_str = ending.getUTCFullYear() +
            '-' + pad(ending.getUTCMonth() + 1) +
            '-' + pad(ending.getUTCDate());
            */
            $("#addEventModal").modal('show');
            $("#eventStartDate").val(selectionInfo.startStr);
            $("#eventEndDate").val(selectionInfo.startStr);
        },
        eventClick: function (info) {
            selectedEvent = info.event;

            info.jsEvent.preventDefault();                      // don't let the browser navigate by default

            let starting = selectedEvent.start;
            let ending;
            if (selectedEvent.end) {
                ending = selectedEvent.end;
            } else {
                ending = selectedEvent.start;
            }

            let starting_str = starting.getUTCFullYear() +
                '-' + pad(starting.getUTCMonth() + 1) +
                '-' + pad(starting.getUTCDate());

            let ending_str = ending.getUTCFullYear() +
                '-' + pad(ending.getUTCMonth() + 1) +
                '-' + pad(ending.getUTCDate());

            $("#editEventModalTitle").text("Edit Event: " + selectedEvent.title);
            $("#editEventModal").modal('show');
            $("#eventNewStart").val(starting_str);
            $("#eventNewEnd").val(ending_str);
        },
        eventDrop: function (info) {

            selectedEvent = info.event;
            let eventName = selectedEvent.title;
            let eventID = selectedEvent.id;

            let eventDescription = selectedEvent.extendedProps.description;

            let newStartDate = new Date(selectedEvent.start);
            let newEndDate = new Date(selectedEvent.end);

            let newStart = newStartDate.getUTCFullYear() +
                '-' + pad(newStartDate.getUTCMonth() + 1) +
                '-' + pad(newStartDate.getUTCDate());

            let newEnd = newEndDate.getUTCFullYear() +
                '-' + pad(newEndDate.getUTCMonth() + 1) +
                '-' + pad(newEndDate.getUTCDate());

            editEvent(selectedCalendarID, eventID, newStart, newEnd, eventName, eventDescription, function (result) {
                if (result === "success") {
                    getEvents(selectedCalendarID, function (results) {
                    });
                }
                else {
                    alert("Editing event failed: " + result);
                }
            });
        },
        eventRender: function (info, el) {
            let desc = info.event.extendedProps.description;
            info.el.insertAdjacentHTML('beforeend', desc);
        },
    });

    calendar.render();

    let addNewCalendarNameInput = document.getElementById("addNewCalendarNameInput");
    let editCalendarNameInput = document.getElementById("editCalendarNameInput");
    let shareCalendarSearchInput = document.getElementById("shareCalendarSearchInput");

    addNewCalendarNameInput.addEventListener("keypress", function (event) {
        // If enter is pressed
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("addNewCalendarButton").click();
        }
    });

    editCalendarNameInput.addEventListener("keypress", function (event) {
        // If enter is pressed
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("editCalendarButton").click();
        }
    });

    shareCalendarSearchInput.addEventListener("keypress", function (event) {
        // If enter is pressed
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("searchCalendarButton").click();
        }
    });

    $('#shareCalendarModal').on('hidden.bs.modal', function () {
        let searchResults = $('#searchResults');
        searchResults.empty();
        $('#shareCalendarSearchInput').val('');
        $("#editSharePermissionButton").attr("disabled", true);
        $("#viewSharePermissionButton").attr("disabled", true);
    });
});
