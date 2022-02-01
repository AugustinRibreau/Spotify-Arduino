require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const SerialPort = require('serialport');
const port = new SerialPort(process.env.port, {baudRate: 9600});

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
    // c = current time / p  = progression duration / t = total duration
    const data =
        `{"c":"${get_current_music_name}", "p":"${progress_duration}", "t":"${total_duration_ms}"}`;

    port.write(data, (err) => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        return console.log('message written');
    });
}

setInterval(() => {
    spotifyApi.getMyCurrentPlayingTrack().then(res => {
        const progress_duration = res.body.progress_ms;
        const total_duration_ms = res.body.item.duration_ms;
        const get_current_music_name = res.body.item.name;
        sendToArduino(get_current_music_name, progress_duration, total_duration_ms)
    }).catch(err => {
        console.log(err)
    })
}, 10000);