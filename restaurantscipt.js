const restaurants = [];
const usercoords = [];

(async function(){
    try{
        Promise.all([getUserPos(),getRestaurants()]).then(() => {
        console.log("Promises resolved");
        // Add distance to restaurants and sort
        restaurants.forEach((resta) => {
            resta.distance = leafmap.distance([usercoords[0], usercoords[1]], [resta.location.coordinates[1], resta.location.coordinates[0]]);
        })
        restaurants.sort((a, b) => a.distance - b.distance);
        console.log("Restaurants sorted");
        refreshRestRestaurants();
        });

    }catch(error){
        console.error(error);
        window.alert("Encoutered an error. :(");
    }
})();

/** Quick HTML element maker
*/
const elementMaker = (type, text = "", id) => {
    const element = document.createElement(type);
    element.textContent = text;
    element.id = id;
    return element;
  };

/**
 * Refresh restaurants on map and on the list
 */
const refreshRestRestaurants = () => {
    markergroup.clearLayers();
    const list = elementMaker("ul", "", "restList");
    restaurants.forEach(restaurant => {

        const marker = L.marker([restaurant.location.coordinates[1], restaurant.location.coordinates[0]]).addTo(markergroup);
        marker.on('click', function(){
            //TODO: Show menu to user
            console.log(restaurant);
        });

        const listItem = elementMaker("li", restaurant.name);
        listItem.onclick = function(){
            leafmap.setView([restaurant.location.coordinates[1], restaurant.location.coordinates[0]], 13);
        };
        listItem.appendChild(elementMaker("ul", restaurant.distance.toFixed(1) + " km"));
    });
};

/**
 * Get restaurants from API
*/
async function getRestaurants(){
    try{
        console.log("Fetching restaurants...");
        return fetch('https://10.120.32.94/restaurant/api/v1/restaurants', {signal: AbortSignal.timeout(2000)})
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Check the data
            // Add restaurants to array
            data.forEach(restaurant => {
                restaurants.push(restaurant);
            });
            // Add markers to map
            restaurants.forEach(restaurant => {
                const marker = L.marker([restaurant.location.coordinates[1], restaurant.location.coordinates[0]]).addTo(markergroup);
                marker.on('click', function(){
                    //TODO: Show menu to user
                    console.log(restaurant);
                });
            });
        });
        return Promise.resolve("Restaurants fetched");
    }catch(error){
        console.error(error);
        window.alert("Error fetching restaurants");
    }
}

// USERPOS SCRIPTS
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}
function success(pos) {
    usercoords.push(pos.coords.latitude, pos.coords.longitude);
    console.log(usercoords);
}
async function getUserPos(){
    const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0,
      };
    try{
        console.log("Fetching user position...");
        navigator.geolocation.getCurrentPosition(success, error, options);
        Promise.resolve("User position fetched");
    }catch(error){
        console.error(error);
        window.alert("Error fetching user position");
    }
};