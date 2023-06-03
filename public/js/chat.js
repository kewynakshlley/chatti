const socket = io();

// Elements

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $shareCoordinatesButton = document.querySelector('#share-location');

const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { nickname, room } = Object.fromEntries(
  new URLSearchParams(location.search)
);

const autoscroll = () => {
  // Get the last message element
  const $newMessage = $messages.lastElementChild;

  // Calculate the height of the new message including margin
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Calculate the visible height of the message container
  const visibleHeight = $messages.offsetHeight;

  // Calculate the total height of the message container
  const containerHeight = $messages.scrollHeight;

  // Calculate the current scroll offset (how far the user has scrolled)
  const scrollOffset = $messages.scrollTop + visibleHeight;

  // Check if the user is at the bottom of the container before the new message is added
  if (containerHeight - newMessageHeight <= scrollOffset) {
    // Scroll to the bottom of the container
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    nickname: message.nickname,
    message: message.text,
    createdAt: moment(message.createdAt).format('H:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    nickname: message.nickname,
    url: message.url,
    createdAt: moment(message.createdAt).format('H:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
  });
});

$shareCoordinatesButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation not available for your browser!');
  }

  $shareCoordinatesButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'location',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (callbackMessage) => {
        console.log(callbackMessage);
        $shareCoordinatesButton.removeAttribute('disabled');
      }
    );
  });
});

socket.emit('join', { nickname, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
