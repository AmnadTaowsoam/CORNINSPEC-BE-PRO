# Quality_DBService

# PosgreSQL

## postgres images

    docker pull postgres

    # run images
    docker run --name QualityDB -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -v qualityvolume:/var/lib/postgresql/data -d --restart always postgres

    # install
    sudo apt install postgresql-client
    psql -U postgres -h localhost

# Pgadmin
## run pgadmin in container

    docker run -p 8080:80 \
    -e 'PGADMIN_DEFAULT_EMAIL=qi@qi.com' \
    -e 'PGADMIN_DEFAULT_PASSWORD=password' \
    -d --restart always dpage/pgadmin4


## Run scripts setup database
### 1.Create database
    psql -U postgres -d postgres -h localhost -f "D:/Project_production/Buffer_Project/Quality_DBService/db/migrations/001_create_databases.sql"

### 2.Create table

    # users
    psql -U postgres -d users -h localhost -f "D:\Project_production\Buffer_Project\Quality_DBService\db\seeds\users.sql"

    # cassava
    psql -U postgres -d cassava -h localhost -f /home/qi/quality_project/Quality_DBService/db/seeds/cassava.sql

    # corns
    psql -U postgres -d corns -h localhost -f "D:\Project_production\Buffer_Project\Quality_DBService\db\seeds\corns.sql"

    # qscore
    psql -U postgres -d qscore -h localhost -f /home/qi/quality_project/Quality_DBService/db/seeds/qscore.sql

    # corn_moist
    psql -U postgres -d corns_moist -h localhost -f /home/qi/quality_project/Quality_DBService/db/seeds/corn_moist.sql

# project:
## Build images
    docker build -t quality-db .

## Run images

    docker run --network="host" -p 3000:3000 \
        -e DB_HOST=127.0.0.1 \
        -e DB_USERNAME=postgres \
        -e DB_PASSWORD=password \
        -e USERS_DB_NAME=users \
        -e QSCORE_DB_NAME=qscore \
        -e CASSAVA_DB_NAME=cassava \
        -e CORNS_DB_NAME=corns \
        -e CORNS_MOIST_DB_NAME=corns_moist \
        -e DB_PORT=5432 \
        --name quality-db-container --restart always quality-db

