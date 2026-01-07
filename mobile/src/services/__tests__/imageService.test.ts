import {imageService} from '../imageService';
import api from '../api';

jest.mock('../api');

describe('ImageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      const mockImage = {
        assets: [
          {
            uri: 'file:///path/to/image.jpg',
            type: 'image/jpeg',
            fileName: 'image.jpg',
          },
        ],
      };

      const mockResponse = {
        imageId: 'img-1',
        url: 'https://s3.amazonaws.com/bucket/image.jpg',
        thumbnailUrl: 'https://s3.amazonaws.com/bucket/thumb.jpg',
      };

      (api.post as jest.Mock).mockResolvedValue({data: mockResponse});

      const result = await imageService.uploadImage(
        'proc-1',
        'step-1',
        mockImage as any,
      );

      expect(api.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle missing image assets', async () => {
      const mockImage = {assets: []};

      await expect(
        imageService.uploadImage('proc-1', 'step-1', mockImage as any),
      ).rejects.toBeDefined();
    });
  });

  describe('getImageUrl', () => {
    it('should get image URL', async () => {
      const mockResponse = {url: 'https://s3.amazonaws.com/bucket/image.jpg'};

      (api.get as jest.Mock).mockResolvedValue({data: mockResponse});

      const result = await imageService.getImageUrl('img-1');

      expect(api.get).toHaveBeenCalledWith('/images/img-1/url');
      expect(result).toBe(mockResponse.url);
    });
  });

  describe('deleteImage', () => {
    it('should delete an image', async () => {
      (api.delete as jest.Mock).mockResolvedValue({});

      await imageService.deleteImage('img-1');

      expect(api.delete).toHaveBeenCalledWith('/images/img-1');
    });
  });
});

