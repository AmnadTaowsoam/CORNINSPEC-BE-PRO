-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS interface;

-- Create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing interface requests
CREATE TABLE IF NOT EXISTS interface.interface_requests (
    id SERIAL PRIMARY KEY,
    inslot VARCHAR(50),
    batch VARCHAR(50),
    material VARCHAR(50),
    plant VARCHAR(50),
    operationno VARCHAR(50),
    request_ref UUID DEFAULT uuid_generate_v4() UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing tokens
CREATE TABLE IF NOT EXISTS interface.tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing samples
CREATE TABLE IF NOT EXISTS interface.samples (
    id SERIAL PRIMARY KEY,
    request_ref UUID UNIQUE REFERENCES interface.interface_requests(request_ref),
    insp_lot VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    sample_no VARCHAR(50),
    status VARCHAR(10),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup on request_ref in samples table
CREATE INDEX IF NOT EXISTS idx_samples_request_ref ON interface.samples(request_ref);

-- Table for storing inspection results
CREATE TABLE IF NOT EXISTS interface.inspections (
    id SERIAL PRIMARY KEY,
    request_ref UUID REFERENCES interface.samples(request_ref),
    insp_lot VARCHAR(50) NOT NULL,
    plant VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    sample_no VARCHAR(50),
    phys003 VARCHAR(50),
    phys004 VARCHAR(50),
    phys005 VARCHAR(50),
    phys006 VARCHAR(50),
    phys007 VARCHAR(50),
    phys008 VARCHAR(50),
    phys009 VARCHAR(50),
    status VARCHAR(10),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup on request_ref in inspections table
CREATE INDEX IF NOT EXISTS idx_inspections_request_ref ON interface.inspections(request_ref);

-- Table for storing status results
CREATE TABLE IF NOT EXISTS interface.status_results (
    id SERIAL PRIMARY KEY,
    status VARCHAR(10) NOT NULL,
    request_ref UUID REFERENCES interface.samples(request_ref),
    insp_lot VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    sample_no VARCHAR(50),
    userc1 VARCHAR(50),
    userc2 VARCHAR(50),
    usern1 VARCHAR(50),
    usern2 VARCHAR(50),
    userd1 VARCHAR(50),
    usert1 VARCHAR(50),
    equipment VARCHAR(50),
    funct_loc VARCHAR(50),
    msg TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup on request_ref in status_results table
CREATE INDEX IF NOT EXISTS idx_status_results_request_ref ON interface.status_results(request_ref);
