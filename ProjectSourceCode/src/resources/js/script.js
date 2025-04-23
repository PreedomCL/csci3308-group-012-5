/**
 * Calendar scripts
 */
let userCalendar;
let matchCalendar;

let eventView;

document.addEventListener('DOMContentLoaded', function() {   
  initializeUserCalendar();

    document.querySelectorAll('.add-time').forEach(function(button){
      button.addEventListener('click', function(){
        const day = this.getAttribute('day');
        const timeSlots = document.getElementById(`selector${day}`);
        const newSlot = document.createElement('div');
        newSlot.className = `time-slot`;
        newSlot.innerHTML =`
            <select class="form-select start-time">
              <option value="" disabled selected>Start Time</option>
              <option value="08:00:00">8:00 AM</option>
              <option value="08:30:00">8:30 AM</option>
              <option value="09:00:00">9:00 AM</option>
              <option value="09:30:00">9:30 AM</option>
              <option value="10:00:00">10:00 AM</option>
              <option value="10:30:00">10:30 AM</option>
              <option value="11:00:00">11:00 AM</option>
              <option value="11:30:00">11:30 AM</option>
              <option value="12:00:00">12:00 PM</option>
              <option value="12:30:00">12:30 PM</option>
              <option value="13:00:00">1:00 PM</option>
              <option value="13:30:00">1:30 PM</option>
              <option value="14:00:00">2:00 PM</option>
              <option value="14:30:00">2:30 PM</option>
              <option value="15:00:00">3:00 PM</option>
              <option value="15:30:00">3:30 PM</option>
              <option value="16:00:00">4:00 PM</option>
              <option value="16:30:00">4:30 PM</option>
              <option value="17:00:00">5:00 PM</option>
              <option value="17:30:00">5:30 PM</option>
              <option value="18:00:00">6:00 PM</option>
              <option value="18:30:00">6:30 PM</option>
              <option value="19:00:00">7:00 PM</option>
              <option value="19:30:00">7:30 PM</option>
              <option value="20:00:00">8:00 PM</option>
              <option value="20:30:00">8:30 PM</option>
            </select>
            <span>to</span>
            <select class="form-select end-time">
              <option value="" disabled selected>End Time</option>
              <option value="08:30:00">8:30 AM</option>
              <option value="09:00:00">9:00 AM</option>
              <option value="09:30:00">9:30 AM</option>
              <option value="10:00:00">10:00 AM</option>
              <option value="10:30:00">10:30 AM</option>
              <option value="11:00:00">11:00 AM</option>
              <option value="11:30:00">11:30 AM</option>
              <option value="12:00:00">12:00 PM</option>
              <option value="12:30:00">12:30 PM</option>
              <option value="13:00:00">1:00 PM</option>
              <option value="13:30:00">1:30 PM</option>
              <option value="14:00:00">2:00 PM</option>
              <option value="14:30:00">2:30 PM</option>
              <option value="15:00:00">3:00 PM</option>
              <option value="15:30:00">3:30 PM</option>
              <option value="16:00:00">4:00 PM</option>
              <option value="16:30:00">4:30 PM</option>
              <option value="17:00:00">5:00 PM</option>
              <option value="17:30:00">5:30 PM</option>
              <option value="18:00:00">6:00 PM</option>
              <option value="18:30:00">6:30 PM</option>
              <option value="19:00:00">7:00 PM</option>
              <option value="19:30:00">7:30 PM</option>
              <option value="20:00:00">8:00 PM</option>
              <option value="20:30:00">8:30 PM</option>
              <option value="21:00:00">9:00 PM</option>
            </select>
            <button type="button" class="btn btn-sm btn-outline-danger remove-time">Remove</button>
          `;
        //verify end time is after start time
        timeSlots.appendChild(newSlot);
        if(timeSlots.querySelectorAll('.time-slot').length > 5){
          timeSlots.removeChild(newSlot);
        }
        newSlot.querySelector('.remove-time').addEventListener('click', function(){
          this.closest('.time-slot').remove();
        });
      });
    });

    document.getElementById('save-button').addEventListener('click', function(){
      saveAvailabilityEvent();
    });
});

