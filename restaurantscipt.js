const restaurants = [];
// Get restaurants to array
(async function(){
    try{
        console.log("Fetching restaurants...");
        await fetch('https://10.120.32.94/restaurant/api/v1/restaurants', {signal: AbortSignal.timeout(2000)})
        .then(response => response.json())
        .then(data => {
            data.forEach(restaurant => {
              restaurants.push(restaurant);
            });
            console.log("Restaurants added to array");
        });
    }catch(error){
        console.error(error);
        window.alert("Error fetching restaurants");
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