const restApiUrl = "https://10.120.32.94/restaurant/api/v1/"

/**
 * Check if username is available
 * @param {string} username - username to check
 * @returns {boolean} true if available, false if not
 */
const checkAvailability = async (username) => {
    const response = await fetch(restApiUrl + "users/available/" + username).then(response => response.json());
    return response.available;
}

/**
 * Register user
 * @param {string} username - username
 * @param {string} password - password min 5 characters
 * @returns {object} user data
 */
const registerUser = async (username, password, email) => {
    const response = await fetch(restApiUrl + "users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password, email})
    }).then(response => response.json());
    return response;
}

/**
 * Login user
 * @param {string} username - username
 * @param {string} password - password
 * @returns {object} user data
 */
const loginUser = async (username, password) => {
    console.log("logging in")
    const response = await fetch(restApiUrl + "auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
    }).then(response => response.json());
    return response;
};




// MAIN
// Check token
// Create login and register forms to memory
(() => {
    const formdiv = document.getElementById("formdiv");
    formdiv.style.display = "none";

    // Close form if clicked outside
    window.addEventListener("click", function(event){
        const formdiv = document.getElementById("formdiv");
        if (event.target == this.document.getElementById("content") || event.target == this.document.getElementById("mapbox") || event.target == this.document.getElementById("header")){
            formdiv.style.display = "none";
        }
    });

    // Create loginform to memory
    const loginform = elementMaker("form", "", "loginform");
    formdiv.appendChild(loginform);
    loginform.style.display = "none";
    const loginusername = elementMaker("input", "", "loginusername");
    loginusername.type = "text";
    loginusername.placeholder = "Username";
    loginform.appendChild(loginusername);
    const loginpassword = elementMaker("input", "", "loginpassword");
    loginpassword.type = "password";
    loginpassword.placeholder = "Password";
    loginform.appendChild(loginpassword);
    const loginbutton = elementMaker("button", "Login", "loginbutton");
    loginform.appendChild(loginbutton);
    loginbutton.addEventListener("click", async function(event){
        event.preventDefault();
        const username = loginusername.value;
        const password = loginpassword.value;
        const login = await loginUser(username, password);
        if (login.message !== "Login successful"){
            window.alert(login.message);
            console.error(login.message);
            return;
        }
        localStorage.setItem("token", login.token);
        console.log("User logged in:", login);
    });

    // Create registerform to memory
    const registerform = elementMaker("form", "", "registerform");
    formdiv.appendChild(registerform);
    registerform.style.display = "none";
    const registerusername = elementMaker("input", "", "registerusername");
    registerusername.type = "text";
    registerusername.placeholder = "Username";
    registerform.appendChild(registerusername);
    const registerpassword = elementMaker("input", "", "registerpassword");
    registerpassword.type = "password";
    registerpassword.placeholder = "Password";
    registerform.appendChild(registerpassword);
    const registeremail = elementMaker("input", "", "registeremail");
    registeremail.type = "email";
    registeremail.placeholder = "Email";
    registerform.appendChild(registeremail);
    const registerbutton = elementMaker("button", "Register", "registerbutton");

    // REGISTERBUTTON FUNC
    registerbutton.addEventListener("click", async function(event){
        event.preventDefault();
        const username = registerusername.value;
        const password = registerpassword.value;
        const email = registeremail.value;
        let user;
        // Input validation
        if (username.length < 5){
            window.alert("Username must be at least 5 characters long");
            console.error("Username must be at least 5 characters long");
            return;
        } else if (password.length < 5){
            window.alert("Password must be at least 5 characters long");
            console.error("Password must be at least 5 characters long");
            return;
        } else if (email.length < 5 || !email.includes("@") || !email.includes(".")){
            window.alert("Email must be valid");
            console.error("Email must be valid");
            return;
        }
        // Check availability
        const available = await checkAvailability(username);
        if (available){
            user = await registerUser(username, password, email);
            window.alert("User registered");
            console.log("User registered:", user);
        } else {
            window.alert("Username not available");
            console.error("Username not available");
            return;
        }
        // User OK -> Login
        const login = await loginUser(username, password);
        localStorage.setItem("token", token);
        console.log("User logged in:", login);
    });
    registerform.appendChild(registerbutton);
})();

// TOPLOGINBUTTON FUNC
document.getElementById("toploginbutton").onclick = function(){
    // Display login form
    if (document.getElementById("formdiv").style.display == "block"){
        document.getElementById("formdiv").style.display = "none";
    } else {
    document.getElementById("formdiv").style.display = "block";
    document.getElementById("loginform").style.display = "block";
    document.getElementById("registerform").style.display = "none";
    }
}

// TOPREGISTERBUTTON FUNC
document.getElementById("topregisterbutton").onclick = function(){
    // Display register form
    if (document.getElementById("formdiv").style.display == "block"){
        document.getElementById("formdiv").style.display = "none";
    } else {
    document.getElementById("formdiv").style.display = "block";
    document.getElementById("registerform").style.display = "block";
    document.getElementById("loginform").style.display = "none";
    }
}