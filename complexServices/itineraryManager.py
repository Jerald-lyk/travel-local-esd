from flask import Flask, request, jsonify
from flask_cors import CORS

import os, sys

import requests
from invokes import invoke_http
from datetime import datetime

# import amqp_setup
import pika
import json

app = Flask(__name__)
CORS(app)

itinerary_URL = "http://localhost:5000/"
recommendation_URL = "http://localhost:5002/recommend/"
poiManager_URL = "http://localhost:5100/search/"
STB_API_key = "i9IigYi6bl70KMqOcpewpzHHQ2NanEqx"
DATASET = "accommodation,attractions,event,food_beverages,shops,venue,walking_trail"
stb_base_URL = "https://tih-api.stb.gov.sg/content/v1/"
CATEGORY = {
    "Attractions": "attractions",
    "Malls & Shops": "shops",
    "Venues": "venue",
    "Food & Beverages": "food-beverages",
    "Accommodation": "accommodation",
    "All": "all",
    "Walking Trail": "walking_trail",
    "Events": "event"
}

@app.route("/itr/createITR", methods= ["POST"])
def create_itinerary():
    if request.is_json:
        try:
            itinerary = request.get_json()
            itr_url = itinerary_URL + "itinerary"
            # print("\nReceived an hidden_gem in JSON:", hidden_gem)
            creation_result = invoke_http(itr_url,method='POST', json = itinerary)
            # print('creation_result:', creation_result)
            if creation_result["code"] not in range(200,300):
                return jsonify(creation_result), creation_result["code"]
            else:
                theme = creation_result["data"]["theme"]

                reco_url = recommendation_URL + theme

                reco_results = invoke_http(reco_url)

                return jsonify({
                    "code": 200,
                    "data": {
                        "itrDetails": creation_result["data"],
                        "recoDetails": reco_results["data"]
                    }
                })
            
        except Exception as e:
            pass  # do nothing.

    # if reached here, not a JSON request.
    return jsonify({
        "code": 400,
        "message": "Invalid JSON input: " + str(request.get_data())
    }), 400


@app.route("/itr/addEvent", methods=['POST'])
def add_event():
    if request.is_json:
        try:
            itinerary = request.get_json()
            itr_url = itinerary_URL + "event"
            # print("\nReceived an hidden_gem in JSON:", hidden_gem)
            creation_result = invoke_http(itr_url,method='POST', json = itinerary)
            # print('creation_result:', creation_result)
            return jsonify(creation_result), creation_result["code"]
            
        except Exception as e:
            pass  # do nothing.

    # if reached here, not a JSON request.
    return jsonify({
        "code": 400,
        "message": "Invalid JSON input: " + str(request.get_data())
    }), 400


@app.route("/itr/allEvents/<int:itineraryID>")
def getAllEventsInItinerary(itineraryID):
    final_itinerary_URL = itinerary_URL +"event/" + str(itineraryID)

    event_results = invoke_http(final_itinerary_URL)
    code = event_results["code"]

    if code in range(200,300):
        dataList = event_results["data"]
        result = []
        for data in dataList:
            temp = data
            url = poiManager_URL + data["locType"] +"/"+data["poiUUID"] +"/" + data["locCategory"]
            event_details = invoke_http(url)
            temp["POIDetails"] = event_details['data']
            
            result.append(temp)
        
        return jsonify({
            "code": 200,
            "data": result
        })
    else:
        return jsonify(event_results), code

@app.route("/itr/allITR/<int:userID>")
def getAllItinerary(userID):
    itr_url = itinerary_URL + "itinerary/all/"+str(userID)
    itinerary_result = invoke_http(itr_url)
    return jsonify(itinerary_result), itinerary_result["code"]



# Execute this program if it is run as a main script (not by 'import')
if __name__ == "__main__":
    print("This is flask " + os.path.basename(__file__) + " for placing an order...")
    app.run(host="0.0.0.0", port=5200, debug=True)