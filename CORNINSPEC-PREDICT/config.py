from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    predict_service_host: str
    predict_service_port: int
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    det_model_path: str
    cls_model_path: str
    reg_model_path: str
    allowed_origins: str
    api_key: str
    api_secret: str

    # Correct type annotations for database configuration
    predict_db_name: str
    predict_db_username: str
    predict_db_password: str
    predict_db_host: str
    predict_db_localhost: str
    predict_db_port: int
    predict_connect_db_port: int

    # Additional configurations for other databases and services
    users_db_name: str
    users_db_username: str
    users_db_password: str
    users_db_host: str
    users_db_port: int

    interface_db_name: str
    interface_db_username: str
    interface_db_password: str
    interface_db_host: str
    interface_db_port: int
    interface_connect_db_port: int

    pgadmin_default_email: str
    pgadmin_default_password: str
    pgadmin_port: int

    rabbitmq_default_user: str
    rabbitmq_default_pass: str
    rabbitmq_host: str
    rabbitmq_url: str
    rabbitmq_interface_queue_name: str
    rabbitmq_interface_exchange_name: str
    rabbitmq_interface_routing_key: str

    sap_apikey: str
    sap_auth_appid: str
    sap_auth_endpoint: str
    sap_samples_appid: str
    sap_samples_endpoint: str
    sap_inspection_result_appid: str
    sap_inspection_result_endpoint: str

    user_service_port: int
    predict_result_port: int
    interface_service_port: int

    # Authentication settings
    access_token_secret: str
    refresh_token_secret: str

    class Config:
        env_file = "../.env"
        env_file_encoding = 'utf-8'

settings = Settings()
