export interface IDevice {
  id: string;
  deviceCode: string;
  name: string;
  location?: string;
  status: string;
  lastSeenAt?: string;
  createdAt: string;
}

export interface CreateDeviceRequest {
  deviceCode: string;
  name: string;
  location?: string;
}
