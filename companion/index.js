import { peerSocket } from "messaging";
import { geolocation } from "geolocation";

peerSocket.onmessage = (event) => {
    if (event.data.command == "getTemperature") {
        geolocation.getCurrentPosition(function (position) {
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current=temperature_2m`).then(
                response => { return response.json() }
            ).then(data => {
                peerSocket.send({ command: "setTemperature", temperature: Math.round(data.current["temperature_2m"]) });
            })
        })
    }
}