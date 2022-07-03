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

// let map, mapEvent;

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; //Array of coordinates [lat, lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//Class Tests:
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

//Application Architecture:
class App {
  #map;
  #mapEvent;
  //constructor method is called immediately after a new object is created from the App class right when the page is loaded - instead of writing app._getPosition outside the class, we can do it like this in the constructor
  constructor() {
    this._getPosition();
    //have to bind this because we need it to point to the class App object itself not to the form
    form.addEventListener('submit', this._newWorkout.bind(this));

    //we don't need to bind() this callback function because we don't actually use the this keyword within the function - see _toggleElevationField
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    //getCurrentPosition takes two callback functions: the first is the function that will be called to get the users coordinates (user selects 'allow'), the second will be called if there is an error (user selects 'block')
    if (navigator.geolocation)
      //to get pop-up window asking for location
      //must bind to get this keyword
      navigator.geolocation.getCurrentPosition(
        //bind(this) points to current object
        //!normally we bind to an object name (in this case, it would be app, but app is outside of the scope of this function, so we must use 'this' to refer to the new instance of App (called 'app') created by the App Class)
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
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
    this.#map = L.map('map').setView(coords, 12);
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
    }).addTo(this.#map);

    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus(); //focuses on distance

    console.log(this.#mapEvent);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    //Clear input fields:
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    // Display the marker
    // grab lat and lng from mapEvent.latlng
    const { lat, lng } = this.#mapEvent.latlng;
    //use [lat, lng] instead of coords
    L.marker([lat, lng], {
      riseOnHover: true,
    })
      .addTo(this.#map)
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
  }
}

const app = new App();
