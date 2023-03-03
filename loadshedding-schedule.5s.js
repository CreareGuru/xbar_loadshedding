#!/usr/bin/env /usr/local/bin/node

// <xbar.title>Loadshedding Status</xbar.title>
// <xbar.version>v1.0</xbar.version>
// <xbar.author>Wynand Nel</xbar.author>
// <xbar.author.github>CreareGuru</xbar.author.github>
// <xbar.desc>Simple plugin to display loadshedding schedules via .ics link</xbar.desc>
// <xbar.dependencies>nodejs</xbar.dependencies>


//requirements
// axios = npm install axios
// ical = npm install ical

const ical = require('ical');
const axios = require('axios');

// URL of the ICS file to fetch and parse
// ICS urls found here: https://github.com/beyarkay/eskom-calendar/releases/tag/latest
const icsUrl = 'https://github.com/beyarkay/eskom-calendar/releases/download/latest/gauteng-tshwane-group-8.ics';

// Fetch the ICS file from the URL and parse it with `ical.parseICS`
axios.get(icsUrl)
  .then(response => {
    const events = ical.parseICS(response.data);

    // Get the current time
    const now = new Date();

    // Find the current event
    let currentEvent = null;
    for (const eventId in events) {
      const event = events[eventId];
      if (event.type === 'VEVENT' && event.start && event.end) {
        if (event.start <= now && event.end >= now) {
          currentEvent = event;
          break;
        }
      }
    }

    // If there's a current event, display its name, end time, and time remaining
    if (currentEvent) {
      const timeRemaining = currentEvent.end.getTime() - now.getTime();
      const seconds = Math.floor(timeRemaining / 1000) % 60;
      const minutes = Math.floor(timeRemaining / (1000 * 60)) % 60;
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60)) % 24;
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      let remainingTimeStr = '';
      if (days > 0) {
        remainingTimeStr += `${days} day${days > 1 ? 's' : ''} `;
      }
      if (hours > 0) {
        remainingTimeStr += `${hours} hour${hours > 1 ? 's' : ''} `;
      }
      if (minutes > 0) {
        remainingTimeStr += `${minutes} minute${minutes > 1 ? 's' : ''} `;
      }
      console.log(`🔴 Loadshedding till: ${currentEvent.end.toLocaleTimeString()} ends in: ${remainingTimeStr} |size=11`);
    } else {
      // Find the next event
      let nextEvent = null;
      for (const eventId in events) {
        const event = events[eventId];
        if (event.type === 'VEVENT' && event.start) {
          if (event.start >= now) {
            nextEvent = event;
            break;
          }
        }
      }

      // If there's a next event, display its name and start time
      if (nextEvent) {

        const timeRemaining = nextEvent.start.getTime() - now.getTime();
        const seconds = Math.floor(timeRemaining / 1000) % 60;
        const minutes = Math.floor(timeRemaining / (1000 * 60)) % 60;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60)) % 24;
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        let remainingTimeStr = '';
        if (days > 0) {
            remainingTimeStr += `${days} day${days > 1 ? 's' : ''} `;
        }
        if (hours > 0) {
          remainingTimeStr += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        if (minutes > 0) {
          remainingTimeStr += `${minutes} minute${minutes > 1 ? 's' : ''} `;
        
        }
        console.log(`🟢 ${nextEvent.summary} @ ${nextEvent.start.toLocaleTimeString()} in ${remainingTimeStr} |size=11`);
      } else {
        console.log('There is no loadshedding. |size=11');
      }
      
        console.log('---');
        console.log('Upcoming Outages | size=12 | color=white');
        let count = 0;
        for (const eventId in events) {
            const event = events[eventId];
            if (event.type === 'VEVENT' && event.start) {
                if (event.start >= now && count < 5) {
                console.log(`${event.summary} @ ${event.start.toLocaleString()} | size=12 | color=white`);
                count++;
                }
            }
        }
    }

})
.catch(error => {
console.log('An error occurred:', error );
});
