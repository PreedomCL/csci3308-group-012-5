/**
 * Calendar scripts
 */
let calendar;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing calendar...");
    const calendarEl = document.getElementById('calendar');

    // Check if FullCalendar library is available
    if (typeof FullCalendar === 'undefined') {
        console.error("FullCalendar library not loaded");
        return; // Exit early if library isn't loaded
    }
    const userId = calendarEl.getAttribute('data-user-id');
    //Check user is defined
    if (!userId){
        console.error("User id not specified");
        return; // Exit early if library isn't loaded
    }

    // const eventsInfo = `calendar/events?userID=${userId}`;
    // console.log(eventsInfo);

    try {
        console.log("Creating calendar instance...");
        calendar = new FullCalendar.Calendar(calendarEl, {  
            initialView: 'timeGridWeek',
            headerToolbar: {
                left: 'updateAvailability',
                center: 'title'/*user name's calendar*/,
                right: '' /*Update availability button*/
            },
            customButtons: {
                updateAvailability: {
                    text: 'Update Availability',
                    click: function() {
                        //create button, click it, remove it
                        const tmp_button = document.createElement('button');
                        tmp_button.setAttribute('data-bs-toggle', 'modal');
                        tmp_button.setAttribute('data-bs-target', '#availability-modal');
                        document.getElementById('parent').appendChild(tmp_button);
                        tmp_button.click();
                        document.getElementById('parent').removeChild(tmp_button);
                    }
                }
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
            events: `calendar/events?userID=${userId}`
        });
        console.log(calendar.events);
        console.log("Rendering calendar...");
        // Remove updateSize call, only render
        calendar.render();
        console.log("Calendar render complete");
    } catch (error) {
        console.error("Error creating calendar:", error);
    }

    /* add time slots */
    document.querySelectorAll('.add-time').forEach(function(button){
      button.addEventListener('click', function(){
        const day = this.getAttribute('day');
        const timeSlots = document.getElementById(`selector${day}`);
        const newSlot = document.createElement('div');
        newSlot.className = `time-slot`;
        newSlot.innerHTML =`
            <label for="start-time" class="form-label">Start:</label>
            <input type="time" id="start_time" class="form-control start-time" min="08:00:00" max="20:00:00" step="900" required>
            <span>to</span>
            <label for="end_time" class="form-label">End:</label>
            <input type="time" id="end-time" class="form-control end-time" min="08:00:00" max="20:00:00" step="900" required>
            <button type="button" class="btn btn-sm btn-outline-danger remove-time">Remove</button>
          `;
        const startTimeInput = newSlot.querySelector(' .start-time');
        const endTimeInput = newSlot.querySelector('.end-time');

        // Set initial min value for end time
        endTimeInput.min = startTimeInput.value || '08:00';

        // Add event listener to update end time min when start time changes
        startTimeInput.addEventListener('change', function() {
          endTimeInput.min = this.value;
          
          // If current end time is now invalid, update it
          if (endTimeInput.value && endTimeInput.value < this.value) {
            endTimeInput.value = this.value;
          }
        });
        timeSlots.appendChild(newSlot);
        if(timeSlots.querySelectorAll('.time-slot').length > 4){
          timeSlots.removeChild(newSlot);
        }
        newSlot.querySelector('.remove-time').addEventListener('click', function(){
          this.closest('.time-slot').remove();
        });
      });
    });
});

function saveAvailabilityEvent(){
  let day = 0;
  const calendar = document.getElementById('calendar');
  const userID = calendar.getAttribute('data-user-id');
  while(day<7){
    console.log(day);
    const input = document.querySelectorAll(`#selector${day} .time-slot`);
    console.log("list: ", input);
    input.forEach(select => {
      let start = select.querySelector('.start-time').value;
      console.log("start", start);
      let end = select.querySelector('.end-time').value;
      console.log("end", end);
      if(start&&end){
        console.log("post");
        fetch('/calendar/updateAvailability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userid: userID,
            name: "Available",
            type: "1",
            days: `{${day}}`,
            startTime: start,
            endTime: end
          })
        })
        .then(response =>{
          console.log('Success: ', response.data);
        })
        .catch(error =>{
          console.error('Error: ', error);
        });
        refreshCalendar();
      }
      else{
        //error
        console.log("else")
      }
    });
    day++;
  }
}

function refreshCalendar(){
  console.log("refresh");
  if(calendar){
    calendar.render();
    console.log("render");
  }
}