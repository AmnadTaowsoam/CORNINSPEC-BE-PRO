import pandas as pd
import psycopg2
from psycopg2 import extras
from config import settings
import logging

# Initialize your logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_connection():
    try:
        conn = psycopg2.connect(
            host=settings.predict_db_host,
            port=settings.predict_connect_db_port,
            dbname=settings.predict_db_name,
            user=settings.predict_db_username,
            password=settings.predict_db_password
        )
        return conn
    except psycopg2.Error as e:
        logger.error(f"Error connecting to PostgreSQL database: {e}")
        return None

def insert_into_batch_info(df):
    conn = create_connection()
    if conn is not None:
        with conn.cursor() as cursor:
            try:
                # Generate SQL for batch insertion
                columns = df.columns.tolist()
                values = [tuple(x) for x in df.to_numpy()]
                insert_query = f"INSERT INTO prediction.batch_info({','.join(columns)}) VALUES %s"
                extras.execute_values(cursor, insert_query, values)
                conn.commit()
                logger.info("Data inserted into batch_info successfully.")
            except psycopg2.Error as e:
                conn.rollback()
                logger.error(f"Failed to insert into batch_info: {e}")
            finally:
                cursor.close()
        conn.close()

def insert_into_result(df):
    conn = create_connection()
    if conn is not None:
        with conn.cursor() as cursor:
            try:
                columns = df.columns.tolist()
                values = [tuple(x) for x in df.to_numpy()]
                insert_query = f"INSERT INTO prediction.result({','.join(columns)}) VALUES %s"
                extras.execute_values(cursor, insert_query, values)
                conn.commit()
                logger.info("Data inserted into result successfully.")
            except psycopg2.Error as e:
                conn.rollback()
                logger.error(f"Failed to insert into result: {e}")
            finally:
                cursor.close()
        conn.close()

def insert_into_interface(df):
    conn = create_connection()
    if conn is not None:
        with conn.cursor() as cursor:
            try:
                columns = df.columns.tolist()
                values = [tuple(x) for x in df.to_numpy()]
                insert_query = f"INSERT INTO prediction.interface({','.join(columns)}) VALUES %s"
                extras.execute_values(cursor, insert_query, values)
                conn.commit()
                logger.info("Data inserted into interface successfully.")
            except psycopg2.Error as e:
                conn.rollback()
                logger.error(f"Failed to insert into interface: {e}")
            finally:
                cursor.close()
        conn.close()

def fetch_all_data(table_name):
    conn = create_connection()  # Assuming create_connection() is already defined
    if conn is not None:
        try:
            sql_query = f"SELECT * FROM {table_name}"
            data = pd.read_sql(sql_query, conn)
            logger.info(f"Data fetched from {table_name} successfully.")
            return data
        except psycopg2.Error as e:
            logger.error(f"Failed to fetch data from {table_name}: {e}")
            return None
        finally:
            conn.close()
    else:
        logger.error("Connection to database failed.")
        return None

def get_all_batch_info():
    return fetch_all_data("prediction.batch_info")

def get_all_results():
    return fetch_all_data("prediction.result")

def get_all_interfaces():
    return fetch_all_data("prediction.interface")