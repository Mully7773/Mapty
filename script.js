'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//getCurrentPosition takes two callback functions: the first is the function that will be called to get the users coordinates (user selects 'allow'), the second will be called if there is an error (user selects 'block')
if (navigator.geolocation)
  //to get pop-up window asking for location
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      //not working...
      //   console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      //test for Japan:
      //   console.log(
      //     `https://www.google.com/maps/search/?api=1&query=36.2048,138.2529`
      //   );
      //working link - not 100% accurate
      console.log(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      );

      const coords = [latitude, longitude];

      //second argument is how much zoom you want
      const map = L.map('map').setView(coords, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(coords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    },
    function () {
      alert('Could not get your position');
    }
  );
