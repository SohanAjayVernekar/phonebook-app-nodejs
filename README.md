# PhoneBook — Node.js Backend

Java backend replaced with Node.js + Express + PostgreSQL while keeping the existing Vue frontend API contract.

New isolated containers:
- phonebook-node-postgres — host port 5435
- phonebook-node-backend — internal port 8080
- phonebook-node-frontend — host port 8083

Run:
docker compose up --build -d

Open: http://localhost:8083
Health: http://localhost:8083/api/health
Demo: testuser@example.com / Test@12345

The existing .NET, Python, and Java PhoneBook containers are not referenced by this Compose file.
