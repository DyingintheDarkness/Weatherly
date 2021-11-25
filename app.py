from flask import Flask, request, render_template, abort
from timezonefinder import TimezoneFinder
import pytz
import json
import datetime
import requests
from icons import icons

# get api key from openweathermap.org
api_key = ""
app = Flask(__name__)


today = datetime.datetime.today().date()
tf = TimezoneFinder()
main = {}


@app.route('/', methods=["POST", "GET"])
def homepage():
    if request.method == "POST":
        # getting location data from request
        location_data = json.loads(request.data.decode("UTF-8"))
        if "search" in location_data and location_data["search"]:
            url = f"https://api.openweathermap.org/data/2.5/forecast?q={location_data['location']}&units=metric&appid={api_key}"
        else:
            url = f"https://api.openweathermap.org/data/2.5/forecast?lat={location_data['latitude']}&lon={location_data['longitude']}&units=metric&appid={api_key}"
        req = requests.get(url)
        data = json.loads(req.content.decode("utf-8"))
        if req.status_code == 404:
            return abort(404)
        time = int(datetime.datetime.now(pytz.timezone(tf.timezone_at(
            lng=data["city"]["coord"]["lon"], lat=data["city"]["coord"]["lat"]))).strftime("%H"))
        night = False
        if 23 >= time >= 18 or time == 0:
            night = True
        add = "night" if night else ""
        for i in range(len(data["list"])):
            date, time = data["list"][i]["dt_txt"].split(" ")

            # checking for today's weather from data
            if date == str(today) and time.split(":")[0] == datetime.datetime.now().strftime("%H") or i == 0 and date == str(today):
                desc = data["list"][i]["weather"][0]["description"].lower().replace(
                    " ", "")
                weather = data["list"][i]["weather"][0]["main"].lower()
                icon = icons[weather + add] or icons[desc + add]
                main[date] = {"icon": icon["icon"], "bg": icon["bg"], "temperature": data["list"][i]["main"]["temp"], "pressure": data["list"]
                              [i]["main"]["pressure"], "humidity": data["list"][i]["main"]["humidity"], "wind": data["list"][i]["wind"]["speed"]}
            else:
                y, m, d = str(date).split("-")
                future = datetime.date(int(y), int(m), int(d))
                delta = future - today
                if date not in main and delta.days in [1, 2, 3, 4, 5]:
                    desc = data["list"][i]["weather"][0]["description"].lower().replace(
                        " ", "")
                    weather = data["list"][i]["weather"][0]["main"].lower()
                    icon = icons[weather + add] or icons[desc + add]

                    main[date] = {"icon": icon["icon"], "bg": icon["bg"], "temperature": data["list"][i]["main"]["temp"], "pressure": data["list"]
                                  [i]["main"]["pressure"], "humidity": data["list"][i]["main"]["humidity"], "wind": data["list"][i]["wind"]["speed"]}

        main["city"] = {"name": data["city"]["name"],
                        "country": pytz.country_names[data["city"]["country"]]}
        return main
    return render_template("index.html")

@app.errorhandler(404)
def page_not_found(e):
    return """<h2 style='font-family: "Sansation;", sans-serif'>404 Page Not Found</h2>"""

app.run(debug=True)
