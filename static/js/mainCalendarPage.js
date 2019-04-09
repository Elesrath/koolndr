let calendar;
let selectedCalendar;
let selectedCalendarName = "";
let calendarsOwn=[];
let calendarsEdit=[];
let calendarsView=[];
let userType = 0;

function addCalendar(calendarName, cb){
    $.post( "/addCalendar", {name: calendarName}, function(result) {
        cb(result);
    });
}

function editCalendar(calendarID, calendarName, cb){
    $.post( "/editCalendar", {id: calendarID, name: calendarName}, function(result) {
        cb(result);
    });
}

function deleteCalendar(calendarID, cb){
    $.post( "/deleteCalendar", {id: calendarID}, function(result) {
        cb(result);
    });
}

function getOwnCalendars(cb){
    $.get("/getOwnCalendars", function (calendars) {
        let own = $("#calendarsOwn");
        own.empty();
        calendarsOwn.length = 0;
        let c;
        for(let i = 0; i < calendars.length; i++){
            calendarsOwn.push(calendars[i].name);
            c = JSON.stringify({index: i, id: calendars[i].calendarID, type: "own"});
            own.append('<a class="nav-link custom-link" href="#" id=' + c +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendars[i].name + '</span></a>');
        }
        cb(true);
    });
}

function getEditCalendars(){
    $.get("/getEditCalendars", function (calendars) {
        let edit = $("#calendarsEdit");
        edit.empty();
        calendarsEdit.length = 0;
        let c;
        for(let i = 0; i < calendars.length; i++){
            calendarsEdit.push(calendars[i].name);
            c = JSON.stringify({index: i, id: calendars[i].calendarID, type: "edit"});
            edit.append('<a class="nav-link custom-link" href="#" id=' + c +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendars[i].name + '</span></a>');
        }
    });
}

function getViewCalendars(){
    $.get("/getViewCalendars", function (calendars) {
        let view = $("#calendarsView");
        view.empty();
        calendarsView.length = 0;
        let c;
        for(let i = 0; i < calendars.length; i++) {
            calendarsView.push(calendars[i].name);
            c = JSON.stringify({index: i, id: calendars[i].calendarID, type: "view"});
            view.append('<a class="nav-link custom-link" href="#" id=' + c +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendars[i].name + '</span></a>');
        }
    });
}

function getUserSearchResults(searchTerm, cb){
    $.post( "/searchUsers", {searchTerm: searchTerm}, function(result) {
        cb(result);
    });
}

function handleCalendarNavClick(id) {
    $(".sidebar-selected").removeClass("sidebar-selected");
    let c = document.getElementById(id);
    c.classList.add("sidebar-selected");

    selectedCalendar = JSON.parse(id);
    if(selectedCalendar.type === "own"){
        selectedCalendarName = calendarsOwn[selectedCalendar.index];
        calendar.setOption('header', {
            left: 'editButton, shareButton, deleteButton',
            center: 'title',
            right: 'today, prev,next',
        });
    }
    else if (selectedCalendar.type === "edit") {
        selectedCalendarName = calendarsEdit[selectedCalendar.index];
        calendar.setOption('header', {
            left: 'shareButton',
            center: 'title',
            right: 'today, prev,next',
        });
    }
    else{
        selectedCalendarName = calendarsView[selectedCalendar.index];
        calendar.setOption('header', {
            left: '',
            center: 'title',
            right: 'today, prev,next',
        });
    }
}

function handleAddNewCalendarClick() {
    let calendarName = $.trim($('#calendarNameInput').val());
    if (calendarName === '') {
        alert('Input can not be left blank');
        return false;
    }
    addCalendar(calendarName, function (result){
        if(result === "success"){
            getOwnCalendars();
            $('#calendarNameInput').val('');
            $('#addNewCalendarModal').modal('hide');
        }
        else{
            alert("Add new calendar failed: " + result );
        }
    });
}

function handleEditCalendarClick() {
    let calendarName = $.trim($('#editCalendarNameInput').val());
    if (calendarName === '') {
        alert('Input can not be left blank');
        return false;
    }
    editCalendar(selectedCalendar.id, calendarName, function (result){
        if(result === "success"){
            getOwnCalendars(function(){
                handleCalendarNavClick(JSON.stringify(selectedCalendar));
            });
            $('#editCalendarNameInput').val('');
            $('#editCalendarModal').modal('hide');
        }
        else{
            alert("Edit calendar failed: " + result );
        }
    });
}

function handleDeleteCalendarClick() {
    deleteCalendar(selectedCalendar.id, function (result){
        if(result === "success"){
            $('#deleteCalendarModal').modal('hide');
            window.location.reload();
        }
        else{
            alert("Delete calendar failed: " + result );
        }
    });
}

function handleSearchUsersClick(){
    let searchTerm = $.trim($("#shareCalendarSearchInput").val());
    if (searchTerm === '') {
        alert('Input can not be left blank');
    }
    else{
        getUserSearchResults(searchTerm, function(results){
            let searchResults = $('#searchResults');
            searchResults.empty();
            if(results.length === 0){
                searchResults.append('<button type="button" class="list-group-item list-group-item-action">No Users Found</button>');
            }
            else {
                for (let i = 0; i < results.length; i++) {
                    searchResults.append('<button type="button" id=' + results[i].uuid +
                        ' class="list-group-item list-group-item-action">' + results[i].username + '</button>');
                }
            }
        })
    }
}

$(document).ready(function() {
    userType = $("input[name='user-userType']").val();
    if(userType){
        getOwnCalendars(function(){});
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
        dateClick: function (info) {
            alert('Clicked on: ' + info.dateStr);
        },
        events: function(start, end, timezone, callback) {

        },
    });

    calendar.render();


    let editCalendarNameInput = document.getElementById("editCalendarNameInput");
    let shareCalendarSearchInput = document.getElementById("shareCalendarSearchInput");

    editCalendarNameInput.addEventListener("keypress", function(event) {
        // If enter is pressed
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("editCalendarButton").click();
        }
    });

    shareCalendarSearchInput.addEventListener("keypress", function(event) {
        // If enter is pressed
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("searchCalendarButton").click();
        }
    });

    $('#shareCalendarModal').on('hidden.bs.modal', function () {
        let searchResults = $('#searchResults');
        searchResults.empty();
    })
});