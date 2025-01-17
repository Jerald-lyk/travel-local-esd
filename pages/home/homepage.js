const apiKey = "2DeahNNW3hdNmHNNpsUFv0BH7mQeZm63"; //Hong Tao's API Auth Token

var url = "../../php/objects/userItinRetrieve.php"; //Always set url for api call
var get_userID = sessionStorage.getItem("userID"); //Get's the current user's ID (userID)

ajaxCall(url, display_itin_cards, "POST", { userID: get_userID }); //Call api to php & MySQL to generate the user's (in reference to userID) itinerary cards
url = "../../php/objects/retrievePopItins.php";
ajaxCall(url, display_popular_cards); //Call api to php & MySQL to generate popular itinerary cards

url = "../../php/objects/userItinRecommendedDefault.php";
ajaxCall(url, display_recommended_cards, "POST", { userID: get_userID }); //Call api to php & MySQL to generate recommended itinerary cards based on userID

//Used to redirect to search if they used searchbar
function redirect_to_poi(keyword) {
	window.location.href = "../search/search.html?keyword=" + keyword;
}

// if session has no userID, send back to login page. Otherwise there will be errors for api calls requiring userID
function checkUser() {
	if (sessionStorage.getItem("userID") === null) {
		window.location.href = "../../index.html";
	} else {
		document.getElementById("signOutDiv").setAttribute("style", "display:block;");
		document.getElementById("signUpDiv").setAttribute("style", "display:none;");
	}
}

//Log out, remove session ID
function logOut() {
	window.location.href = "../../index.html";
	sessionStorage.clear();
}

//ajax call function, allows for more flexible variables
function ajaxCall(search, callback, method = "GET", value = null) {
	$.ajax({
		url: search,
		type: method,
		timeout: 500,
		dataType: "json",
		data: value,
		async: true,
		success: function (response) {
			// console.log(response);
			callback(response);
		},
		error: function (response) {
			console.log("error");
		},
	});
}

//used to generate user's itineraries after recieving the data from PHP & MySQL ref (userID)
function display_itin_cards(itineraries) {
	if (itineraries.length == 0) {
		var itins_view = document.getElementById("my_itins");
		itins_view.innerHTML = `<div class="col-md-12 d-flex"><div class="alert alert-danger w-100" role="alert">
		You have no itineraries planned yet. Why not start planning one now by filling up the form above!
	  </div></div>`;
		// itins_view.appendChild(new_card);
	} else {
		// console.log(itineraries);
		let startDate = null;
		var itins_view = document.getElementById("my_itins");
		itins_view.innerHTML = "";
		for (let i = 0; i < itineraries.length; i++) {
			startDate = itineraries[i].startDate.replaceAll("-", "/");
			endDate = itineraries[i].endDate.replaceAll("-", "/");
			var new_card = document.createElement("div");
			var itineraryType = capitalizeFirstLetter(itineraries[i].itineraryType);

			new_card.className = "col-lg-3 col-md-4 d-flex";
			new_card.innerHTML = `
                <div class="card mx-auto mb-5" style="width: 22rem;">
                    <img alt="Card image cap" id="itin+${itineraries[i].itineraryID}" class="card-img-top img-fluid" src="images/${itineraries[i].itineraryType}.jpg">
                    <button onClick="view_itin(${itineraries[i].itineraryID}, 'yes')" class="link_overlay">
                        <div class="card-img-overlay">
                            <h4 class="card-title">${itineraries[i].name}</h4>
                            <footer class="blockquote-footer">${startDate} - ${endDate} <br> ${itineraryType}</p>
                        </div>
                    </button>
                    <button type="button"  onclick="open_Modal(${itineraries[i].itineraryID})"  class="to_delete btn py-0 px-1"><i class="fas fa-trash"></i></button>
                </div>
            `;
			itins_view.appendChild(new_card);
		}
	}
}

