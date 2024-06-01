# PosgreSQL

## postgres images

    docker pull postgres

### 1.run images

    docker run --name QualityDB -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -v qualityvolume:/var/lib/postgresql/data -d --restart always postgres

### 2.inspect contrainer run

    docker exec -it QualityDB psql -U postgres
    # install
    sudo apt install postgresql-client
    psql -U postgres -h localhost

## run scripts
### 1.Create database
    psql -U postgres -d postgres -h localhost -f /home/qi/quality_project/Quality_DBService/db/migrations/001_create_databases.sql

### 2.Create table

    # <format>
    psql -U <USERNAME> -d <DATABASE> -h <HOST> -f <path/folder/xxx.sql>

    # users
    psql -U postgres -d users -h localhost -f /home/qi/quality_project/Quality_DBService/db/seeds/users.sql

    # cassava
    psql -U postgres -d cassava -h localhost -f /home/qi/quality_project/Quality_DBService/db/seeds/cassava.sql

    # corns
    psql -U postgres -d corns -h localhost -f /home/qi/quality_project/Quality_DBService/db/seeds/corns.sql

    # qscore
    psql -U postgres -d qscore -h localhost -f /home/qi/quality_project/Quality_DBService/db/seeds/qscore.sql

    # corn_moist
    psql -U postgres -d corns_moist -h localhost -f /home/qi/quality_project/Quality_DBService/db/seeds/corn_moist.sql

# Pgadmin
## run pgadmin in container

    docker run -p 8080:80 \
    -e 'PGADMIN_DEFAULT_EMAIL=user@domain.com' \
    -e 'PGADMIN_DEFAULT_PASSWORD=SuperSecret' \
    -d --restart always dpage/pgadmin4
    
# User mangement:
## 1.Regrister

    http://localhost:3000/api/users/register
    
    {
        "username": "<user>",
        "password": "<password>",
        "email": "qiadmin@qi.com",
        "roles": "user/superuser"
    }

### with machine_id

     http://localhost:3000/api/users/register-with-machine

     

## 2.login

    http://localhost:3000/api/auth/login

    {
        "username": "<user>",
        "password": "<password>"
    }

## 3

## 3.Logout

    http://localhost:3000/api/auth/logout
    header : { Content-Type:application/json}

    {
    "refreshToken": "<your-refresh-token-here>"
    }



## get user

    http://localhost:3000/api/users/exists?username=<username>

## machine config

    http://localhost:3000/api/machine-configurations

    {
        "user_id": 1,
        "machine_id": "machine123",
        "machine_ip": "192.168.1.2",
        "descriptions": "Sample machine description"
    }


# Q-Score database:
## 1.tbl:qscore and tbl:Result

    http://localhost:3000/qscore/qscores/search

savedResult บันทึกลง database

header : { Content-Type:application/json}

Request format

    {
        instlot: 'xxx1',
        batch: 'yyy1',
        plant: 'zzzz1',
        vendor: '500000593',
        material: 'P000000040',
        evaluate: 'Pass Through 100%',
        sampling: 'No Sampling'
    }

Respond format

    {
        "vendor": "<500000593>",
        "material": "<P000000038>"
    }

# Cassava Chip database:

    http://localhost:3000/cassava/predict-result

    header : { Content-Type:application/json}

Request format:
    
    {
        "inspection_lot": "1001",
        "batch": "batch01",
        "months": 6,
        "season": "C",
        "plant": "A003",
        "vendor": "VendorX",
        "region": "NE",
        "fines": 0.1,
        "bulk": 1.5,
        "sand_predict_value": 0.05,
        "total_sand_value": 0.15,
        "phys001": 0.1,
        "chem0010": 1.5,
        "chem0013": 0.15
    }

# corn moisture
## 1.moisture result

    http://localhost:3000/corn-moist/corn_moist-result

    header : { Content-Type:application/json}

    Request format:
    {
        "sensor_id": "sensor_002",
        "inslot": "slot_01",
        "batch": "batch_01",
        "plant": "plant_01",
        "vendor": "vendor_01",
        "moist_top_n": 100.00,
        "moist_top_min": 12.00,
        "moist_top_max": 15.00,
        "moist_top_avg": 13.50,
        "moist_top_mvavg": 13.00,
        "moist_top_sd": 1.00,
        "moist_bot_n": 100.00,
        "moist_bot_min": 11.00,
        "moist_bot_max": 14.50,
        "moist_bot_avg": 12.75,
        "moist_bot_mvavg": 12.50,
        "moist_bot_sd": 1.25,
        "moiscorn": 13.00
    }

# corn inspection
## 1.predict result

    http://localhost:3000/corn/predict-result

    header : { Content-Type:application/json}

Request format:
    {
        "inspection_lot": "1001",
        "batch": "batch01",
        "plant": "A003",
        "vendor": "vendorX",
        "operation": "01",
        "sample_weight": 50,
        "good_seed": 45,
        "honey_seed": 2,
        "rotten_seed": 1,
        "insect_damaged": 1,
        "corncob": 0,
        "good_cracked_seed": 1,
        "coated_seed": 0,
        "internal_fungus": 0,
        "damaged_seed": 0,
        "external_fungus": 0,
        "white_fungus": 0,
        "badly_cracked_seed": 0,
        "phys003": 0.5,
        "phys004": 0.2,
        "phys005": 0.1,
        "phys006": 0.1,
        "phys007": 0,
        "phys008": 0,
        "phys009": 0
    }


## directory

    quality_DBService/
    |-- db
    |   |--migrations/
    |       |-- 001_create_database.sql
    |   |--seeds/
    |       |--cassava.sql
    |       |--corns.sql
    |       |--qscore.sql
    |       |--users.sql
    |-- src
    |   |-- config/
    |       |--dbConfig.js
    |   |-- models/
    |       |--refreshTokenModel.js
    |       |--userModels.js
    |   |-- routes/
    |       |--authRoutes.js
    |       |--userRoutes.js
    |       |--cassavaRoutes.js
    |       |--cornsRoutes.js
    |       |--qscoreRoutes.js
    |   |-- middleware/
    |       |--authenticateToken.js
    |   |-- utils/
    |-- app.js
    |-- .env
    |-- package.json