async function saveAvailabilityEvent(){
  let day = 0;
  try{
    //remove previous events
    console.log("here");
    const userID = document.getElementById("calendar").getAttribute("data-user-id");
    console.log(userID);
    const response = await fetch(`/calendar/reset?userID=${userID}`);
    if(!response.ok){
      console.error("ERROR RESET CALENDAR")
    }
    while(day<7){
      console.log(day);
      const input = document.querySelectorAll(`#selector${day} .time-slot`);
      console.log("list: ", input);
      for(let select of input) {
        let start = select.querySelector('.start-time').value;
        console.log("start", start);
        let end = select.querySelector('.end-time').value;
        console.log("end", end);
        if(start&&end){
          console.log("post");
          await fetch('/calendar/updateAvailability', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userid: userID,
              name: "Available",
              type: "1",
              day: day,
              startTime: start,
              endTime: end
            })
          });
          console.log("update done");
        }
      }
    day++;
    }
  initializeUserCalendar();
} catch(error) {
    console.log("ERROR: ", error);
  }
}

async function requestSession(id){
    console.log('Request');
    const day = new Date(eventView.start).getDay();
    console.log(day);
    const inputStart = document.getElementById('request-start');
    let meetingStart = inputStart.querySelector('.start-time').value;
    const inputEnd = document.getElementById('request-end');
    let meetingEnd = inputEnd.querySelector('.end-time').value;
    const inputFormat = document.getElementById('request-format');
    let meetingFormat = inputFormat.querySelector('.format').value;
    //TODO: data validation

    const studentID = document.getElementById('calendar').getAttribute('data-user-id');
    const studentName = document.getElementById('calendar').getAttribute('data-user-name');

    const tutorName = document.getElementById(`match-calendar-${id}`).getAttribute('data-name');
    const desc = document.getElementById(`desc`).value;
    await fetch('/requestMeeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 
        JSON.stringify({
          studentid: studentID,
          tutorid: id,
          name: `Proposed Tutoring Session - ${studentName} & ${tutorName}`,
          type: "2",
          day: day,
          description: desc,
          format: meetingFormat,
          startTime: meetingStart,
          endTime: meetingEnd
        })
    });
    initializeMatchCalendar(id, tutorName);
    initializeUserCalendar();
}

async function initializeUserCalendar(){
  console.log("Initializing user calendar...");
  const calendarEl = document.getElementById('calendar');

  // Check if FullCalendar library is available
  if (typeof FullCalendar === 'undefined') {
      console.error("FullCalendar library not loaded");
      return; // Exit early if library isn't loaded
  }
  const userID = calendarEl.getAttribute("data-user-id");
  const userName = calendarEl.getAttribute("data-user-name");
  const userType = calendarEl.getAttribute("data-user-type");

  const response = await fetch(`/calendar/events`);
  console.log("cal done");
  const userEvents = await response.json();

  try {
      console.log("Creating calendar instance...");
      userCalendar = new FullCalendar.Calendar(calendarEl, {  
          initialView: 'timeGridWeek',
          headerToolbar: {
            left: 'updateAvailability', /*Update availability button*/
            center: 'title'/*user name's calendar*/,
            right: '' 
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
                  populateModal(userID);
              }
            }
          },
          titleFormat: function(){
            return `${userName}'s Calendar`;
          },
          eventClick: function(info){
            console.log('Click: ', info);
            clickUserEvent(info.event, userType);
          },
          nowIndicator: true,
          stickyHeaderDates: true,
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
          events: userEvents,
          eventDidMount: function(info) {
            if (info.event.extendedProps.type) {
              info.el.setAttribute('data-event-type', info.event.extendedProps.type);
            }
            if (info.event.extendedProps.format) {
              info.el.setAttribute('data-event-format', info.event.extendedProps.format);
            }
          }
      });
      console.log("Rendering calendar...");
      // Remove updateSize call, only render
      userCalendar.render();
      console.log("Calendar render complete");
  } catch (error) {
      console.error("Error creating calendar:", error);
  }
}

