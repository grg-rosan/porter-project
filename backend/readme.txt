4. Real architecture used in Porter 

Typical stack:

Feature	    Technology
Main DB	    PostgreSQL
ORM	        Prisma
Realtime	Socket.io
Cache	    Redis
Queue	    RabbitMQ / Kafka
Location	Redis / Mongo
API	        Node.js



localhost:3000 -----> this is where the server runs

baseURL/api/auth/register -----> register a user "could be a rider or a customer"

after making changes in schema.prisma run:
npx prisma migrate dev --name fix-customer-profile
npx prisma generate  ---ensures updated and correct prisma client is used

baseurl/api/auth/register
register creadentials : 
    name:
    email:
    password:
    role: customer or rider must be caps

baseurl/api/auth/login
login : 
    email:
    password:

    it generates token save it, will need when we need to create order as user;
baseurl/api/customer/create-order
create-order:
    headers
        key: Authorization  value: Bearer token   // must contain word "Bearer"
    body -> raw :
        {
        "pickup_address": { "address": "New Road, Kathmandu", "lat": 27.700769, "lng": 85.300140 },
        "drop_address": { "address": "Lalitpur, Nepal", "lat": 27.664402, "lng": 85.318792 },
        "order_weight": 5,
        "vehicle_type": "BIKE"
        }  // mock data to create order


