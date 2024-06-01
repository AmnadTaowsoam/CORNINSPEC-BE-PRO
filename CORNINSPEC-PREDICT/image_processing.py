import os
from ultralytics import YOLO
import joblib
import cv2
import numpy as np
import pandas as pd
import logging
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load YOLO and other models once at the start
det_model = YOLO(settings.det_model_path)
cls_model = YOLO(settings.cls_model_path)
reg_model = joblib.load(settings.reg_model_path)

def compute_min_area_rect_area(x1, y1, x2, y2):
    """
    Computes the minimum area rectangle for given coordinates.
    """
    contour = np.array([[x1, y1], [x1, y2], [x2, y2], [x2, y1]])
    rect = cv2.minAreaRect(contour)
    width, height = rect[1]
    return width * height

def predict_image(image_data, sampleWeight):
    total_weight = 0
    seed_weight_bias = 0
    try:
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        logger.info("Image decoded and resized successfully")

        results = det_model.predict(image, verbose=False, conf=0.5 ,max_det=1000)
        logger.info(f"Detection results: {results}")

        output_data = []
        boxes = results[0].boxes.data.cpu().numpy()
        seed_count = len(boxes)
        logger.info(f"seed_count: {seed_count}")

        if seed_count == 0:
            logger.info("No seeds detected")
            return []

        for box in boxes:
            x1, y1, x2, y2 = map(int, box[:4])
            cropped_image = image[y1:y2, x1:x2]
            logger.info(f"Processing bounding box: {(x1, y1, x2, y2)}")

            cls_result = cls_model.predict(cropped_image, save=False, conf=0.90)
            # logger.info(f"Classification results: {cls_result}")

            if cls_result:
                result = cls_result[0]
                max_index = result.probs.top1
                max_conf = result.probs.top1conf.item()
                max_conf_class = result.names[max_index]
                input_df = pd.DataFrame({
                    'max_conf_class': [int(max_conf_class)],
                    'cls_seed_count': [seed_count],
                    'cls_seed_avg_area': [compute_min_area_rect_area(x1, y1, x2, y2)],
                    'sample_weight': [sampleWeight]
                })
                seed_weight = reg_model.predict(input_df)
                weight = seed_weight[0]
                seed_weight_bias = sampleWeight / seed_count
                weight = (seed_weight_bias - weight) + weight
                total_weight += weight

                output_data.append({
                    "bounding_box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                    "class": max_conf_class,
                    "confidence": max_conf,
                    "weight": weight
                })
        
        logger.info(f"Total weight of seeds after predict: {round(total_weight, 2)}")
        return output_data

    except Exception as e:
        logger.error(f"Error in predict_image: {e}")
        raise