//used to generate popular itineraries after recieving the data from PHP & MySQL
function display_popular_cards(itineraries) {
	// console.log(itineraries);
	let startDate = null;
	let itins_view = document.getElementById("popular_itins");
	itins_view.innerHTML = "";
	for (let i = 0; i < itineraries.length; i++) {
		startDate = itineraries[i].startDate.replaceAll("-", "/");
		endDate = itineraries[i].endDate.replaceAll("-", "/");
		let new_card = document.createElement("div");
		new_card.className = "col-lg-3 col-md-4 d-flex";
		new_card.innerHTML = `
        <div class="card mx-auto mb-5" style="width: 22rem;">
            <img alt="Card image cap" id="itin+${itineraries[i].itineraryID}" class="card-img-top img-fluid" src="images/${
			itineraries[i].itineraryType
		}.jpg">
            <button onclick="view_itin(${itineraries[i].itineraryID}, 'no')" class="link_overlay">
                <div class="card-img-overlay">
                    <h4 class="card-title">${itineraries[i].name}</h4>
                    <footer class="blockquote-footer">${startDate} - ${endDate} <br> ${capitalizeFirstLetter(itineraries[i].itineraryType)}</p>
                    <p class="text-white bg-danger">Shared over ${itineraries[i].shared} times!
                    <img src="images/like" class="like_img">
                    <p>
                </div>
                
            </button>
        </div>
    `;

		itins_view.appendChild(new_card);
	}
}

//used to generate recommended itineraries after recieving the data from PHP & MySQL ref (userID)
function display_recommended_cards(itineraries) {
	if (itineraries.length == 0) {
		$("#Recommended").html("");
	} else {
		let itins_view = document.getElementById("recommended_itins");
		itins_view.innerHTML = "";
		for (let i = 0; i < itineraries.length; i++) {
			startDate = itineraries[i].startDate.replaceAll("-", "/");
			endDate = itineraries[i].endDate.replaceAll("-", "/");
			let new_card = document.createElement("div");
			new_card.className = "col-lg-3 col-md-4 d-flex";
			new_card.innerHTML = `
		  <div class="card mx-auto mb-5" style="width: 22rem;">
			  <img alt="Card image cap" id="itin+${itineraries[i].itineraryID}" class="card-img-top img-fluid" src="images/${itineraries[i].itineraryType}.jpg">
			  <button onClick="view_itin(${itineraries[i].itineraryID}, 'no')" class="link_overlay">
				  <div class="card-img-overlay">
					  <h4 class="card-title">${itineraries[i].name}</h4>
					  <footer class="blockquote-footer">${startDate} - ${endDate} <br> ${capitalizeFirstLetter(itineraries[i].itineraryType)}</p>
				  </div>
			  </button>
		  </div>
	  `;
			itins_view.appendChild(new_card);
		}
	}
}

//redirect upon clicking itinerary card to itinerary
function view_itin(link, own) {
	window.location.href = "../itinerary_detail/itinerary_details.html?id=" + link + "&own=" + own;
}

//modal toggle to prevent accidental deletion
function open_Modal(itin) {
	document.getElementById("confirm").id = itin;
	$("#exampleModalCenter").modal("show");
}

//delete itinerary ref (itineraryID)
function delete_itin(id) {
	var itineraryID = { itineraryID: id };
	itineraryID = JSON.stringify(itineraryID);
	let url = "../../php/objects/itinDelete.php";
	ajaxCall(url, console.log, "POST", itineraryID);
	location.reload();
}

//Add new itinerary based on details in form
function add_itinerary() {
	var itinerary = {
		itinName: $("#itinName").val(),
		itinType: $("#itinType").val(),
		startDate: dateFormat($("#startDate").val()),
		endDate: dateFormat($("#endDate").val()),
		userID: sessionStorage.getItem("userID"),
	};
	// date receives in MM-DD-YYYY -> YYYY-MM-DD
	var data = JSON.stringify(itinerary);
	let url = "../../php/objects/itinCreate.php";
	ajaxCall(url, console.log, "POST", data);
	url = "../../php/objects/userItinRetrieve.php";
	var get_userID = 2;
	// var get_userID = sessionStorage.getItem("userID");
	ajaxCall(url, display_itin_cards, "POST", { userID: get_userID });
	location.reload();
}

//Capitalize card itineraryType for consistency
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

//Date formatting
function dateFormat(date) {
	// console.log(date);
	let date_array = date.split("/");
	let new_date = [date_array[2], date_array[0], date_array[1]];
	return new_date.join("-");
}
