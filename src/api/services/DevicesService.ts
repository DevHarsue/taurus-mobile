import { BaseApiService } from './BaseApiService';
import type { IDevice, CreateDeviceRequest } from '@app-types/device';

export class DevicesService extends BaseApiService {
  async getAll(): Promise<IDevice[]> {
    return this.get('/api/devices');
  }

  async create(body: CreateDeviceRequest): Promise<IDevice> {
    return this.post('/api/devices', body);
  }

  async remove(id: string): Promise<void> {
    return this.delete(`/api/devices/${id}`);
  }
}
