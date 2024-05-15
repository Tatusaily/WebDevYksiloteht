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
    if (response.token){
        localStorage.setItem("token", response.token);
        console.log("Login successful:", response);
        console.log("Token:", response.token)
        location.reload();
        return true;
    } else {
        console.error("Login failed:", response.message);
        window.alert("Login failed: " + response.message);
        return false;
    }
};

/**
 * Upload image
 * @param {object} image - image file
 * @returns {object} response either success or error
*/
const uploadimage = async (image) => {
    const formData = new FormData();
    formData.append("avatar", image);
    const response = await fetch(restApiUrl + "users/avatar", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: formData
    }).then(response => response.json());
    if (response.error){
        console.error("Image upload failed:", response.error);
        window.alert("Image upload failed: " + response.error);
    } else {
        console.log("Image uploaded:", response);
        // reset image
        downloadImage(response.data.avatar);
    }
    return response;
}

const downloadImage = async (url) => {
    const urli = "https://10.120.32.94/restaurant/uploads/" + url;
    const response = await fetch(urli).then(response => response.blob());
    // create object url
    const objectURL = URL.createObjectURL(response);
    // display on page
    const imagespot = document.getElementById("profilepic");
    imagespot.src = objectURL;
    imagespot.style.display = "inline";

}

/**
 * Get user by token
 * @param {string} token - user token
 * @returns {object} user data
*/
const getUserByToken = async (token) => {
    const response = await fetch(restApiUrl + "users/token", {
        headers: {"Authorization": "Bearer " + token}
    }).then(response => response.json());
    return response;
}

const checkToken = async () => {
    const token = localStorage.getItem("token");
    if (token){
        // Check user by token
        const user = await getUserByToken(token);
        if (user){
            console.log("User is logged in:", user);
            // User is logged in, show logout button
            document.getElementById("toploginbutton").style.display = "none";
            document.getElementById("topregisterbutton").style.display = "none";
            document.getElementById("toplogoutbutton").style.display = "inline";
            document.getElementById("topuploadbutton").style.display = "inline";
            // Show user avatar
            if (user.avatar){
                downloadImage(user.avatar);
            }

        } else {
            console.error("Invalid token");
            localStorage.removeItem("token");
            document.getElementById("topuploadbutton").style.display = "none";
            document.getElementById("toploginbutton").style.display = "inline";
            document.getElementById("topregisterbutton").style.display = "inline";
            document.getElementById("toplogoutbutton").style.display = "none";
        }
    } else {
        console.log("User is not logged in");
        document.getElementById("topuploadbutton").style.display = "none";
        document.getElementById("toploginbutton").style.display = "inline";
        document.getElementById("topregisterbutton").style.display = "inline";
        document.getElementById("toplogoutbutton").style.display = "none";
    }
};




// MAIN
// We do things that should be done at page load.
// Check if user is logged in -> if user is logged in, we don't show login/register forms, but instead display a logout button.


// CREATE LOGIN/REGISTER FORMS
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

// Loginform button func
loginbutton.addEventListener("click", async function(event){
    event.preventDefault();
    const username = loginusername.value;
    const password = loginpassword.value;
    const login = await loginUser(username, password);
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

// Registerform button func
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
    console.log("User logged in:", login);
});
registerform.appendChild(registerbutton);
// REGISTER/LOGIN FORMS DONE


// Check token
checkToken();


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

// TOPLOGOUTBUTTON FUNC
document.getElementById("toplogoutbutton").onclick = function(){
    // Logout user
    localStorage.removeItem("token");
    console.log("User logged out");
    // Reload page
    location.reload();
}

// TOPUPLOADBUTTON FUNC
document.getElementById("topuploadbutton").onclick = function(){
    // open a image upload dialog
    const uploadmodal = elementMaker("dialog", "", "uploadmodal");
    document.body.appendChild(uploadmodal);
    uploadmodal.showModal();
    const uploadform = elementMaker("form", "", "uploadform");
    uploadmodal.appendChild(uploadform);
    const imageinput = elementMaker("input", "Select file", "imginput");
    imageinput.type = "file";
    imageinput.accept = "image/*";
    uploadform.appendChild(imageinput);
    const uploadbutton = elementMaker("button", "Upload", "uploadbutton");
    uploadform.appendChild(uploadbutton);
    uploadbutton.addEventListener("click", async function(event){
        event.preventDefault();
        const image = imageinput.files[0];
        uploadimage(image);
        uploadmodal.close();
    });

}