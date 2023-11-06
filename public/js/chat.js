const socket = io()


// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = ()=>{
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have I scrolled

    const scrollOffset = $messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('locationMessage',(link)=>{
    console.log(link)
    const html = Mustache.render(locationTemplate,{
        username:link.username,
        url : link.url,
        createdAt:moment(link.createdAt).format('hh:mm a')

    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('roomData',({room,users})=>{
   const html = Mustache.render(sidebarTemplate,{
        room,
        users
   })
   document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    //disable
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
         $messageFormButton.removeAttribute('disabled')
         $messageFormInput.value=''
         $messageFormInput.focus()
        //enable
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!!')
    })
})

$sendLocationButton.addEventListener('click',()=>{
   if(!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
   }
   $sendLocationButton.setAttribute('disabled','disabled')

   navigator.geolocation.getCurrentPosition((position)=>{
       // console.log(position)
     
        socket.emit('sendLocation',{
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        },(callback)=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(callback)
        })
   })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})