CREATE SCHEMA IF NOT EXISTS status;

CREATE TABLE IF NOT EXISTS status.status_results (
    id SERIAL PRIMARY KEY,
    status VARCHAR(10) NOT NULL,
    request_ref UUID NOT NULL,
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


