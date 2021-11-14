from flask import Flask, request, render_template
import pytz
import json
import datetime
from flask.json import jsonify
from flask_sqlalchemy import SQLAlchemy
import requests

from data import data
api_key = ""
app = Flask(__name__)

# data = json.loads(request.data.decode("UTF-8"))
# lat = data["latitude"]
# lon = data["longitude"]
# url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=standard&appid={api_key}"
# req = requests.get(url)
# weather_data = json.loads(req.content.decode("utf-8"))
# print(weather_data)
today = datetime.datetime.today().date()
main = {}


@app.route('/', methods=["POST", "GET"])
def homepage():
    if request.method == "POST":
        for i in range(len(data["list"])):
            date, time = data["list"][i]["dt_txt"].split(" ")
            if date == str(today) and time.split(":")[0] == datetime.datetime.now().strftime("%H"):
                main["today"] = date
            elif i == 0 and date == str(today):
                main["today"] = date
            else:
                y,m,d = str(date).split("-")
                future = datetime.date(int(y),int(m),int(d))
                delta = future - today
                if delta.days in [1,2,3,4,5] and date not in main:
                    main[date] = data["list"][i]["dt_txt"]
        print(main)
        
        return "Ok"
    return render_template("index.html")


app.run(debug=True)
