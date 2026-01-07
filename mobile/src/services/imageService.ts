import api from './api';
import {ImagePickerResponse} from 'react-native-image-picker';

export interface ImageUploadResponse {
  imageId: string;
  url: string;
  thumbnailUrl?: string;
}

class ImageService {
  async uploadImage(
    procedureId: string,
    stepId: string,
    image: ImagePickerResponse,
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    
    if (image.assets && image.assets[0]) {
      const asset = image.assets[0];
      formData.append('image', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'image.jpg',
      } as any);
    }

    formData.append('procedureId', procedureId);
    formData.append('stepId', stepId);

    const response = await api.post<ImageUploadResponse>(
      '/images/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  }

  async getImageUrl(imageId: string): Promise<string> {
    const response = await api.get<{url: string}>(`/images/${imageId}/url`);
    return response.data.url;
  }

  async deleteImage(imageId: string): Promise<void> {
    await api.delete(`/images/${imageId}`);
  }
}

export const imageService = new ImageService();

