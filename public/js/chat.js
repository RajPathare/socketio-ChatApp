// client file

// we need to call this function for initializing the connection
const socket = io();

//Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $locationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true}) // /?username=Raj&room=India, we parse it using the qs library. We don't need
// prefix '?' so we set ignore pref as true.

const autoScroll = () => {
    // new message element 
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have we scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) // check if we are at the bottom before a new message arrives
    {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('printMessageConsole',(printMessageToConsole)=>{
    console.log(printMessageToConsole);
    const html = Mustache.render(messageTemplate,{
        username: printMessageToConsole.username,
        message: printMessageToConsole.text,      // since printMessageToConsole is an object
        createdAt: moment(printMessageToConsole.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll()

})

socket.on('locationMessage',(message)=>{
    console.log(message);
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sideBarTemplate,{
        room: room,
        users: users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault(); // prevent the browser to refresh when the button is clicked.

    $messageFormButton.setAttribute('disabled','disabled') // to disable the button until message is sent

    // const message = document.querySelector('input').value;
                                    // get the name=message from html
    const message = e.target.elements.message.value;
                                            //this is for acknowledgement - callback
    socket.emit('sendMessageForm', message, (profaneError)=>{

        $messageFormButton.removeAttribute('disabled'); // enable the button after the message is sent
        $messageFormInput.value = ''
        $messageFormInput.focus() // send the cursor back to the input field

        if(profaneError)
        {
            return console.log(profaneError);
        }
        console.log('Message delivered');
    })
})

$locationButton.addEventListener('click',()=>{

    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser!');
    }

    $locationButton.setAttribute('disabled','disabled'); // disable the location button until the location is sent.

    navigator.geolocation.getCurrentPosition((position)=>{  // inbuilt function to get location
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{       // this is callback for acknowledgement
        $locationButton.removeAttribute('disabled');
        console.log('Location shared');
    })
})
})

                                    // callback
socket.emit('join',{username, room},(error)=>{
    if(error)
    {
        alert(error)
        location.href= '/'
    }
})