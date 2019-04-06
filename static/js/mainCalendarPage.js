let calendar;
let selectedCalendar;
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

function getOwnCalendars(){
    $.get("/getOwnCalendars", function (calendars) {
        let own = $("#calendarsOwn");
        own.empty();
        calendarsOwn.length = 0;
        let calendar;
        for(let i = 0; i < calendars.length; i++){
            calendar = calendars[i];
            calendar.type = "own";
            calendarsOwn.push(calendar);
            own.append('<a class="nav-link custom-link" href="#" id=' +
                JSON.stringify(calendar) +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendar.name + '</span></a>');
        }
    });
}

function getEditCalendars(){
    $.get("/getEditCalendars", function (calendars) {
        let edit = $("#calendarsEdit");
        edit.empty();
        calendarsEdit.length = 0;
        let calendar;
        for(let i = 0; i < calendars.length; i++){
            calendar = calendars[i];
            calendar.type = "edit";
            calendarsEdit.push(calendar);
            edit.append('<a class="nav-link custom-link" href="#" id=' +
                JSON.stringify(calendar) +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendar.name + '</span></a>');
        }
    });
}

function getViewCalendars(){
    $.get("/getViewCalendars", function (calendars) {
        let view = $("#calendarsView");
        view.empty();
        calendarsView.length = 0;
        let calendar;
        for(let i = 0; i < calendars.length; i++) {
            calendar = calendars[i];
            calendar.type = "view";
            calendarsView.push(calendar);
            view.append('<a class="nav-link custom-link" href="#" id=' +
                JSON.stringify(calendar) +
                ' onclick="handleCalendarNavClick(this.id);return false;">' +
                '<i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendar.name + '</span></a>');
        }
    });
}

function handleCalendarNavClick(id) {
    //$("#navBar").find("a").css({"backgroundColor": "#212529", "color": "white"});
    //$("#" + id).not("#addNewCalendar").css({"backgroundColor": "white", "color": "black"});
    selectedCalendar = JSON.parse(id);
    if(selectedCalendar.type === "own"){
        calendar.setOption('header', {
            left: 'editButton, shareButton, deleteButton',
            center: 'title',
            right: 'today, prev,next',
        });
    }
    else if (selectedCalendar.type === "edit") {
        calendar.setOption('header', {
            left: 'shareButton',
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
    editCalendar(selectedCalendar.calendarID, calendarName, function (result){
        if(result === "success"){
            getOwnCalendars();
            $('#editCalendarNameInput').val('');
            $('#editCalendarModal').modal('hide');
        }
        else{
            alert("Edit calendar failed: " + result );
        }
    });
}

function handleDeleteCalendarClick() {
    deleteCalendar(selectedCalendar.calendarID, function (result){
        if(result === "success"){
            getOwnCalendars();
            $('#deleteCalendarModal').modal('hide');
        }
        else{
            alert("Delete calendar failed: " + result );
        }
    });
}

$(document).ready(function() {
    userType = $("input[name='user-userType']").val();
    if(userType){
        getOwnCalendars();
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
                    $('#editCalendarModal').modal('show');
                }
            },
            shareButton: {
                text: 'Share',
                click: function () {
                    alert('clicked share');
                }
            },
            deleteButton: {
                text: 'Delete',
                click: function () {
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
});