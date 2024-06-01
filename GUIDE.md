## Service
rabbitmq kong-database kong-migrations kong-gateway kong-setup konga users-db prediction-db pgadmin user-service prediction-service prediction-result-service prediction-interface-service


## docker compose

    docker-compose up -d prediction-db pgadmin user-service
    docker-compose up -d kong-database
    docker-compose up kong-migrations
    docker-compose up -d kong-gateway kong-setup
    docker-compose up -d konga

    docker-compose up -d prediction-db pgadmin user-service rabbitmq prediction-result-service
## kong 
/Register
1. ติดตั้ง Kong และ Konga
2. เข้าสู่ Konga
3. ตั้งค่า Connection กับ Kong
    name: kong
    Kong Admin URL *: http://kong-gateway:8001  ## use service name in docker compose
4. สร้าง Service
    ไปที่ Services ในเมนูหลัก
    คลิกที่ Add New Service
    กรอกข้อมูลต่อไปนี้:
    Name: ตั้งชื่อสำหรับ service เช่น user-service
    Host: ใส่ชื่อ host ของ backend service เช่น user-service
    Port: ใส่ port ที่ backend service ทำงาน (เช่น 3000)
    Protocol: เลือก http (เนื่องจากการเชื่อมต่อกับ backend นั้นใช้ HTTP)
    คลิก Submit เพื่อบันทึกการตั้งค่า
5. สร้าง Route
    คลิกเข้าไปใน service ที่คุณเพิ่งสร้าง (user-service)
    ไปที่แท็บ Routes
    คลิกที่ Add Route
    กรอกข้อมูลต่อไปนี้:
    Paths: เพิ่ม /api/users/register
    Methods: เลือก POST
    คลิก Submit
6. (Optional) เพิ่ม Plugins
    หากต้องการเพิ่มการตั้งค่าเช่น authentication หรือ rate limiting:
    ไปที่ Plugins ในเมนูหลัก
    เลือก service หรือ route ที่ต้องการตั้งค่า plugin
    คลิกที่ Add Plugin
    เลือก plugin ที่ต้องการและตั้งค่าตามความต้องการ
    คลิก Submit

/Login
    cors setup 

    curl -i -X POST http://127.0.0.1:8001/services/{service_name_or_id}/plugins \
    --data "name=cors" \
    --data "config.origins=http://localhost:8005" \
    --data "config.methods=GET, POST, PUT" \
    --data "config.headers=Accept, Authorization, Content-Type" \
    --data "config.credentials=true" \
    --data "config.exposed_headers=Authorization" \
    --data "config.max_age=3600"
