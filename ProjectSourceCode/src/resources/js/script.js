/**
 * Calendar scripts
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, initializing calendar...");
  const calendarEl = document.getElementById('calendar');

  // Check if FullCalendar library is available
  if (typeof FullCalendar === 'undefined') {
      console.error("FullCalendar library not loaded");
      return; // Exit early if library isn't loaded
  }
  const userId = calendarEl.getAttribute('data-user-id')
  //Check user is defined
  if (!userId){
    console.error("User id not specified");
    return; // Exit early if library isn't loaded
  }
  
  try {
    console.log("Creating calendar instance...");
    const calendar = new FullCalendar.Calendar(calendarEl, {  
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: '',
            center: 'title'/*user name's calendar*/,
            right: 'button' /*Update availability button*/
        },
        nowIndicator: true,
        stickyHeaderDates: true,
        timeZone: 'America/Denver',
        slotDuration: '00:30:00',  
        slotMinTime: '08:00:00',  
        slotMaxTime: '21:00:00',
        scrollTime: '08:00:00',
        dayHeaderFormat: { weekday: 'short' },
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
        }, 
        allDaySlot: false,
        expandRows: true,
        navLinks: false,
        editable: false,
        selectable: false,
        height: '100%',
        events: `calendar/events?userId=${userId}`
    });
      
    console.log("Rendering calendar...");
    // Remove updateSize call, only render
    calendar.render();
    console.log("Calendar render complete");
  } catch (error) {
      console.error("Error creating calendar:", error);
  }
});
/*
  events: [
                { "title": 'Meeting', "daysOfWeek": [0,2,3], "startTime": '10:30:00', "end": '12:30:00' },
                { "title": 'Lunch', "start": '2025-04-04T12:00:00' },
                {  title: 'Meeting', daysOfWeek: [1,4], start: '2025-04-04T14:30:00' },
                { "title": 'Birthday Party', start: '2025-04-05T07:00:00' }
            ],
    // // Get the user ID from the data attribute
    // //const userId = document.getElementById('calendar').dataset.userId;
    // Check if FullCalendar is available
    
    // // Initialize FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      initialDate: '2025-04-07', //TODO: replace with current date
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,timeGridDay'
      },
      timeZone: 'America/Denver', // MST timezone
      //events: `calendar/events?userId=${userId}`, //get events using api TODO: add route
      events: [
        {
          title: 'All Day Event',
          start: '2025-04-06'
        },
        {
          title: 'Long Event',
          start: '2025-04-07',
          end: '2025-04-10'
        },
        {
          title: 'Conference',
          start: '2025-04-11',
          end: '2025-04-13'
        },
        {
          title: 'Meeting',
          start: '2025-04-12T10:30:00',
          end: '2025-04-12T12:30:00'
        },
        {
          title: 'Lunch',
          start: '2025-04-12T12:00:00'
        },
        {
          title: 'Meeting',
          start: '2025-04-12T14:30:00'
        },
        {
          title: 'Birthday Party',
          start: '2025-04-13T07:00:00'
        },
      ],
      editable: false, // Read-only
      selectable: false,
      allDaySlot: true,
      allDayContent: 'All Day', // customize label if needed
      height: 'auto', // let the container determine height
      expandRows: true, // expand rows to fill available height
      stickyHeaderDates: true
    //   eventClassNames: function(arg) {
    //     return [arg.event.extendedProps.type];
    //   },
      
    //   // Handle event click (view event details)
    //   eventClick: function(info) {
    //     if(info.event.exportable){
    //       openExportModal(info.event);
    //     }
    //   }
    });
    
    // Render the calendar
    calendar.render();
    
    // // Modal elements
    // const exportModal = new bootstrap.Modal(document.getElementById('export-modal'));
    // //TODO: const eventDetailsModal = new bootstrap.Modal(document.getElementById('event-details-modal'));
    
    
    // function openExportModal(event) {
    //   // Set up download links
    //   const downloadLink = document.getElementById('download-ical');
    //   downloadLink.href = `/calendar/export/event/${event.id}`;
      
    //   // Set up Google Calendar link
    //   const googleLink = document.getElementById('add-to-google');
    //   const startTime = formatDateForGoogle(event.start);
    //   const endTime = formatDateForGoogle(event.end);
    //   const title = encodeURIComponent(event.title);
    //   const description = encodeURIComponent(event.extendedProps.description || '');
      
    //   googleLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${description}&ctz=America/Denver`;
      
    //   exportModal.show();
    // }
    
    // // Helper function to format date for Google Calendar - from ClaudeAI. See Documentation
    // function formatDateForGoogle(date) {
    //   return date.toISOString().replace(/-|:|\.\d+/g, '');
    // }

    /* TODO: Functions for event details
    function openEventDetailsModal(event) {
      // Populate details
      document.getElementById('detail-event-title').textContent = event.title;
      
      // Format dates
      const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Denver'
      };
      
      document.getElementById('detail-event-start').textContent = event.start.toLocaleString('en-US', options);
      document.getElementById('detail-event-end').textContent = event.end.toLocaleString('en-US', options);
      
      // Event type with capitalized first letter
      const eventType = event.extendedProps.type || 'event';
      document.getElementById('detail-event-type').textContent = 
        eventType.charAt(0).toUpperCase() + eventType.slice(1);
      
      // Description
      document.getElementById('detail-event-description').textContent = 
        event.extendedProps.description || 'No description provided.';
      
      // Set export button event ID
      document.getElementById('export-event-btn').setAttribute('data-event-id', event.id);
      
      eventDetailsModal.show();
    }*/