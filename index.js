require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const SerialPort = require('serialport');
const port = new SerialPort(process.env.port, {baudRate: 9600});
const Readline = require('@serialport/parser-readline');
const { DateTime } = require("luxon");

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
parser.on('data', (elem)=>{
    if (elem === "requestData"){
        sendDataToArduino();
    }
});

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: process.env.redirectUri
});
const token = process.env.token;
spotifyApi.setAccessToken(token);

/**
 * @param {String} get_current_music_name
 * @param {String} progress_duration
 * @param {String} total_duration_ms
 */
function sendToArduino(get_current_music_name, progress_duration, total_duration_ms) {
    // c = current music / p  = progression duration / t = total duration
    const data =
        `{"c":"${get_current_music_name}", "p":"${progress_duration}", "t":"${total_duration_ms}"}`;
    if (process.env.DEBUG){
        console.log(`--- Send "${get_current_music_name}" to Arduino at ${DateTime.now().toFormat("dd/LL/y HH:mm:ss:S")} ---`);
    }
    port.write(data, (err) => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
    });
}

function sendDataToArduino() {
    spotifyApi.getMyCurrentPlayingTrack().then(res => {
        const progress_duration = res.body.progress_ms;
        const total_duration_ms = res.body.item.duration_ms;
        const get_current_music_name = res.body.item.name;
        sendToArduino(get_current_music_name, progress_duration, total_duration_ms)
    }).catch(err => {
        console.log(err)
    })
}