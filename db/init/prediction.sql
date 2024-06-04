CREATE SCHEMA IF NOT EXISTS prediction;

-- Batch Information Table
CREATE TABLE IF NOT EXISTS prediction.batch_info (
    id SERIAL,
    inslot TEXT NOT NULL,
    material TEXT NOT NULL,
    batch TEXT NOT NULL,
    plant TEXT NOT NULL,
    operationno TEXT NOT NULL,
    sampleWeight NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (inslot, material, batch, plant, operationno)
);

-- Results Table
CREATE TABLE IF NOT EXISTS prediction.result (
    id SERIAL PRIMARY KEY,
    inslot TEXT NOT NULL,
    material TEXT NOT NULL,
    batch TEXT NOT NULL,
    plant TEXT NOT NULL,
    operationno TEXT NOT NULL,
    sampleWeight NUMERIC NOT NULL,
    FOREIGN KEY (inslot, material, batch, plant, operationno) REFERENCES prediction.batch_info(inslot, material, batch, plant, operationno),
    c1c INT,
    c2c INT,
    c3c INT,
    c4c INT,
    c5c INT,
    c6c INT,
    c7c INT,
    c36c INT,
    c37c INT,
    c38c INT,
    c39c INT,
    c40c INT,
    total_count INT,
    c1w NUMERIC,
    c2w NUMERIC,
    c3w NUMERIC,
    c4w NUMERIC,
    c5w NUMERIC,
    c6w NUMERIC,
    c7w NUMERIC,
    c36w NUMERIC,
    c37w NUMERIC,
    c38w NUMERIC,
    c39w NUMERIC,
    c40w NUMERIC,
    total_weight NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_result_inslot_material_batch_plant_operationno ON prediction.result (inslot, material, batch, plant, operationno);

-- Interface Table
CREATE TABLE IF NOT EXISTS prediction.interface (
    id SERIAL PRIMARY KEY,
    inslot TEXT NOT NULL,
    material TEXT NOT NULL,
    batch TEXT NOT NULL,
    plant TEXT NOT NULL,
    operationno TEXT NOT NULL,
    sampleWeight NUMERIC NOT NULL,
    FOREIGN KEY (inslot, material, batch, plant, operationno) REFERENCES prediction.batch_info(inslot, material, batch, plant, operationno),
    phys0003 NUMERIC,
    phys0004 NUMERIC,
    phys0005 NUMERIC,
    phys0006 NUMERIC DEFAULT 0,
    phys0007 NUMERIC,
    phys0008 NUMERIC,
    phys0009 NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_interface_inslot_material_batch_plant_operationno ON prediction.interface (inslot, material, batch, plant, operationno);
