const city = document.getElementById("name")
const html = document.getElementsByTagName("html")[0]
const weather = document.getElementById("weather")
const date_today = document.getElementById("date-today")
const date = document.getElementById("date")
const time = document.getElementById("time")
const country = document.getElementById("country")
const temp = document.getElementsByClassName("temp-text")
const icon = document.getElementsByClassName("icon")
const pressure = document.getElementById("pressure")
const humidity = document.getElementById("humidity")
const wind = document.getElementById("wind")
const next = document.getElementById("next")
const previous = document.getElementById("previous")
const forecast = document.querySelector(".forecast > ul")
const divs = document.querySelectorAll(".weather")
const search_container = document.querySelectorAll(".search-container")

let data;
let j = 0;
let today = new Date().toLocaleDateString()
today = `${today.split("/")[2]}-${today.split("/")[0]}-${today.split("/")[1]}`
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


// sending location data to backend
const sendLocationData = async (location) => {
  if (localStorage.getItem("location")) {
    data = await fetch("/", {
      method: "POST",
      body: JSON.stringify({ "search": true, location: localStorage.getItem("location") })
    }).then(res => {
      return res.json()
    }).catch(() => { })
    if (data) {
      setData(data)
    }
  } else {
    const latitude = location.coords.latitude
    const longitude = location.coords.longitude
    data = await fetch("/", {
      method: "POST",
      body: JSON.stringify({ latitude, longitude })
    }).then(res => {
      return res.json()
    }).catch(() => {

    })
    if (data) {
      setData(data)
    }
  }
}

let add;
// adding data to screen
const setData = (data) => {
  const day = new Date()
  const datetext = `${day.getUTCDate()}'${monthNames[day.getMonth()]} ${day.getFullYear()}`
  const timetext = `${(day.getHours() % 12) || 12}:${day.getMinutes()}`
  j = 0
  localStorage.setItem("location", data.city.name)
  document.getElementsByTagName("body")[0].className = ""
  city.innerText = data.city.name
  time.innerText = timetext
  country.innerText = data.city.country
  html.className = ""
  html.classList.add(data[today]["bg"])
  date_today.innerText = datetext
  date.innerText = today
  icon[0].innerHTML = data[today].icon
  temp[0].innerText = Math.floor(data[today].temperature)
  temp[1].innerText = data[today].temperature
  pressure.innerText = data[today].pressure
  humidity.innerText = data[today].humidity
  wind.innerText = data[today].wind
  let [y, m, d] = today.split("-")
  forecast.innerHTML = ""
  for (let i = 0; i <= Object.keys(data).length - 1; i++) {
    let current_date = `${y}-${m}-${parseInt(d) + i}`
    let current_temp = Math.floor(data[current_date].temperature)
    let current_pressure = data[current_date].pressure
    let current_humidity = data[current_date].humidity
    let current_wind = data[current_date].wind
    let current_icon = data[current_date].icon



    forecast.innerHTML += `
    <li onclick="changeData('${current_date}', '${current_temp}','${current_humidity}','${current_pressure}','${current_wind}')">
    <h1>${current_date}</h1>
    <h1>${current_temp}&deg;C</h1>
    <div>
      <i>
        ${current_icon}
    </i>
  </div>
</li>
    `
  }
}


if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(sendLocationData)
  if (localStorage.getItem("location")) {
    sendLocationData()
  } else {
    document.getElementsByTagName("body")[0].innerHTML = ""
    document.getElementsByTagName("body")[0].innerHTML = `
    <header><h1>Weatherly</h1></header>
<div class="disabled-container">
<p>Please Turn On Your Location or Enter <br/>a Location To Get It’s Weather Forecast</p>
<form class="search-container alt-2-search" id="alt-2-search">
<input type="text" placeholder="Enter Location..." />
<button>
<span><i class="bx bx-search"></i></span>
</button>
</form>
</div>
    `
    document.getElementById("alt-2-search").addEventListener("submit", async (e) => {
      e.preventDefault()
      let value = document.querySelector("#alt-2-search > input").value
      data = await fetch("/", {
        method: "POST",
        body: JSON.stringify({ search: true, location: value })
      }).then(res => {
        return res.json()
      })
      if (data) {
        localStorage.setItem("location", value)
        document.querySelector(".disabled-container > p").innerText = "Please Refresh To Update Your Location"
        sendLocationData()
      }
    })
  }


  // switching between weather forecasts
  next.addEventListener("click", () => {
    let max = 5
    if (j < max) {
      j += 1
      let [y, m, d] = today.split("-")
      let newdate = `${y}-${m}-${parseInt(d) + j}`
      html.className = ""
      html.classList.add(data[newdate]["bg"])
      icon[0].innerHTML = data[newdate].icon
      temp[0].innerText = Math.floor(data[newdate].temperature)
      temp[1].innerText = data[newdate].temperature
      pressure.innerText = data[newdate].pressure
      humidity.innerText = data[newdate].humidity
      wind.innerText = data[newdate].wind
      date.innerText = newdate
      previous.style.opacity = "1"
    } else {
      next.style.opacity = "50%"
    }
  })
  previous.addEventListener("click", () => {
    let [y, m, d] = today.split("-")
    if (j >= 1) {
      j -= 1
      let newdate = `${y}-${m}-${parseInt(d) + j}`
      date.innerText = newdate
      html.className = ""
      html.classList.add(data[newdate]["bg"])
      icon[0].innerHTML = data[newdate].icon
      temp[0].innerText = Math.floor(data[newdate].temperature)
      temp[1].innerText = data[newdate].temperature
      pressure.innerText = data[newdate].pressure
      humidity.innerText = data[newdate].humidity
      wind.innerText = data[newdate].wind
      next.style.opacity = "1"
    } else {
      previous.style.opacity = "50%"
    }
  })
}

// changing current weather data
const changeData = (current_date, current_temp, current_humidity, current_pressure, current_wind) => {
  html.className = ""
  html.classList.add(data[current_date]["bg"])
  date.innerText = current_date
  temp.innerText = current_temp
  pressure.innerText = current_pressure
  humidity.innerText = current_humidity
  wind.innerText = current_wind
}


// updating weather forecast location
search_container.forEach(form => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    let value = document.querySelector(`#${e.target.id} > input`).value
    data = await fetch("/", {
      method: "POST",
      body: JSON.stringify({ search: true, location: value })
    }).then(res => {
      return res.json()
    })
    if (data) {
      localStorage.setItem("location", value)
      setData(data)
    }
  })
})
