let currUser; // store the user's display name
const messageType = {
    notify: 'notify',
    self : 'self',
    others: 'others'
};
const socket = io();

// Display the message that a user sent
socket.on('chat message', msg => {
    displayMsg(msg, messageType.others);
});

// Display a connect message when a user has enter the chat room
socket.on('user connect', name => {
    displayMsg(`${name} has entered the chat`, messageType.notify);
});

// Displays a message to other users that someone is currently typing
socket.on('typing display', data => {
    let typingMsg = document.getElementById('typingSignal');

    if (data.typing === false) {
        typingMsg.textContent = '';
    } else if (typingMsg.textContent === '') {
        typingMsg.textContent = `${data.name} is typing...`;
    }
});

// Broadcast a disconnect message of a user to all other users
socket.on('user disconnect', name => {
    displayMsg(`${name} has disconnected`, messageType.notify);
});

window.addEventListener('DOMContentLoaded', init);

/**
 * Prompt user to enter their display name and broadcast it to all users
 * in the chat room. Create event listeners for send button and input textbar
 */
function init() {
    currUser = prompt('Enter a name:') || 'Anonymous';
    displayMsg(`You have entered the chat`, messageType.notify);
    socket.emit('user enter', currUser);

    document.getElementById('sendBtn').addEventListener('click', send);
    document.getElementById('messageInput').addEventListener('keydown', isTyping);
}

/**
 * Sends the message from the text bar and broadcast it to all users. Create
 * a new list element for the message
 */
function send() {
    let messageInput = document.getElementById('messageInput');
    if (messageInput.value !== '') {
        displayMsg(`You: ${messageInput.value}`, messageType.self);
    }
    socket.emit('send message', {name: currUser, message: messageInput.value});
    messageInput.value = '';
    socket.emit('typing', {typing: false, name: currUser});
}

/**
 * Creates a new list element that contains the new message and display it
 * in the chat
 * @param {string} msg A message to be displayed
 */
function displayMsg(msg, msgType) {
    let newMsgContainer = document.createElement('li');
    let newMsg = document.createElement('p');
    newMsg.textContent = msg;

    switch(msgType) {
        case messageType.notify:
            newMsg.setAttribute('class', 'center');
            break;
        case messageType.self:
            newMsg.setAttribute('class', 'right');
            break;
        default:
            newMsg.setAttribute('class', 'left');
            break;
    }

    newMsgContainer.appendChild(newMsg);
    document.getElementById('messages').appendChild(newMsgContainer);
}

/**
 * Tracks which key was pressed and notifies other users the person who is
 * currently typing, or if the key is 'Enter', send the message instead
 * @param {HTML Element} e The key object that was pressed
 */
function isTyping(e) {
    const keyPressed = e.key;

    if (keyPressed === 'Enter') {
        e.preventDefault();
        send();
    } else if ((keyPressed.length === 1 && (/[a-zA-Z]/).test(keyPressed)) ||
                                                       keyPressed === ' ') {
        socket.emit('typing', {typing: true, name: currUser});
    } else {
        socket.emit('typing', {typing: false, name: currUser});
    }
}