function initializeMatchCalendar(id, name){
  console.log(id,name);
  const type = document.getElementById(`matchButton-${id}`).parentElement.id;
  if(type=='potential'){
    const parent = document.getElementById(`matchProfileMatch-${id}`);
    const newDiv = document.createElement('div');
    newDiv.innerHTML=`
          <form action="/like" method="POST" style="padding: 10%;">
            <input type="hidden" name="tutorID" value="${id}">
            <input type="hidden" name="index" value="-1">
            <button class="btn btn-primary" type="submit">Like</button>
          </form>`;
    parent.replaceChildren();
    parent.appendChild(newDiv);
  }
  else if(type=='request'){
    const parent = document.getElementById(`matchProfileMatch-${id}`);
    const newDiv = document.createElement('div');
    newDiv.innerHTML=`
          <form action="/match" method="POST" style="padding: 10%;">
            <input type="hidden" name="studentID" value="${id}">
            <input type="hidden" name="index" value="-1">
            <button class="btn btn-primary" type="submit">Match!</button>
          </form>`;
    parent.replaceChildren();
    parent.appendChild(newDiv);
  }
  else if(type=='match'){
    const parent = document.getElementById(`matchProfileMatch-${id}`);
    let newDiv = document.createElement('div');
    newDiv.innerHTML=`
          <form action="/unmatch" method="POST" style="padding: 10%;">
            <input type="hidden" name="matchID" value="${id}">
            <input type="hidden" name="index" value="-1">
            <button class="btn btn-primary" type="submit">Remove Match</button>
          </form>`;
    parent.replaceChildren();
    parent.appendChild(newDiv);
    const inst = document.getElementById(`instructions-${id}`);
    newDiv = null;
    newDiv = document.createElement('div');
    newDiv.innerHTML=`<h5 style="text-align:center">Click on an available time slot to schedule a meeting with ${name}.</h5>`
    inst.replaceChildren();
    inst.appendChild(newDiv);
  }
  else if(type=='matched'){
    const parent = document.getElementById(`matchProfileMatch-${id}`);
    let newDiv = document.createElement('div');
    newDiv.innerHTML=`
          <form action="/unmatch" method="POST" style="padding: 10%;">
            <input type="hidden" name="matchID" value="${id}">
            <input type="hidden" name="index" value="-1">
            <button class="btn btn-primary" type="submit">Remove Match</button>
          </form>`;
    parent.replaceChildren();
    parent.appendChild(newDiv);
  }

  const modal = document.getElementById(`profileModal-${id}`);
  modal.addEventListener('shown.bs.modal', async function matchCalRender() {
    modal.removeEventListener('shown.bs.modal', matchCalRender);
    
    console.log("Initializing match calendar...");
    const McalendarEl = document.getElementById(`match-calendar-${id}`);

    // Check if FullCalendar library is available
    if (typeof FullCalendar === 'undefined') {
        console.error("FullCalendar library not loaded");
        return; // Exit early if library isn't loaded
    }
    const userID = id;
    console.log('matchid:', userID)
    const userName = name;
    McalendarEl.setAttribute("data-id", `${userID}`);
    McalendarEl.setAttribute("data-name", `${userName}`);

    const response = await fetch(`/calendar/events/match?userID=${userID}`); //TODO
    const MuserEvents = await response.json();

    try {
        console.log("Creating match calendar instance...");
        matchCalendar = new FullCalendar.Calendar(McalendarEl, {  
            initialView: 'timeGridWeek',
            headerToolbar: {
              left: '',
              center: 'title'/*user name's calendar*/,
              right: ''
            },
            titleFormat: function(){
              return `${userName}'s Calendar`;
            },
            eventClick: function(info){
              console.log('Match click: ', info);
              //only continue if matched
              if(type=='match'){
                clickMatchEvent(info.event, id);
              }
              else{
                alert(`Match with ${name} before scheduling a tutoring session.`);
              }
            },
            nowIndicator: true,
            stickyHeaderDates: true,
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
            events: MuserEvents
        });
        console.log("Rendering match calendar...");
        matchCalendar.render();
        console.log("Match Calendar render complete");
    } catch (error) {
        console.error("Error creating calendar:", error);
    }
  });
}

