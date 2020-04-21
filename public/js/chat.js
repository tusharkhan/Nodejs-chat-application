var socket = io();
var form = document.getElementById('chat');
var locationButton = document.getElementById('shareLocation');
var callButton = document.getElementById('call');
var messageDiv = document.getElementById('message');
var input = form.querySelector('input')
var messageBody = document.querySelector('#message-body').innerHTML;
var locationBody = document.getElementById('location-body').innerHTML;

var {username, room} = Qs.parse( location.search, { ignoreQueryPrefix: true } );

socket.on('message', (message) => {
    console.log(message);
    if( message.text !== 'call'){
        let html = Mustache.render(messageBody, {
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        });
        messageDiv.insertAdjacentHTML('beforeend', html)
    } else if( message.text == 'call' ) {
        playAudio();
    }
});

socket.on('location', (url) => {
    let html = Mustache.render(locationBody, {
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    messageDiv.insertAdjacentHTML('beforeend', html)
})

form.addEventListener('submit', (e) => {
    e.preventDefault();

    form.querySelector('button').setAttribute('disabled', 'disabled');

    let message = input.value;

    socket.emit('sendMessage', message, (error) => {
        form.querySelector('button').removeAttribute('disabled');
        input.value = '';
        input.focus();
        if( error ) return console.error('Do not')
        console.log('Message send')
    });
});


locationButton.addEventListener('click', ( e ) => {
    let geo = navigator.geolocation;
    locationButton.setAttribute('disabled', 'disabled');
    if( geo ){
        e.preventDefault();

        geo.getCurrentPosition((position) => {
            console.log(position.coords.latitude, position.coords.longitude);
            socket.emit('shareLocation', {latitude : position.coords.latitude , longitude: position.coords.longitude}, (error) => {
                if( error ) return console.log('Error sending location');
                locationButton.removeAttribute('disabled');
                console.log('Location shared')
            })
        });
    } else alert('Does not support by browser');

});


callButton.addEventListener('click', (e) => {
    e.preventDefault();

    socket.emit('call', 'call');
})


function playAudio() {
    var audio = document.getElementById("myAudio");
    audio.play();
}

socket.emit('join', {username, room})