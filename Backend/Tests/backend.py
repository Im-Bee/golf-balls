from flask import Flask, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

# Cache
last_generated_time = 0
last_generated_floats = []

def get_cached_floats():
    global last_generated_time, last_generated_floats

    current_time = int(time.time())

    if current_time != last_generated_time:
        last_generated_time = current_time
        last_generated_floats = [round(random.uniform(0, 1), 4) * 0.1 for _ in range(16)]

    return last_generated_floats

@app.route('/get-floats')
def get_floats():
    return jsonify(get_cached_floats())

if __name__ == '__main__':
    app.run(debug=True, port=5000)

