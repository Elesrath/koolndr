let calendar;
let selectedCalendar;
let selectedCalendarName = "";
let calendarsOwn=[];
let calendarsEdit=[];
let calendarsView=[];
let userType = 0;

let selectedEvent;
let eventlist = [];

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


function addEvent(calendarID, eventName, startDate, endDate, eventDescription, cb) {
    $.post("/addEvent", {calendarID : calendarID, eventName : eventName, startDate: startDate, endDate : endDate, eventDescription : eventDescription}, function(result) {
        cb(result);
    });
}

function editEvent(calendarID, eventID, startDate, endDate, eventName, description, cb) {
    $.post("/editEvent", {calendarID : calendarID, eventID : eventID, startDate: startDate, endDate : endDate, eventName: eventName, description : description}, function(result) {
        cb(result);
    });
}

function removeEvent(calendarID, eventID, cb) {
    $.post("/removeEvent", {calendarID : calendarID, eventID : eventID}, function(result) {
        cb(result);
    });
}

function getEvents(calendarID, rangeBegin, rangeEnd, cb) {
    $.get("/getEvents", {calendarID : calendarID, rangeBegin:rangeBegin, rangeEnd: rangeEnd}, function(events) {
        eventlist.length = 0;
        let c;
        for (let i = 0; i < events.length; i++)
            eventlist.push(events[i].name);
            c = JSON.stringify({index: i, id: events[i].eventID});
            console.log(c);
        cb(true);
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

    addEvent(selectedCalendar.id, eventName, eventStart, eventEnd, eventDescription, function (result) {
        if (result === "success") {
            let start_date = new Date(eventStart);
            let end_date = new Date(eventEnd);
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

    editEvent(selectedCalendar.id, eventStart, eventEnd, eventName, eventDescription, function (result) {
        if (result === "success") {
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
    deleteEvent(selectedCalendar.id, function (result) {
        if(result === "success"){
            $('#deleteEventModal').modal('hide');
        }
        else{
            alert("Delete event failed: " + result );
        }
    });
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
        events: function(fetchInfo, successCallback, failureCallback) {
/*             getEvents(selectedCalendar.id, fetchInfo.start.valueOf(), fetchInfo.valueOf(), function (res) {
                if (events) {
                    successCallback (
                        Array.prototype.slice.call( // convert to array
                            res.getElementsByTagName('event')
                        ).map(function(eventEl) {
                            return {
                                title: eventEl.getAttribute('title'),
                                start: eventEl.getAttribute('start')
                            }
                        })
                    )
                } else {
                    failureCallback(events);
                }
            }); */
        },
        editable: true,
        eventLimit: true,
        eventResizableFromStart: true,
        eventDurationEditable: true,
        selectable: true,
        select: function(selectionInfo) {
            selectionInfo.allDay = !(selectionInfo.allDay);
            
            let start_month = (selectionInfo.start.getMonth()+1).toString();
            start_month = ("0" + start_month).slice(-2);

            let start_day = (selectionInfo.start.getDate()).toString();
            start_day = ("0" + start_day).slice(-2);

            let end_year = selectionInfo.end.getFullYear();
            let end_month = selectionInfo.end.getMonth()+1;
            let end_day = selectionInfo.end.getDate();

            if (end_day !== 1) {
                end_day -=1;
            } else {
                let months1 = [2, 4, 6, 8, 9, 11];
                let months2 = [5, 7, 10, 12];
                if (months1.includes(end_month)) {
                    end_day = 31;
                    end_month -=1;
                } else if (months2.includes(end_month)) {
                    end_day = 30;
                    end_month -=1;
                } else if (end_month === 3) {
                    end_day = 27;
                    end_month -=1;
                } else if (end_month === 1) {
                    end_year -=1;
                    end_month = 12;
                    end_day = 31;
                }
            }

            end_year = end_year.toString();
            end_month = end_month.toString();
            end_day = end_day.toString();

            end_month = ("0" + end_month).slice(-2);
            end_day = ("0" + end_day).slice(-2);

            let starting = (selectionInfo.start.getFullYear()).toString() + '-' + start_month + '-' + start_day;
            let ending = end_year.toString() + "-" + end_month + '-' + end_day;

            $("#addEventModal").modal('show');
            $("#eventStartDate").val(starting);
            $("#eventEndDate").val(ending);
        },
        eventClick: function(info) {
            selectedEvent = info.event;
            info.jsEvent.preventDefault();                      // don't let the browser navigate by default
            $("#editEventModalTitle").text("Edit Event: " + selectedEvent.title);
            $("#editEventModal").modal('show');
        },
        events: function() {
            
        }
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
