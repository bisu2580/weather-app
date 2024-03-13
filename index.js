import getKey from "./creds.js"
const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[data-searchWeather]")
const userContainer = document.querySelector(".weather-container")
const grantAccessContainer = document.querySelector(".grant-location-container")
const grantAccessButton = document.querySelector("[data-grantAccess]")
const searchForm = document.querySelector("[data-searchForm]")
const searchInput = document.querySelector("[data-searchInput]")
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".user-info-container")
const errorContainer = document.querySelector("[data-errorPage]")
const errorMessage = document.querySelector("[data-errorMessage]")

let currTab = userTab
currTab.classList.add("current-tab")
getFromSessionStorage()

function switchTab(clickedTab) {
	if (currTab === clickedTab) return
	else {
		currTab.classList.remove("current-tab")
		currTab = clickedTab
		currTab.classList.add("current-tab")
		if (!searchForm.classList.contains("active")) {
			userInfoContainer.classList.remove("active")
			grantAccessContainer.classList.remove("active")
			errorContainer.classList.remove("active")
			searchForm.classList.add("active")
		} else {
			searchForm.classList.remove("active")
			userInfoContainer.classList.remove("active")
			errorContainer.classList.remove("active")
			getFromSessionStorage()
		}
	}
}
function getFromSessionStorage() {
	const localCoordinates = sessionStorage.getItem("user-coordinates")
	if (!localCoordinates) {
		grantAccessContainer.classList.add("active")
	} else {
		const coordinates = JSON.parse(localCoordinates)
		fetchUserWeatherInfo(coordinates)
	}
}
async function fetchUserWeatherInfo(coordinates) {
	const { lat, lon } = coordinates
	grantAccessContainer.classList.remove("active")
	loadingScreen.classList.add("active")
	errorContainer.classList.remove("active")
	try {
		const res = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${getKey()}`
		)
		const data = await res.json()
		if (data.cod == "401") {
			throw new Error("Error! Unable to fetch your location")
		} else {
			loadingScreen.classList.remove("active")
			userInfoContainer.classList.add("active")
			renderWeatherInfo(data)
		}
		console.log(data)
	} catch (err) {
		errorMessage.textContent = err.message
		loadingScreen.classList.remove("active")
		errorContainer.classList.add("active")
		userInfoContainer.classList.remove("active")
	}
}
function renderWeatherInfo(data) {
	const cityName = document.querySelector("[data-cityname]")
	const countryIcon = document.querySelector("[data-countryIcon]")
	const desc = document.querySelector("[data-weatherDesc]")
	const weatherIcon = document.querySelector("[data-weatherIcon]")
	const temperature = document.querySelector("[data-temp]")
	const windSpeed = document.querySelector("[data-windspeed]")
	const humidity = document.querySelector("[data-humidity]")
	const cloudiness = document.querySelector("[data-cloud]")
	cityName.innerText = data?.name
	countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`
	desc.innerText = data?.weather?.[0]?.description
	weatherIcon.src = `https://openweathermap.org/img/wn/${data?.weather?.[0]?.icon}.png`
	const temperatureInKelvin = data?.main?.temp
	temperature.innerText = `${(temperatureInKelvin - 273).toFixed(2)}°C`
	windSpeed.innerText = `${data?.wind?.speed} m/s`
	humidity.innerText = `${data?.main?.humidity} %`
	cloudiness.innerText = `${data?.clouds?.all} %`
}
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition)
	} else {
		alert("Geolocation is not supported by this browser.")
	}
}
function showPosition(position) {
	const userCoordinates = {
		lat: position.coords.latitude,
		lon: position.coords.longitude,
	}
	sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates))
	fetchUserWeatherInfo(userCoordinates)
}

userTab.addEventListener("click", () => {
	switchTab(userTab)
})
searchTab.addEventListener("click", () => {
	switchTab(searchTab)
})
grantAccessButton.addEventListener("click", () => {
	getLocation()
})
searchForm.addEventListener("submit", (e) => {
	e.preventDefault()
	loadingScreen.classList.add("active")
	if (searchInput.value === "") {
		errorMessage.textContent = "Please Enter a city"
		loadingScreen.classList.remove("active")
		errorContainer.classList.add("active")
		userInfoContainer.classList.remove("active")
	} else fetchSearchWeatherInfo(searchInput.value)
})
async function fetchSearchWeatherInfo(city) {
	loadingScreen.classList.add("active")
	userInfoContainer.classList.remove("active")
	grantAccessContainer.classList.remove("active")
	errorContainer.classList.remove("active")
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${getKey()}`
		)
		const data = await response.json()
		// console.log(data)
		if (data.cod === "404") {
			throw new Error("Error! Unable to find the city you entered...")
		} else {
			loadingScreen.classList.remove("active")
			userInfoContainer.classList.add("active")
			renderWeatherInfo(data)
		}
	} catch (err) {
		errorMessage.textContent = err.message
		loadingScreen.classList.remove("active")
		errorContainer.classList.add("active")
		userInfoContainer.classList.remove("active")
	}
}