async function populateModal(id){
  for (let i = 0; i < 7; i++) {
    let selector = document.getElementById(`selector${i}`)
    while(selector.firstChild){
      selector.removeChild(selector.firstChild);
    }
  }
  try{
    const response = await fetch(`/calendar/events/match?userID=${id}`);
    const userEvents = await response.json();
    console.log(userEvents);
    for(let e of userEvents){
      day = e.daysOfWeek[0];
      startTime = e.startTime;
      endTime = e.endTime;
      const timeSlots = document.getElementById(`selector${day}`);
      const newSlot = document.createElement('div');
      newSlot.className = `time-slot`;
      newSlot.innerHTML =`
          <select class="form-select start-time">
            <option value="" disabled>Start Time</option>
            <option value="08:00:00" ${startTime === "08:00:00" ? "selected" : ""}>8:00 AM</option>
            <option value="08:30:00" ${startTime === "08:30:00" ? "selected" : ""}>8:30 AM</option>
            <option value="09:00:00" ${startTime === "09:00:00" ? "selected" : ""}>9:00 AM</option>
            <option value="09:30:00" ${startTime === "09:30:00" ? "selected" : ""}>9:30 AM</option>
            <option value="10:00:00" ${startTime === "10:00:00" ? "selected" : ""}>10:00 AM</option>
            <option value="10:30:00" ${startTime === "10:30:00" ? "selected" : ""}>10:30 AM</option>
            <option value="11:00:00" ${startTime === "11:00:00" ? "selected" : ""}>11:00 AM</option>
            <option value="11:30:00" ${startTime === "11:30:00" ? "selected" : ""}>11:30 AM</option>
            <option value="12:00:00" ${startTime === "12:00:00" ? "selected" : ""}>12:00 PM</option>
            <option value="12:30:00" ${startTime === "12:30:00" ? "selected" : ""}>12:30 PM</option>
            <option value="13:00:00" ${startTime === "13:00:00" ? "selected" : ""}>1:00 PM</option>
            <option value="13:30:00" ${startTime === "13:30:00" ? "selected" : ""}>1:30 PM</option>
            <option value="14:00:00" ${startTime === "14:00:00" ? "selected" : ""}>2:00 PM</option>
            <option value="14:30:00" ${startTime === "14:30:00" ? "selected" : ""}>2:30 PM</option>
            <option value="15:00:00" ${startTime === "15:00:00" ? "selected" : ""}>3:00 PM</option>
            <option value="15:30:00" ${startTime === "15:30:00" ? "selected" : ""}>3:30 PM</option>
            <option value="16:00:00" ${startTime === "16:00:00" ? "selected" : ""}>4:00 PM</option>
            <option value="16:30:00" ${startTime === "16:30:00" ? "selected" : ""}>4:30 PM</option>
            <option value="17:00:00" ${startTime === "17:00:00" ? "selected" : ""}>5:00 PM</option>
            <option value="17:30:00" ${startTime === "17:30:00" ? "selected" : ""}>5:30 PM</option>
            <option value="18:00:00" ${startTime === "18:00:00" ? "selected" : ""}>6:00 PM</option>
            <option value="18:30:00" ${startTime === "18:30:00" ? "selected" : ""}>6:30 PM</option>
            <option value="19:00:00" ${startTime === "19:00:00" ? "selected" : ""}>7:00 PM</option>
            <option value="19:30:00" ${startTime === "19:30:00" ? "selected" : ""}>7:30 PM</option>
            <option value="20:00:00" ${startTime === "20:00:00" ? "selected" : ""}>8:00 PM</option>
            <option value="20:30:00" ${startTime === "20:30:00" ? "selected" : ""}>8:30 PM</option>
          </select>
          <span>to</span>
          <select class="form-select end-time">
            <option value="" disabled>End Time</option>
            <option value="08:30:00" ${endTime === "08:30:00" ? "selected" : ""}>8:30 AM</option>
            <option value="09:00:00" ${endTime === "09:00:00" ? "selected" : ""}>9:00 AM</option>
            <option value="09:30:00" ${endTime === "09:30:00" ? "selected" : ""}>9:30 AM</option>
            <option value="10:00:00" ${endTime === "10:00:00" ? "selected" : ""}>10:00 AM</option>
            <option value="10:30:00" ${endTime === "10:30:00" ? "selected" : ""}>10:30 AM</option>
            <option value="11:00:00" ${endTime === "11:00:00" ? "selected" : ""}>11:00 AM</option>
            <option value="11:30:00" ${endTime === "11:30:00" ? "selected" : ""}>11:30 AM</option>
            <option value="12:00:00" ${endTime === "12:00:00" ? "selected" : ""}>12:00 PM</option>
            <option value="12:30:00" ${endTime === "12:30:00" ? "selected" : ""}>12:30 PM</option>
            <option value="13:00:00" ${endTime === "13:00:00" ? "selected" : ""}>1:00 PM</option>
            <option value="13:30:00" ${endTime === "13:30:00" ? "selected" : ""}>1:30 PM</option>
            <option value="14:00:00" ${endTime === "14:00:00" ? "selected" : ""}>2:00 PM</option>
            <option value="14:30:00" ${endTime === "14:30:00" ? "selected" : ""}>2:30 PM</option>
            <option value="15:00:00" ${endTime === "15:00:00" ? "selected" : ""}>3:00 PM</option>
            <option value="15:30:00" ${endTime === "15:30:00" ? "selected" : ""}>3:30 PM</option>
            <option value="16:00:00" ${endTime === "16:00:00" ? "selected" : ""}>4:00 PM</option>
            <option value="16:30:00" ${endTime === "16:30:00" ? "selected" : ""}>4:30 PM</option>
            <option value="17:00:00" ${endTime === "17:00:00" ? "selected" : ""}>5:00 PM</option>
            <option value="17:30:00" ${endTime === "17:30:00" ? "selected" : ""}>5:30 PM</option>
            <option value="18:00:00" ${endTime === "18:00:00" ? "selected" : ""}>6:00 PM</option>
            <option value="18:30:00" ${endTime === "18:30:00" ? "selected" : ""}>6:30 PM</option>
            <option value="19:00:00" ${endTime === "19:00:00" ? "selected" : ""}>7:00 PM</option>
            <option value="19:30:00" ${endTime === "19:30:00" ? "selected" : ""}>7:30 PM</option>
            <option value="20:00:00" ${endTime === "20:00:00" ? "selected" : ""}>8:00 PM</option>
            <option value="20:30:00" ${endTime === "20:30:00" ? "selected" : ""}>8:30 PM</option>
            <option value="21:00:00" ${endTime === "21:00:00" ? "selected" : ""}>9:00 PM</option>
          </select>
          <button type="button" class="btn btn-sm btn-outline-danger remove-time">Remove</button>
        `;
      timeSlots.appendChild(newSlot);
      newSlot.querySelector('.remove-time').addEventListener('click', function(){
        this.closest('.time-slot').remove();
      });
    }
  } catch{
    console.log("ERROR: ", error);
  }
  // const timeSlots = document.getElementById(`selector${day}`);
  // const newSlot = document.createElement('div');
  // newSlot.className = `time-slot`;
  // newSlot.innerHTML =``;
}

