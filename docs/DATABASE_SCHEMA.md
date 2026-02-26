# Jacksonville Rides - Database Schema

## Collections

### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: Enum['rider', 'driver', 'admin'],
  isActive: Boolean,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  notificationPreferences: {
    email: Boolean,
    sms: Boolean,
    push: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Drivers
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  licenseNumber: String,
  licenseExpiry: Date,
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    color: String,
    plateNumber: String
  },
  status: Enum['pending', 'approved', 'suspended', 'rejected'],
  isAvailable: Boolean,
  rating: Number (0-5),
  totalRides: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicles
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: Enum['sedan', 'suv', 'van', 'luxury'],
  maxPassengers: Number,
  maxLuggage: Number,
  basePrice: Number,
  priceMultiplier: Number,
  imageUrl: String,
  features: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings
```javascript
{
  _id: ObjectId,
  bookingNumber: String (unique, auto-generated),
  riderId: ObjectId (ref: User),
  driverId: ObjectId (ref: Driver),
  vehicleId: ObjectId (ref: Vehicle),
  
  tripType: Enum['one_way', 'round_trip', 'hourly'],
  pickup: {
    address: String,
    lat: Number,
    lng: Number,
    notes: String
  },
  dropoff: {
    address: String,
    lat: Number,
    lng: Number
  },
  scheduledDate: Date,
  scheduledTime: String,
  
  passengers: Number,
  luggage: Number,
  
  isAirportRide: Boolean,
  flightNumber: String,
  meetAndGreet: Boolean,
  
  hours: Number (for hourly trips),
  
  estimatedDistance: Number (miles),
  estimatedDuration: Number (minutes),
  basePrice: Number,
  fees: {
    airportFee: Number,
    meetGreetFee: Number,
    other: Number
  },
  totalPrice: Number,
  
  status: String,
  paymentStatus: Enum['pending', 'paid', 'refunded', 'partial_refund'],
  paymentIntentId: String,
  
  confirmedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Users
- `email` (unique)
- `role`

### Drivers
- `userId` (unique)
- `status`
- `isAvailable`

### Vehicles
- `type`
- `isActive`

### Bookings
- `bookingNumber` (unique)
- `riderId`
- `driverId`
- `status`
- `scheduledDate`
- `createdAt`

## Booking Statuses

```
draft → pending_payment → paid_pending_confirmation → confirmed → 
driver_assigned → en_route → arrived → picked_up → completed

Alternate paths:
- declined
- cancelled_by_rider
- cancelled_by_admin
- no_show
- refunded
- partial_refund
```

## Relationships

- User → Driver (one-to-one, optional)
- User → Booking (one-to-many, as rider)
- Driver → Booking (one-to-many)
- Vehicle → Booking (one-to-many)
