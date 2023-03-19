# rental-car-booking
SW Dev Practice Project  
**Group: Powerpuff Girls “Project#7: Rental Car Booking”**

<img src="https://img.freepik.com/free-vector/rental-car-service-abstract-concept-illustration_335657-1846.jpg?w=996&t=st=1679222329~exp=1679222929~hmac=89002a9a06b778c1782aa4a233b3cf82121d898efb8f016552ea64a4cb26736d" width="240">

## Non-Functional Requirements
Security:
- The system shall authenticate users using usernamepassword.
- The system shall be able to keep user’s transactions confidential.

Performance:
- The system shall response to a request in 3 seconds.

Usability:
- The system shall be used and test via Postman.

## Constraints
- The system shall be a web API.
- The frontend part of the application is not required.
- The development team shall develop the backend system as REST APIs.
- The database system can be either MongoDB Atlas or MySQL

## Functional Requirements
1. The system shall allow a user to register by specifying the name, telephone number, email, and
password.
2. After registration, the user becomes a registered user, and the system shall allow the user to log in to
use the system by specifying the email and password. The system shall allow a registered user to log
out.
3. After login, the system shall allow the registered user to book up to 3 cars by specifying the date and
the preferred rental car provider. The rental car provider list is also provided to the user. A rental car
provider information includes the name, address, and telephone number.
4. The system shall allow the registered user to view his/her rental car bookings.
5. The system shall allow the registered user to edit his/her rental car bookings.
6. The system shall allow the registered user to delete his/her rental car bookings.
7. The system shall allow the admin to view any rental car bookings.
8. The system shall allow the admin to edit any rental car bookings.
9. The system shall allow the admin to delete any rental car bookings.
### Additional Requirements
10. The system shall allow the rental car provider to have multiple addresses for pickup and return locations of car.
11. The system shall allow the registered user to specifying pickup and return location of cars for car bookings.
12. The system shall allow the registered user to view available cars to book after specifying pickup and return location.
