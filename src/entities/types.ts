
export type Role = 'USER' | 'ADMIN' | 'OWNER'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'
export type User = { id: string; name: string; email: string; password?: string; role: Role; createdAt: string }
export type Category = { id: string; name: string; icon: string }
export type Amenity = { id: string; name: string; icon: string }
export type Listing = { id: string; title: string; city: string; price: number; rating: number; description: string; categoryId: string; amenities: string[]; image: string; isActive: boolean; ownerId: string }
export type Booking = { id: string; listingId: string; userId: string; dateFrom: string; dateTo: string; guests: number; totalPrice: number; status: BookingStatus; createdAt: string }
export type Review = { id: string; listingId: string; userId: string; userName: string; rating: number; comment: string; createdAt: string }
export type Notification = { id: string; userId: string; message: string; isRead: boolean; createdAt: string }
export type AppData = { users: User[]; listings: Listing[]; bookings: Booking[]; reviews: Review[]; notifications: Notification[] }
