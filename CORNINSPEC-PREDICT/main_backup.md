import os
from fastapi import FastAPI, Form, HTTPException, UploadFile, File, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from dotenv import load_dotenv
import uvicorn
import logging
import json
import pandas as pd

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from auth import router as auth_router
from image_processing import predict_image
from data_predict_processing import PredictResultProcessor
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(auth_router)

def predict_result_processing(output_data,interface_data,sampleWeight):
    predict_processor = PredictResultProcessor()
    try:
        pridiction_data = predict_processor.predict_result_df(output_data,interface_data, sampleWeight)
        logging.info('Prediction data processed.')

        interface_data = predict_processor.predict_result_interface(pridiction_data)
        logging.info('Interface data processed.')

        predict_processor.insert_into_data(pridiction_data,interface_data)
        logging.info('Data update to database completed.')
    except Exception as e:
        logger.error(f"Error reading image file: {e}")

@app.post("/predict", status_code=200)
async def upload_image(request: Request, information: str = Form(...), image_file: UploadFile = File(...)):
    logger.info("Received request on /predict endpoint")
    
    if not information:
        logger.error("No information provided in the form data.")
        return JSONResponse(content={'error': 'No information provided'}, status_code=400)

    try:
        info_dict = json.loads(information)
        logger.info("Parsed information from form data successfully.")
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing information from form data: {e}")
        return JSONResponse(content={'error': 'Invalid information format'}, status_code=400)

    try:
        sampleWeight = info_dict['weight']
        logger.info(f"Parsed sample_weight: {sampleWeight}")
    except KeyError as e:
        logger.error(f"Missing key in information data: {e}")
        return JSONResponse(content={'error': f'Missing key in information: {e}'}, status_code=400)
    
    # Extracting interfaceData from the provided information
    interface_data = {key: info_dict[key] for key in info_dict if key != 'weight'}
    logger.info(f"Parsed queue_information: {interface_data}")
    
    try:
        image_data = await image_file.read()
        logger.info(f"Received image file: {image_file.filename}, size: {len(image_data)} bytes")
    except Exception as e:
        logger.error(f"Error reading image file: {e}")
        return JSONResponse(content={'error': 'Error reading image file'}, status_code=500)
    
    try:
        output_data = predict_image(image_data, sampleWeight)
        predict_result_processing(output_data,interface_data,sampleWeight)
        logger.info("Image processed successfully.")
        return JSONResponse(content={"output_data": output_data}, status_code=200)
    except Exception as e:
        logger.error(f"Unexpected error during image processing: {e}")
        return JSONResponse(content={'error': 'Internal server error during image processing'}, status_code=500)

if __name__ == '__main__':
    uvicorn.run(app, host=settings.backend_host, port=settings.backend_port)
