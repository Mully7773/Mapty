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

let map, mapEvent;
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
      map = L.map('map').setView(coords, 12);
      //   console.log(map);

      //For openstreetmap:
      //   L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      //     attribution:
      //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      //   }).addTo(map);

      //For Google Maps:
      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      //Handling clicks on map
      map.on('click', function (mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus(); //focuses on distance

        console.log(mapEvent);
        //grab lat and lng from mapEvent.latlng
        // const { lat, lng } = mapEvent.latlng;
        // //use [lat, lng] instead of coords
        // L.marker([lat, lng])
        //   .addTo(map)
        //   .bindPopup(
        //     //See Leaflet docs for options
        //     L.popup({
        //       maxWidth: 250,
        //       minWidth: 100,
        //       autoClose: false,
        //       closeOnClick: false,
        //       className: 'running-popup',
        //     })
        //   )
        //   .setPopupContent('Workout')
        //   .openPopup();
      });
    },
    function () {
      alert('Could not get your position');
    }
  );

form.addEventListener('submit', function (e) {
  e.preventDefault();

  //Clear input fields:
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
  // Display the marker
  // grab lat and lng from mapEvent.latlng
  const { lat, lng } = mapEvent.latlng;
  //use [lat, lng] instead of coords
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      //See Leaflet docs for options
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});

inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
