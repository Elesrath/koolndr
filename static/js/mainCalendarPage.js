$(document).ready(function() {
    let selectedCalendarName = "";
    let calendarOwnedNames=[];
    let calendarViewNames=[];
    let calendarEditNames=[];
    $.get("/getCalendars", function (data) {
        let i = 0;
        for(i =0; i < data.length; i++){

        }
    });

    //fc-left (class for custom buttons
    let calendarEl = document.getElementById('calendar');

    let calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid', 'interaction', 'bootstrap'],
        defaultView: 'dayGridMonth',
        height: 'parent',
        customButtons: {
            editButton: {
                text: 'Edit',
                click: function () {
                    alert('clicked edit');
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
                    alert('clicked delete');
                }
            }
        },
        header: {
            left: 'editButton, shareButton, deleteButton',
            center: 'title',
            right: 'today prev,next',
        },
        dateClick: function (info) {
            alert('Clicked on: ' + info.dateStr);
        },
        events: function(start, end, timezone, callback) {

        },
    });

    calendar.render();


    function handleCalendarNavClick(id) {
        $("#navBar").children("a").css({"backgroundColor": "#212529", "color": "white"});
        $("#" + id).not("#addNewCalendar").css({"backgroundColor": "white", "color": "black"});
        selectedCalendarName = id;
    }

    function handleAddNewCalendarClick() {
        let calendarName = $.trim($('#calendarNameInput').val());
        if (calendarName === '') {
            alert('Input can not be left blank');
            return false;
        }
        $("#addNewCalendar").before('<a class="nav-link" href="#" id=' + calendarName + ' onclick="handleCalendarNavClick(this.id);return false;"><i class="fas fa-fw fa-calendar-alt"></i><span> ' + calendarName + '</span></a>');
        $('#calendarNameInput').val('');
        $('#addNewCalendarModal').modal('hide');
    }
});