function clickUserEvent(event, type){
  //student
  console.log('TYPE: ', type);
  if((event.extendedProps.type=='Pending' && type=='true') || (event.extendedProps.type=='Accepted')){
    const downloadModal = document.getElementById('download-modal');
    const newModal = new bootstrap.Modal(downloadModal);
    newModal.show();
    console.log('show modal');
    populateDownload(event);
  }
  //tutor
  else if(event.extendedProps.type=='Pending' && type=='false'){
    //TODO accept meeeting
    const meetingModal = document.getElementById('meeting-modal');
    const newModal = new bootstrap.Modal(meetingModal);
    newModal.show();
    populateMeeting(event);
  }
}

function clickMatchEvent(event, id){
  const requestModal = document.getElementById(`request-modal-${id}`);
  const newModal = new bootstrap.Modal(requestModal,{
    backdrop: true,
  });
  newModal.show();
  console.log('show modal');
  populateRequest(event, id);
}

function populateRequest(event, id){
  eventView = event;
  const Astart = new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const Aend = new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const Aday = new Date(event.start).toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});

  const modal = document.querySelector(`#request-modal-${id} .modal-body`);
  if(modal.childNodes){
    modal.replaceChildren();
  }
  const request = document.createElement('div');

  request.className = `card`;
  request.innerHTML=`
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-md-5 fw-bold">Day:</div>
              <div class="col-md-7 dayInput">${Aday}</div>
            </div>
            <div class="row mb-2">
              <div class="col-md-5 fw-bold">Available From:</div>
              <div class="col-md-7">${Astart} - ${Aend}</div>
            </div>
            <div class="row mb-2">
              <div class="col-md-5 fw-bold">Format:</div>
              <div class="col-md-7" id="request-format">
                <select class="form-select format">
                  <option value="" disabled>Meeting Format</option>
                  <option value="1">In-Person</option>
                  <option value="2">Online</option>
                  <option value="3">Hybrid</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-6" id="request-start">
                  <select class="form-select start-time">
                    <option value="" disabled selected>Start Time</option>
                    <option value="08:00:00">8:00 AM</option>
                    <option value="08:30:00">8:30 AM</option>
                    <option value="09:00:00">9:00 AM</option>
                    <option value="09:30:00">9:30 AM</option>
                    <option value="10:00:00">10:00 AM</option>
                    <option value="10:30:00">10:30 AM</option>
                    <option value="11:00:00">11:00 AM</option>
                    <option value="11:30:00">11:30 AM</option>
                    <option value="12:00:00">12:00 PM</option>
                    <option value="12:30:00">12:30 PM</option>
                    <option value="13:00:00">1:00 PM</option>
                    <option value="13:30:00">1:30 PM</option>
                    <option value="14:00:00">2:00 PM</option>
                    <option value="14:30:00">2:30 PM</option>
                    <option value="15:00:00">3:00 PM</option>
                    <option value="15:30:00">3:30 PM</option>
                    <option value="16:00:00">4:00 PM</option>
                    <option value="16:30:00">4:30 PM</option>
                    <option value="17:00:00">5:00 PM</option>
                    <option value="17:30:00">5:30 PM</option>
                    <option value="18:00:00">6:00 PM</option>
                    <option value="18:30:00">6:30 PM</option>
                    <option value="19:00:00">7:00 PM</option>
                    <option value="19:30:00">7:30 PM</option>
                    <option value="20:00:00">8:00 PM</option>
                    <option value="20:30:00">8:30 PM</option>
                  </select>
              </div>
              <div class="col-6" id="request-end">
                <select class="form-select end-time">
                  <option value="" disabled selected>End Time</option>
                  <option value="08:30:00">8:30 AM</option>
                  <option value="09:00:00">9:00 AM</option>
                  <option value="09:30:00">9:30 AM</option>
                  <option value="10:00:00">10:00 AM</option>
                  <option value="10:30:00">10:30 AM</option>
                  <option value="11:00:00">11:00 AM</option>
                  <option value="11:30:00">11:30 AM</option>
                  <option value="12:00:00">12:00 PM</option>
                  <option value="12:30:00">12:30 PM</option>
                  <option value="13:00:00">1:00 PM</option>
                  <option value="13:30:00">1:30 PM</option>
                  <option value="14:00:00">2:00 PM</option>
                  <option value="14:30:00">2:30 PM</option>
                  <option value="15:00:00">3:00 PM</option>
                  <option value="15:30:00">3:30 PM</option>
                  <option value="16:00:00">4:00 PM</option>
                  <option value="16:30:00">4:30 PM</option>
                  <option value="17:00:00">5:00 PM</option>
                  <option value="17:30:00">5:30 PM</option>
                  <option value="18:00:00">6:00 PM</option>
                  <option value="18:30:00">6:30 PM</option>
                  <option value="19:00:00">7:00 PM</option>
                  <option value="19:30:00">7:30 PM</option>
                  <option value="20:00:00">8:00 PM</option>
                  <option value="20:30:00">8:30 PM</option>
                  <option value="21:00:00">9:00 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label for="desc">Description</label>
              <textarea type="text" name="desc" class="form-control" id="desc" placeholder="Enter a short explanation of goals for the tutoring session."
                    required maxlength="200" rows="4" style="resize: none;"></textarea>
            </div>
          </div>`;
  modal.appendChild(request);
}

