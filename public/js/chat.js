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

// Options
const { nickname, room } = Object.fromEntries(
  new URLSearchParams(location.search)
);

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('H:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format('H:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (callbackMessage) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    console.log(callbackMessage);
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

socket.emit('join', { nickname, room });
