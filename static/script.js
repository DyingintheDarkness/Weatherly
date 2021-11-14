const city = document.getElementById("name")
const country = document.getElementById("country")
const temp = document.getElementById("temp")
const pressure = document.getElementById("pressure")
const humidity = document.getElementById("humidity")
const wind = document.getElementById("wind")



const sendLocationData = async (location) => {
  const latitude = location.coords.latitude
  const longitude = location.coords.longitude
  const data = await fetch("/", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude })
  }).then(res => {
    return res.json()
  })
  city.innerText = data.name
  country.innerText = data.country
  temp.innerText = data.temp
  pressure.innerText = data.pressure
  humidity.innerText = data.humidity
  wind.innerText = data.wind
  
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(sendLocationData);
} else {
  x.innerHTML = "Geolocation is not supported by this browser.";
}

