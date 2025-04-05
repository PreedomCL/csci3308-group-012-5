/**
 * Calendar scripts
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, initializing calendar...");
    
  // Check if the element exists
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
      console.error("Calendar element not found in the DOM");
      return; // Exit early if element doesn't exist
  }
  
  // Check if FullCalendar is available
  if (typeof FullCalendar === 'undefined') {
      console.error("FullCalendar library not loaded");
      return; // Exit early if library isn't loaded
  }
  
  try {
      console.log("Creating calendar instance...");
      const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'timeGridWeek',
          initialDate: '2025-04-07',
          headerToolbar: {
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
          },
          timeZone: 'America/Denver',
          events: [
              { title: 'All Day Event', start: '2025-04-06' },
              { title: 'Long Event', start: '2025-04-07', end: '2025-04-10' },
              { title: 'Conference', start: '2025-04-11', end: '2025-04-13' },
              { title: 'Meeting', start: '2025-04-12T10:30:00', end: '2025-04-12T12:30:00' },
              { title: 'Lunch', start: '2025-04-12T12:00:00' },
              { title: 'Meeting', start: '2025-04-12T14:30:00' },
              { title: 'Birthday Party', start: '2025-04-13T07:00:00' }
          ],
          editable: false,
          selectable: false,
          allDaySlot: true,
          allDayContent: 'All Day',
          height: '100%',
          expandRows: true,
          stickyHeaderDates: true
      });
      
      console.log("Rendering calendar...");
      // Remove updateSize call, only render
      calendar.render();
      console.log("Calendar render completed");
  } catch (error) {
      console.error("Error initializing calendar:", error);
  }
});
/*
  
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