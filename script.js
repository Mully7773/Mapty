'use strict';

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
  id = uuidv4(); //Unique ID from UUID CDN

  constructor(coords, distance, duration) {
    this.coords = coords; //Array of coordinates [lat, lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//Class Tests:
const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Cycling([39, -12], 27, 95, 523);
console.log(run1, cycling1);

//Application Architecture:
class App {
  #map;
  #mapEvent;
  #workouts = [];
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
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    // grab lat and lng from mapEvent.latlng
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //If workout running, create running object
    if (type === 'running') {
      //Check if data is valid
      const cadence = +inputCadence.value;
      //Guard clause: check for the opposite of what we are interested in and if it's true, return immediately
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        //elevation could be negative
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //Add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);
    //Render workout on map as marker
    this._renderWorkoutMarker(workout);
    //render workout on list
    this._renderWorkout(workout);
    //Hide the form and clear input fields

    //Clear input fields:
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords, {
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
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === 'running')
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
       </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;

    if (workout.type === 'cycling')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li> -->`;

    form.insertAdjacentHTML('afterend', html);
  }
}

const app = new App();
