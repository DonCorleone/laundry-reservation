// Define the ReservationEntry interface to match simplified backend response
export interface IReservation {
  id: string; // Frontend ID - contains the connectionId (datetime-device composite) from backend
  name: string; // Maps to Name
  deviceId: string; // Maps to DeviceId  
  date: string; // Maps to Date (DateTime in ISO string format)
  tenantId?: string; // Maps to TenantId (optional for frontend, will be set by backend)
  createdAt?: string; // Maps to CreatedAt (optional, set by backend)
  updatedAt?: string; // Maps to UpdatedAt (optional, set by backend)
  expiresAt?: string; // Maps to ExpiresAt (optional, set by backend)
}
