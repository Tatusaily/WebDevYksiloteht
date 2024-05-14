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

/** Modal Menu Maker
 * 
 * @param {object} restaurant
 * @returns {object} modal element with buttons and menu
 * @example like this:
 * ╔════════════════════╗
 * ║ X          name    ║
 * ║                    ║
 * ║ Daily      Weekly  ║
 * ║ list list list     ║
 * ║ list list list     ║
 * ╚════════════════════╝
 */
const menumaker = async (restaurant, modal) => {
    const topbar = elementMaker("div", "", "topbar");
    modal.appendChild(topbar);
    const closebutton = elementMaker("button", "X", "closeButton");
    closebutton.onclick = function(){
        modal.close();
    };
    topbar.appendChild(closebutton);
    const namefield = elementMaker("h2", restaurant.name);
    topbar.appendChild(namefield);
    const menubody = elementMaker("div", "", "menubody");
    modal.appendChild(menubody);
    let dailylist;
    let weeklylist;

    // Get daily and weekly menudata => into lists
    getRestaurantMenu(restaurant._id).then((data) => {
        if (data) {
            const [dailydata, weeklydata] = [data[0], data[1]];
            
            /* Daily menu */
            dailylist = elementMaker("ul", "", "dailymenu");
            if (dailydata.error){
                dailylist.appendChild(elementMaker("li", dailydata.error));
            } else {
                dailydata.courses.forEach((dish) => {
                    const li = elementMaker("li", "");
                    li.appendChild(elementMaker("h3", dish.name ? dish.name : "No name"));
                    li.appendChild(elementMaker("p", dish.price ? dish.price : "No price"));
                    li.appendChild(elementMaker("p", dish.diets ? dish.diets : "No allergens"));
                    dailylist.appendChild(li);
                });
            }
            menubody.appendChild(dailylist);


            /* Weekly menu */
            const weeklydiv = elementMaker("div", "", "weeklydiv");
            if (!weeklydata.days || weeklydata.days.length === 0){
                weeklydiv.appendChild(elementMaker("h4", weeklydata.error));
            } else {
                weeklydata.days.forEach((day) => {
                    makeWeeklyCard(day).then((card) => {
                        weeklydiv.appendChild(card);
                    });
                });
            }
            weeklydiv.style.display = "none";
            menubody.appendChild(weeklydiv);

            const dailybutton = elementMaker("button", "Daily", "dailyButton");
            dailybutton.onclick = function(){
                dailylist.style.display = "flex";
                weeklydiv.style.display = "none";
            };
            topbar.appendChild(dailybutton);
            
            const weeklybutton = elementMaker("button", "Weekly", "weeklyButton");
            weeklybutton.onclick = function(){
                dailylist.style.display = "none";
                weeklydiv.style.display = "flex";
            };
            topbar.appendChild(weeklybutton);

        } else {
            console.error("Restaurant data is not ready:", data);
        }
    });
};

/**
 * Get restaurant menu from API by ID
 * @param {string} id - restaurant id (not company id)
 * @returns {object} restaurant menu
*/
const getRestaurantMenu = async (id) => {
    const requestdaily = fetch(`https://10.120.32.94/restaurant/api/v1/restaurants/daily/${id}/fi`)
        .then(response => response.json());
    if (!requestdaily.ok) {
        requestdaily.error = "Daily menu not available"};

    const requestweekly = fetch(`https://10.120.32.94/restaurant/api/v1/restaurants/weekly/${id}/fi`)
        .then(response => response.json());
    if (!requestweekly.ok) {
        requestweekly.error = "Weekly menu not available"};

    return Promise.all([requestdaily, requestweekly]);
};


/**
 * Refresh restaurants on map and on the list
 */
const refreshRestRestaurants = () => {
    markergroup.clearLayers();
    // also refresh user
    L.marker(usercoords, {icon: userIcon}).addTo(markergroup);
    const list = elementMaker("ul", "", "restList");
    restaurants.forEach(restaurant => {
        // Marker for each restaurant
        const marker = L.marker([restaurant.location.coordinates[1], restaurant.location.coordinates[0]], {icon: restIcon}).addTo(markergroup);
        // Modal menu construct and function:
        // Create blank modal and continue.
        // Fetching modal data is async, so it will be added later.
        const modal = elementMaker("dialog", "", "menuModal");
        menumaker(restaurant, modal)
        document.body.appendChild(modal);
        marker.on('click', function(){
            modal.showModal();
            console.log(restaurant);
        });
        
        // List item for each restaurant
        const li2 = elementMaker("ul");
        li2.onclick = function(){
            leafmap.setView([restaurant.location.coordinates[1], restaurant.location.coordinates[0]], 13);
        };
        li2.appendChild(elementMaker("li", restaurant.name));
        li2.appendChild(elementMaker("li", `${restaurant.address}, ${restaurant.city}`));
        li2.appendChild(elementMaker("li", (restaurant.distance/1000).toFixed(2) + " km"));
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

async function makeWeeklyCard(daydata){
    const card = elementMaker("div", "", "weeklycard");
    card.appendChild(elementMaker("h3", daydata.date ? daydata.date : "No day"));
    const dishlist = elementMaker("ul", "", "dishlist");
    card.appendChild(dishlist);
    daydata.courses.forEach((dish) => {
        const dishElement = elementMaker("li", "");
        dishElement.appendChild(elementMaker("h4", dish.name ? dish.name : "No name"));
        dishElement.appendChild(elementMaker("p", dish.price ? dish.price : "No price"));
        dishElement.appendChild(elementMaker("p", dish.diets ? dish.diets : "No allergens"));
        dishlist.appendChild(dishElement);
    });
    return card;
};