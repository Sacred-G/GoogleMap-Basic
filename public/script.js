let map;
let markerForm = document.getElementById('marker-form');
let formContainer = new bootstrap.Modal(document.getElementById('form-container'));
let token = localStorage.getItem('token');


/* displays the map */
async function initMap() {
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    });

    const markers = await fetchMarkers();
    markers.forEach(markerData => {
        addMarker(markerData);
    });

    map.addListener('click', (e) => {
        openForm(e.latLng, map);
    });
}


/* Opens the login and register form */
function openForm(location, map) {
    formContainer.show();
    markerForm.onsubmit = async (event) => {
        event.preventDefault();
        const markerData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            imageUrl: document.getElementById('image-url').value,
            lat: location.lat(),
            lng: location.lng()
        };
        await saveMarker(markerData);
        addMarker(markerData);
        markerForm.reset();
        formContainer.hide();
    };
}


/* Adds a marker to the map */
function addMarker(markerData) {
    const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: map
    });

    const infoWindowContent = `
        <div class="info-window">
            <h3>${markerData.title}</h3>
            <img src="${markerData.imageUrl}" alt="Marker Image">
            <p>${markerData.description}</p>
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}


/* fetched data from mongo database and then updates map and then updates database */
/**
 * The above JavaScript functions handle saving and fetching marker data from a specified API endpoint
 * asynchronously.
 *  Marker data object containing information about a location, such as latitude,
 * longitude, name, description, etc.
 * The `saveMarker` function is a function that sends a POST request to
 * 'http://localhost:3000/api/markers' with the provided `markerData` in the request body. It includes
 * headers for 'Content-Type' as 'application/json' and 'Authorization' with the token value. It then
 * returns the JSON response from the server.
 */
async function saveMarker(markerData) {
    const response = await fetch('http://localhost:3000/api/markers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify(markerData)
    });
    return await response.json();
}

async function fetchMarkers() {
    const response = await fetch('http://localhost:3000/api/markers');
    return await response.json();

}/* Event listener attached to the form with the id 'login-form'.
It listens for the 'submit' event on that form. When the form is submitted, the function defined
inside the event listener is executed asynchronously. */
document.getElementById('login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        token = data.token;
        window.location.href = 'index.html';
    } else {
        alert('Login failed: ' + data);
    }
});

/* Event listener attached to the form with the id 'register-form'.
It listens for the 'submit' event on that form. When the form is submitted, the function defined
inside the event listener is executed asynchronously. */
document.getElementById('register-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        alert('Registration successful');
        window.location.href = 'login.html';
    } else {
        alert('Registration failed: ' + data);
    }
});