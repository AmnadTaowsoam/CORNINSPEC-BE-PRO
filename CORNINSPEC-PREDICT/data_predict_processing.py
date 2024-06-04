import pandas as pd
from columns_master import cols_count,cols_weight,cols_batch_info,cols_result,cols_interface
from db import insert_into_batch_info, insert_into_result, insert_into_interface
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PredictResultProcessor:
    def __init__(self) -> None:
        pass

    def output_calculate (self, output_data):
        if not output_data:
            logger.error("No data provided to summarize.")
            return pd.DataFrame()
        try:
            df = pd.DataFrame(output_data)
            summary_df = df[['class', 'weight']]
            prediction_summary = summary_df.groupby('class').agg(
                count=('class', 'size'),
                total_weight=('weight', 'sum')
            ).reset_index()
            logger.info("Prediction summary created successfully.")

            if prediction_summary.empty:
                logger.error("Failed to generate prediction summary.")
                return pd.DataFrame()
            return prediction_summary
        except Exception as e:
            logger.error(f"Error processing and output_calculate: {e}")
            return pd.DataFrame()

    def output_transform(self,data):
        try:
            output_df = pd.DataFrame(data)
            # สร้าง DataFrame ใหม่ที่มีคอลัมน์ตามคลาสที่ต้องการ
            target_classes = [1, 2, 3, 4, 5, 6, 7, 36, 37, 38, 39, 40]
            columns_count = [f"c{i}c" for i in target_classes]
            columns_weight = [f"c{i}w" for i in target_classes]
            # รวม columns count และ weight ไว้ด้วยกัน
            target_columns = [val for pair in zip(columns_count, columns_weight) for val in pair]
            # สร้าง DataFrame ว่าง ที่มีคอลัมน์ตามที่ต้องการ
            df = pd.DataFrame(columns=target_columns)
            df.loc[0] = 0  # เพิ่มแถวแรกเป็น 0
            # เติมข้อมูลจาก pridiction_df เข้าไปใน result_df
            for index, row in output_df.iterrows():
                class_index = row['class']
                df[f'c{class_index}c'] = row['count']
                df[f'c{class_index}w'] = row['total_weight']
            df['total_count'] = df[columns_count].sum(axis=1)
            df['total_weight'] = df[columns_weight].sum(axis=1)
            df = df[cols_count+cols_weight]

            return df
        except Exception as e:
            logger.error(f"Error processing and output_transform: {e}")

    def infomation_map(self,data,interface_data, sampleWeight):
        try:
            interface_df = pd.DataFrame([interface_data])
            weight_df = pd.DataFrame([{'sampleWeight': sampleWeight}])
            extended_interface_df = pd.concat([interface_df] * len(data), ignore_index=True)
            extended_weight_df = pd.concat([weight_df] * len(data), ignore_index=True)
            df = pd.concat([extended_interface_df, extended_weight_df, data], axis=1)
            return df
        except Exception as e:
            logger.error(f"Error processing and infomation_map: {e}")

    def predict_result_df(self, output_data, interface_data, sampleWeight):
        try:
            output_calculate = self.output_calculate(output_data)
            if output_calculate is None or output_calculate.empty:
                logger.error("No data to proceed with after output_calculate.")
                return pd.DataFrame()

            output_df = self.output_transform(output_calculate)
            if output_df is None or output_df.empty:
                logger.error("Transformation of data failed in output_transform.")
                return pd.DataFrame()

            predict_df = self.infomation_map(output_df, interface_data, sampleWeight)
            if predict_df is None or predict_df.empty:
                logger.error("Mapping of interface data failed in infomation_map.")
                return pd.DataFrame()

            return predict_df
        except Exception as e:
            logger.error(f"Critical error in predict_result_df: {e}")
            return pd.DataFrame()
        
    def predict_result_interface(self, predict_df):
        if predict_df.empty:
            logger.info("No data provided to summarize.")
            return pd.DataFrame()  # Return an empty DataFrame if the input is empty
        try:
            # Define the mapping of physical classes to numerical class identifiers
            phys_class_mapping = {
                'goodseed': ['c1w'],
                'phys0003': ['c37w', 'c2w', 'c4w', 'c40w', 'c3w'],
                'phys0004': ['c6w'],
                'phys0005': ['c36w'],
                'phys0007': ['c38w', 'c39w'],
                'phys0008': ['c7w'],
                'phys0009': ['c5w']
            }
            # Initialize results DataFrame with unique batch information
            base_cols = ['inslot', 'operationNo', 'batch', 'material', 'plant', 'sampleWeight']
            results_df = predict_df[base_cols].drop_duplicates().reset_index(drop=True)
            
            # Iterate over physical classes and calculate weight sums and ratios
            for phys, class_weights in phys_class_mapping.items():
                # Filter required columns for summing weights
                relevant_weights = predict_df[class_weights]
                predict_df[phys] = relevant_weights.sum(axis=1)  # Sum across the relevant class weight columns
                group_sum = predict_df.groupby(base_cols)[phys].sum().reset_index(name=phys)
                
                # Merge the sums back to the results dataframe
                results_df = results_df.merge(group_sum, on=base_cols, how='left')
                results_df[phys] = results_df[phys].fillna(0) / results_df['sampleWeight'] * 100  # Normalize by sample weight

            # Add placeholder for 'phys006' if necessary
            results_df['phys0006'] = 0  # Assuming PHYS006 needs to be set to 0
            return results_df
        except Exception as e:
            logger.error(f"Error in processing the result interface: {e}")
            return pd.DataFrame()
        
    def rename_columns(self,df):
        return df.rename(columns={'operationNo': 'operationno', 'sampleWeight': 'sampleweight'})

    def insert_into_data(self, predict_df, results_df):
        # Rename columns right after dataframe acquisition
        predict_df = self.rename_columns(predict_df)
        results_df = self.rename_columns(results_df)

        try:
            # Extract data subsets
            batch_info = predict_df[cols_batch_info]
            batch_info = batch_info.round(2)
            batch_info.to_csv('batch_info.csv')

            result = predict_df[cols_result + cols_count + cols_weight]
            result = result.round(2)
            result.to_csv('result.csv')

            interface = results_df[cols_result + cols_interface]
            interface = interface.round(2)
            interface.to_csv('interface.csv')

            # Insert into databases (assumed to be defined elsewhere)
            insert_into_batch_info(batch_info)
            logger.info("batch_info update to database successfully.")
            insert_into_result(result)
            logger.info("result update to database successfully")
            insert_into_interface(interface)
            logger.info("interface update to database successfully")

            # Log operations or handle them inside respective functions if needed
            return batch_info, result, interface

        except KeyError as e:
            # Specific error for missing columns
            logger.error(f"Column error in insert_into_data: {e}")
        except Exception as e:
            # General error handling
            logger.error(f"Error in insert_into_data: {e}")


