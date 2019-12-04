/*MODAL SCRIPT*/
////////////////
//Get  modal
let modal = document.getElementById("myModal");
// Get button to opens modal
let getLocations = document.getElementById("getLocations");
// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];
let infoPane = document.getElementById("panel");

// When the user clicks on the button, open the modal
getLocations.onclick = function () {
	//getLocation();  (redundant)
	finalPlaces = new Array(); /*an array of our curated place results*/
	pageSize = 1; /*assume we have atleast 1 page of results to start*/
	buttonPressed = true;
	initMap(); //initiate map
	modal.style.display = "block"; //display

}

//getLocations.onclick = getLocation();
// When the user clicks on <span> (x), close the modal
span.onclick = function () {
	//modal.style.display = "none";
	Console.log(infoPane.classList);
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {


	if (event.target == modal) {
		modal.style.display = "none";
		buttonPressed = false;
	}
}

///////////////////////////////////////////////
/*MAPS IMPLEMENTATION */
///////////////////////////////////////////////
//variables for our map
let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let radius;
let buttonPressed = false;
let finalPlaces = new Array();
let pageSize = 1;
var getNextPage = null;
let searchRadius = 2000;
let locationType = "restaurant"

function initMap() {
	if (!buttonPressed) {
		return; //do not initmap unless button is pressed
	}

	// Initialize variables (map bounds, info window/panel)
	bounds = new google.maps.LatLngBounds();
	infoWindow = new google.maps.InfoWindow();
	currentInfoWindow = infoWindow;

	// Try HTML5 geolocation. Ask for users lat/long	
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			pos = {
				lat: position.coords.latitude, //get lat/long from position
				lng: position.coords.longitude
			};
			map = new google.maps.Map(document.getElementById("map"), {
				center: pos, //center map to coordinates, zoom to reasonable distance
				zoom: 15
			});
			bounds.extend(pos);
			infoWindow.setPosition(pos);
			infoWindow.setContent("Location found.");
			infoWindow.open(map);
			map.setCenter(pos); //we have a map centered on our user's pos
			// Call Places Nearby Search on user's location (will get 20 nearby results)
			getNearbyPlaces(pos);
		}, () => {
			// Browser supports geolocation, but user has denied permission
			handleLocationError(true, infoWindow);
		});
	} else {
		// Browser doesn't support geolocation
		handleLocationError(false, infoWindow);
	}
}

// Handle a geolocation error
function handleLocationError(browserHasGeolocation, infoWindow) {
	// Set default location to Sydney, Australia
	pos = {
		lat: 50.437,
		lng: -104.6
	};
	map = new google.maps.Map(document.getElementById("map"), {
		center: pos,
		zoom: 15
	});

	// Display an InfoWindow at the map center
	infoWindow.setPosition(pos);
	infoWindow.setContent(
		browserHasGeolocation ?
		"Geolocation permissions denied. Using default location." :
		"Error: Your browser doesn't support geolocation."
	);
	infoWindow.open(map);
	currentInfoWindow = infoWindow;
	// Call Places Nearby Search on the default location
	getNearbyPlaces(pos);
}


// Perform a Places Nearby Search Request
function getNearbyPlaces(position) {
	let request = {
		location: position, //variables of search parameters, able to change 
		radius: searchRadius,
		keyword: locationType
	};
	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, nearbyCallback);
}


// Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status, pagination) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		createFullList(results); //builds a list of our results, so derive a result list greater than 20
		if (pagination.hasNextPage) {
			sleep: 2;
			pagination.nextPage(); //if we have a 2nd or 3rd page of results, do nearbycallback and add to list (60 total)
		}
	}
}



function createFullList(places) //we may only have 60 results, so we will not create markers until weve completed the full list (NEEDS IMPROVEMENT)
{
	finalPlaces = finalPlaces.concat(places);

	if (pageSize != 3) {
		pageSize++;
	} else {
		createMarkers(finalPlaces);
	}
}

