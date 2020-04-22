var socket = io();
var form = document.getElementById('chat');
var locationButton = document.getElementById('shareLocation');
var callButton = document.getElementById('call');
var messageDiv = document.getElementById('message');
var input = form.querySelector('input')
var messageBody = document.querySelector('#message-body').innerHTML;
var locationBody = document.getElementById('location-body').innerHTML;
var roomData = document.getElementById('roomData').innerHTML;

var {username, room} = Qs.parse( location.search, { ignoreQueryPrefix: true } );

var autoScroll = () => {
    let newMessage = messageDiv.lastElementChild;
    let newMessageMargin = parseInt(getComputedStyle(newMessage).marginBottom);
    let newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    let visibleHeight = messageDiv.offsetHeight;
    let containerHeight = messageDiv.scrollHeight;
    let scrollOffset = messageDiv.scrollTo + visibleHeight;
    
    if (containerHeight - newMessageHeight <= scrollOffset) messageDiv.scrollTop  = messageDiv.scrollHeight;
}

socket.on('message', (message) => {
    console.log('Message : ', message);
    if( message.text !== 'call'){
        let html = Mustache.render(messageBody, {
            id: message.id,
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        });
        messageDiv.insertAdjacentHTML('beforeend', html);
        autoScroll();
    } else if( message.text == 'call' ) {
        playAudio();
    }
});

socket.on('location', (url) => {
    console.log(url)
    let html = Mustache.render(locationBody, {
        id: url.id,
        username: url.username,
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    messageDiv.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({room, users}) => {
    let html = Mustache.render(roomData, {
        room, 
        users
    });

    document.getElementById('sidebar').innerHTML = html;
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
});


socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    };
});

function playAudio() {
    var audio = document.getElementById("myAudio");
    audio.play();
}