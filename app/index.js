import clock from "clock";
import * as document from "document";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { peerSocket } from "messaging";

peerSocket.onopen = () => {
    peerSocket.send({ command: 'getTemperature' });
};

peerSocket.onmessage = (event) => {
    if (event.data.command == "setTemperature") {
        temperature.text = event.data.temperature + "°";
    };
}


const months = {
    0: 'JAN',
    1: 'FEB',
    2: 'MAR',
    3: 'APR',
    4: 'MAY',
    5: 'JUN',
    6: 'JUL',
    7: 'AUG',
    8: 'SEP',
    9: 'OCT',
    10: 'NOV',
    11: 'DEC'
}

const secondHandColour = '#ef8ebd';
const minuteHandColour = '#ffffff';
const hourHandColour = '#ffcaed';
const backgroundColour = '#261e23';

// Tick every second
clock.granularity = "seconds";

let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secsgroup");
let heartRate = document.getElementById("heartrate");
let month = document.getElementById("month");
let dayofmonth = document.getElementById("dayofmonth");
let temperature = document.getElementById("temperature");
let temp_update_minute = null;


// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes, seconds) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    let secAngle = (360 / 12 / 60 / 60) * seconds;
    return hourAngle + minAngle + secAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes, secs) {
    let minuteAngle = (360 / 60) * minutes;
    let secAngle = (360 / 60 / 60) * secs;
    return minuteAngle + secAngle;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
    return (360 / 60) * seconds;
}

// Rotate the hands every tick
function updateClock() {
    let today = new Date();
    let hours = today.getHours() % 12;
    let mins = today.getMinutes();
    let secs = today.getSeconds();

    hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins, secs) + 180;
    minHand.groupTransform.rotate.angle = minutesToAngle(mins, secs) + 180;
    secHand.getElementById("second-sweep").to = secondsToAngle(secs) + 180 + 6;
    secHand.getElementById("second-sweep").from = secondsToAngle(secs) + 180;
    secHand.animate("activate");

    month.text = months[today.getMonth()];
    let date = today.getDate().toString();
    if (date.length < 2) {
        date = '0' + date;
    }
    dayofmonth.text = date;

    // Every 5 minutes
    if ((mins % 5) == 0 && temp_update_minute != mins) {
        peerSocket.send({ command: 'getTemperature' });
        temp_update_minute = mins;
    }
}

// Update the clock every tick event
clock.addEventListener("tick", updateClock);

const hrm = new HeartRateSensor();
const body = new BodyPresenceSensor();
body.start();

hrm.addEventListener("reading", e => {
    if (body.present) {
        heartRate.text = hrm.heartRate;
    } else {
        heartRate.text = "--";
    }
});
hrm.start();