// Set markers at the location of each place result
function createMarkers(places) {
	var random = Math.random();
	var size = 5; //search size. variable for future modification
	var i;
	var randomPlaces = new Array();

	//var temp;
	for (i = 0; i < size; i++) {
		do {
			random = Math.round((Math.random() * places.length)); //get a random number within our list of 60
		} while (random < 0 || random > places.length)
		//temp = places[random];
		randomPlaces.push(places[random]); //add size ammount of values to randomPlaces array
	}

	randomPlaces.forEach(place => //from our randomPlaces, we add a marker to each value
		{
			let marker = new google.maps.Marker({
				position: place.geometry.location,
				map: map,
				title: place.name
			});

			/* TODO: Step 4B: Add click listeners to the markers */
			// Add click listener to each marker
			google.maps.event.addListener(marker, "click", () => //add event listeners to each place
				{
					let request = {
						placeId: place.place_id,
						fields: [
							"name",
							"formatted_address",

							"rating",
							"website",
							"photos"
						]
					};
					/* Only fetch the details of a place when the user clicks on a marker.
					 * If we fetch the details for all place results as soon as we get
					 * the search response, we will hit API rate limits. */
					service.getDetails(request, (placeResult, status) => {
						showDetails(placeResult, marker, status);
					});
				});
			// Adjust the map bounds to include the location of this marker
			bounds.extend(place.geometry.location);
		});
	/* Once all the markers have been placed, adjust the bounds of the map to
	 * show all the markers within the visible area. */
	map.fitBounds(bounds);
	pageSize = 4;
}

// Builds an InfoWindow to display details above the marker
function showDetails(placeResult, marker, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		let placeInfowindow = new google.maps.InfoWindow();
		let rating = "None";
		if (placeResult.rating) rating = placeResult.rating; {
			placeInfowindow.setContent(
				"<div><strong>" +
				placeResult.name +
				"</strong><br>" + //content of our info window
				"Rating: " +
				rating.toFixed(2) +
				"</div>"
			);
		}
		placeInfowindow.open(marker.map, marker); //place according to marker location
		currentInfoWindow.close();
		currentInfoWindow = placeInfowindow;
		showPanel(placeResult);
	} else {
		console.log("showDetails failed: " + status);
	}
}

// Displays place details in a sidebar
function showPanel(placeResult) {
	// If infoPane is already open, close it
	if (infoPane.classList.contains("open")) {
		infoPane.classList.remove("open");
	}
	// Clear the previous details
	while (infoPane.lastChild) {
		infoPane.removeChild(infoPane.lastChild);
	}

	// Add the primary photo, if there is one
	if (placeResult.photos) {
		let firstPhoto = placeResult.photos[0];
		let photo = document.createElement("img");
		photo.classList.add("hero");
		photo.src = firstPhoto.getUrl();
		infoPane.appendChild(photo);
	}

	// Add place details with text formatting
	let name = document.createElement("h1");
	name.classList.add("place");
	name.textContent = placeResult.name;
	infoPane.appendChild(name);

	if (placeResult.rating) {
		let rating = document.createElement("p");

		rating.classList.add("details");
		rating.textContent = `Rating: ${placeResult.rating.toFixed(2)} \u272e`; //round to 2 decimals or else we get absurdly large float
		infoPane.appendChild(rating);
	}

	let address = document.createElement("p");
	address.classList.add("details");
	address.textContent = placeResult.formatted_address;
	infoPane.appendChild(address);

	if (placeResult.website) {
		let websitePara = document.createElement("p");
		let websiteLink = document.createElement("a");
		let websiteUrl = document.createTextNode(placeResult.website);
		websiteLink.appendChild(websiteUrl);
		websiteLink.title = placeResult.website;
		websiteLink.href = placeResult.website;
		websitePara.appendChild(websiteLink);
		infoPane.appendChild(websitePara);
	}
	// Open the infoPane
	infoPane.classList.add("open");
}








/* POTENTIALLY REDUNDANT
var x = document.getElementById("modal_msg");

function getLocation() 
{
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(showPosition);
	} 
	else 
	{ 
		x.innerHTML = "Geolocation is not supported by this browser.";
	}
}
*/
/* potentially redundant
function showPosition(position) {
	
  x.innerHTML = "Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude;
}
*/