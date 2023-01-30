
from PIL import Image
import cv2
import sys
import copy

from lib.model import (
    load_model,
    get_predicted_segmentation_mask
)
from lib.utils import (
    cvtColor,
    rotate_image,
    display_image,
    remove_image_color,
    RGBColor
)


def get_level(model, image, DEBUG: bool):
    image = cvtColor(image)
    old_img = copy.deepcopy(image)

    if DEBUG:
        display_image(image)

    # Get predicted segmentaion mask
    seg_mask = get_predicted_segmentation_mask(image, model)
    seg_image = Image.fromarray(seg_mask)
    image = Image.blend(old_img, seg_image, 0.7)

    if DEBUG:
        display_image(image)

    # process level
    level_img = remove_image_color(seg_mask, RGBColor.RED)
    gray = cv2.cvtColor(level_img, cv2.COLOR_RGB2GRAY)
    gray_inverted = cv2.bitwise_not(gray)
    thresh = cv2.threshold(gray_inverted, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    if DEBUG:
        display_image(Image.fromarray(thresh))

    # merge contours
    thresh_merged = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25,25)), iterations=10)

    if DEBUG:
        display_image(Image.fromarray(thresh_merged))

    # Find Contours 
    countours,hierarchy=cv2.findContours(thresh_merged,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)

    if (len(countours) > 1 or len(countours) == 0):
        print("Error merging contours", countours)
        raise Exception("Error merging contours")

    # rotate image
    rect = cv2.minAreaRect(countours[0])
    rotation_angle = 270 + rect[2]
    rotated_level_img = rotate_image(thresh_merged, rotation_angle)
    x_level,y_level,w_level,h_level = cv2.boundingRect(rotated_level_img)

    if DEBUG:
        cv2.rectangle(rotated_level_img, (x_level, y_level), (x_level + w_level, y_level + h_level), (255,255,12), 2)
        display_image(Image.fromarray(rotated_level_img))

    # get bounding box for float
    combined_img = copy.deepcopy(seg_mask)
    rotated_combined_img = rotate_image(combined_img, rotation_angle)
    float_img = remove_image_color(rotated_combined_img, RGBColor.GREEN)

    gray = cv2.cvtColor(float_img, cv2.COLOR_RGB2GRAY)
    gray2 = cv2.bitwise_not(gray)
    thresh = cv2.threshold(gray2, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    # Find bounding box
    x_float,y_float,w_float,h_float = cv2.boundingRect(thresh)

    # Draw level and float bound boxes
    cv2.rectangle(rotated_combined_img, (x_float, y_float), (x_float + w_float, y_float + h_float), (36,255,12), 2)
    cv2.rectangle(rotated_combined_img, (x_level, y_level), (x_level + w_level, y_level + h_level), (255,255,12), 2)

    # Get level postion percentage
    print(x_level,y_level,w_level,h_level)
    print(x_float,y_float,w_float,h_float)

    level_length = h_level - y_level
    float_center = (x_float+w_float//2, y_float+h_float//2)
    print("float center", float_center)
    level_pct = 100.0 - (float((float_center[1] - y_level) / level_length) * 100.0)
    print("float pct", level_pct, (float_center[1] - y_level), level_length)
    cv2.putText(rotated_combined_img, "level_len={},float_pos={},fill_pct={}%".format(level_length,(float_center[1] - y_level), str(round(level_pct, 2))), (10,y_level + h_level+20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (36,255,12), 2)

    float_image = Image.fromarray(rotated_combined_img)
    
    if DEBUG:
        display_image(float_image)

    return level_pct


if __name__ == "__main__":
    DEBUG = True
    model = load_model('models/model2.h5')
    image = Image.open('wellcam.jpg')
    get_level(model, image, DEBUG)
