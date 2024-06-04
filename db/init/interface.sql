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
CREATE TABLE interface.tokens (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    cookies TEXT NOT NULL,
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
    phys0003 VARCHAR(50),
    phys0004 VARCHAR(50),
    phys0005 VARCHAR(50),
    phys0006 VARCHAR(50),
    phys0007 VARCHAR(50),
    phys0008 VARCHAR(50),
    phys0009 VARCHAR(50),
    status VARCHAR(10),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup on request_ref in inspections table
CREATE INDEX IF NOT EXISTS idx_inspections_request_ref ON interface.inspections(request_ref);

-- Index for quick lookup on request_ref in status_results table
CREATE INDEX IF NOT EXISTS idx_status_results_request_ref ON interface.status_results(request_ref);
