import { Injectable, OnModuleInit } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';

/**
 * Service for interacting with Google Cloud Vision API.
 */
@Injectable()
export class GcpVisionService implements OnModuleInit {
  private client: ImageAnnotatorClient;

  /**
   * Initializes the ImageAnnotatorClient using GOOGLE_APPLICATION_CREDENTIALS.
   * @throws Error if GOOGLE_APPLICATION_CREDENTIALS is not set.
   */
  onModuleInit() {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error(
        'GCP Vision API credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS environment variable.',
      );
    }
    this.client = new ImageAnnotatorClient();
  }

  async detectText(imageBuffer: Buffer): Promise<string> {
    const [result] = await this.client.textDetection({
      image: { content: imageBuffer },
    });

    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      throw new Error('No text detected in image');
    }

    return detections[0].description || '';
  }
}
