const restaurants = [];
const usercoords = [];
const userIcon = L.divIcon({className: 'user-div-icon'});
const restIcon = L.divIcon({className: 'rest-div-icon'});

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
    // also refresh user
    const marker = L.marker(usercoords, {icon: userIcon}).addTo(markergroup);
    const list = elementMaker("ul", "", "restList");
    restaurants.forEach(restaurant => {
        // Marker for each restaurant
        const marker = L.marker([restaurant.location.coordinates[1], restaurant.location.coordinates[0]], {icon: restIcon}).addTo(markergroup);
        marker.on('click', function(){
            //TODO: Show menu to user
            console.log(restaurant);
        });
        // List item for each restaurant
        const li2 = elementMaker("ul");
        li2.onclick = function(){
            leafmap.setView([restaurant.location.coordinates[1], restaurant.location.coordinates[0]], 13);
        };
        li2.appendChild(elementMaker("li", restaurant.name));
        li2.appendChild(elementMaker("li", `${restaurant.address}, ${restaurant.city}`));
        li2.appendChild(elementMaker("li", restaurant.distance.toFixed(1) + " km"));
        li2.appendChild(elementMaker("li", restaurant.company));
        list.appendChild(li2);
    });
    document.getElementById("restlist").replaceWith(list);
};

/**
 * Get restaurants from API
*/
async function getRestaurants(){
    try{
        console.log("Fetching restaurants...");
        await fetch('https://10.120.32.94/restaurant/api/v1/restaurants', {signal: AbortSignal.timeout(2000)})
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
    // Update user coordinates, move map, put red marker
    usercoords.push(pos.coords.latitude, pos.coords.longitude);
    leafmap.setView(usercoords, 13);
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