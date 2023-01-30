from flask import Flask
from PIL import Image
from inference import get_level
from lib.model import load_model


app = Flask(__name__)

MODELPATH='./models/model2.h5'
model = load_model(MODELPATH)

@app.route('/get_level', methods=['POST'])
def get_drywell_level():
    image = Image.open('wellcam.jpg')
    level = get_level(model, image, False)
    print(level)
    return f'{level}', 204