function populateDownload(event){
  eventView = event;
  const title = event.title;
  const start = new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const end = new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const day = new Date(event.start).toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});
  const format = event.extendedProps.format;
  const type = event.extendedProps.type;
  const description = event.extendedProps.description || "No description";

  //clear previous event info
  const modal = document.getElementById('download-body');
  if(modal.childNodes){
    modal.replaceChildren();
  }
  const newDiv = document.createElement('div');

  newDiv.className = 'card';
  newDiv.innerHTML =`
    <div class="card-header bg-primary text-white">
      <h5 class="card-title mb-0">${title}</h5>
    </div>
    <div class="card-body">
      <div class="row mb-2">
        <div class="col-md-5 fw-bold">Day:</div>
        <div class="col-md-7">${day}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-5 fw-bold">Time:</div>
        <div class="col-md-7">${start} - ${end}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-5 fw-bold">Format:</div>
        <div class="col-md-7">${format}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-5 fw-bold">Type:</div>
        <div class="col-md-7">${type}</div>
      </div>
      <div class="row">
        <div class="col-md-5 fw-bold">Description:</div>
        <div class="col-md-7">${description}</div>
      </div>
    </div>
  `;
  newDiv.innerHTML += `
      <div class="card-footer">
        <button class="btn btn-sm id="download-button" btn-outline-secondary me-2" onclick="downloadEvent()">Download</button>
      </div>`;
  modal.appendChild(newDiv);
}

function populateMeeting(event){
  eventView = event;
  const title = event.title;
  const start = new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const end = new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const day = new Date(event.start).toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});
  const format = event.extendedProps.format;
  const type = event.extendedProps.type;
  const description = event.extendedProps.description || "No description";

  //clear previous event info
  const modal = document.getElementById('meeting-body');
  if(modal.childNodes){
    modal.replaceChildren();
  }
  const newDiv = document.createElement('div');

  newDiv.className = 'card';
  newDiv.innerHTML =`
    <div class="card-header bg-primary text-white">
      <h5 class="card-title mb-0">${title}</h5>
    </div>
    <div class="card-body">
      <div class="row mb-2">
        <div class="col-md-5 fw-bold">Day:</div>
        <div class="col-md-7">${day}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-5 fw-bold">Time:</div>
        <div class="col-md-7">${start} - ${end}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-5 fw-bold">Format:</div>
        <div class="col-md-7">${format}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-5 fw-bold">Type:</div>
        <div class="col-md-7">${type}</div>
      </div>
      <div class="row">
        <div class="col-md-5 fw-bold">Description:</div>
        <div class="col-md-7">${description}</div>
      </div>
    </div>
  `;
  modal.appendChild(newDiv);
}

function downloadEvent(){
  try {
    console.log(eventView);
    const calEvent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TUDR//EN']; //starts icalendar ICS format 
    calEvent.push(
          'BEGIN:VEVENT',  //each vevent is a individual calendar entry
          `UID:event-${eventView.publicId}@tudr.app`,
          `DTSTAMP:${formaticsdate(new Date())}`, //when event starts its formatted in ICS|| DTSTAMP is when it was downloaded
          `DTSTART:${formaticsdate(eventView.start)}`,
          `DTEND:${formaticsdate(eventView.end)}`,
          `SUMMARY:${eventView.title}`,
          `DESCRIPTION:${eventView.description}`,
          `CATEGORIES:${eventView.type}, ${eventView.format}`,
          'END:VEVENT',
          'END:VCALENDAR'
        );
    
    const icsContent = calEvent.join('\r\n') + '\r\n';
    console.log('ics', icsContent);
    
    const blob = new Blob([icsContent], {type: 'text/calendar; charset=utf-8'});
    const url = URL.createObjectURL(blob);

    // Automatically trigger the download
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.download = `Tudr_Event-${eventView.id}`;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download calendar', error);
  }
}

function formaticsdate(date) {
  const pad = (n) => (n < 10 ? '0' + n : n);
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) + 'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

async function acceptMeeting(){  
  await fetch('/acceptMeeting', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: 
      JSON.stringify({
        event: eventView,
      })
  });
  initializeUserCalendar();
}

async function rejectMeeting(){
  await fetch('/rejectMeeting', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: 
      JSON.stringify({
        event: eventView,
      })
  });
  initializeUserCalendar();
}