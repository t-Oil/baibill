import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Logger } from '@modules/logger/services/logger.service';
import {
  RECEIPT_PARSER_SYSTEM_PROMPT,
  RECEIPT_PARSER_PROMPT_VERSION,
  buildReceiptParserPrompt,
} from './prompts/receipt-parser.prompt';

export interface AIReceiptLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productCode?: string | null;
}

export interface AIReceiptResult {
  merchantName: string | null;
  companyTaxId?: string | null;
  companyAddress?: string | null;
  receiptNo?: string | null;
  vatIncluded?: boolean;
  subtotal?: number | null;
  vatAmount?: number | null;
  totalAmount: number | null;
  currency?: string;
  date: string | null;
  lineItems: AIReceiptLineItem[];
  confidence: 'high' | 'medium' | 'low';
}

export interface AIProcessingMetadata {
  promptVersion: string;
  model: string;
  temperature: number;
  ocrTextLength: number;
  timestamp: Date;
}

@Injectable()
export class AiService implements OnModuleInit {
  private client: OpenAI | null = null;
  private enabled: boolean = false;
  private model: string;
  private temperature: number;

  constructor(
    private configService: ConfigService,
    private logger: Logger,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('openai.apiKey');
    this.enabled = this.configService.get<boolean>('openai.enabled') || false;
    this.model = this.configService.get<string>('openai.model') || 'gpt-4o-mini';
    this.temperature = this.configService.get<number>('openai.temperature') || 0.1;

    if (this.enabled) {
      if (!apiKey) {
        this.logger.warn(
          'OpenAI is enabled but OPENAI_API_KEY is not configured. AI parsing will be disabled.',
        );
        this.enabled = false;
        return;
      }

      this.client = new OpenAI({ apiKey });
      this.logger.log(
        `AI Service initialized with model: ${this.model}, temperature: ${this.temperature}`,
      );
    } else {
      this.logger.log('AI Service is disabled (OPENAI_ENABLED=false)');
    }
  }

  /**
   * Check if AI service is available
   */
  isEnabled(): boolean {
    return this.enabled && this.client !== null;
  }

  /**
   * Parse receipt OCR text using OpenAI
   * Returns null if AI is disabled or parsing fails
   *
   * @param ocrText - Raw OCR text from receipt
   * @returns Parsed receipt data or null
   */
  async parseReceiptWithAI(
    ocrText: string,
  ): Promise<{ result: AIReceiptResult | null; metadata: AIProcessingMetadata }> {
    const metadata: AIProcessingMetadata = {
      promptVersion: RECEIPT_PARSER_PROMPT_VERSION,
      model: this.model,
      temperature: this.temperature,
      ocrTextLength: ocrText.length,
      timestamp: new Date(),
    };

    if (!this.isEnabled()) {
      this.logger.debug('AI parsing skipped: service not enabled');
      return { result: null, metadata };
    }

    try {
      this.logger.log(
        `AI parsing receipt (length: ${ocrText.length}, model: ${this.model}, version: ${RECEIPT_PARSER_PROMPT_VERSION})`,
      );

      const completion = await this.client!.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        messages: [
          {
            role: 'system',
            content: RECEIPT_PARSER_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: buildReceiptParserPrompt(ocrText),
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        this.logger.warn('AI returned empty response');
        return { result: null, metadata };
      }

      const parsed = JSON.parse(content) as AIReceiptResult;

      if (typeof parsed !== 'object' || !('confidence' in parsed)) {
        this.logger.warn('AI response missing confidence field');
        return { result: null, metadata };
      }

      if (parsed.confidence === 'low') {
        this.logger.log('AI confidence too low, discarding result');
        return { result: null, metadata };
      }

      this.logger.log(
        `AI parsing successful (confidence: ${parsed.confidence}, merchant: ${!!parsed.merchantName}, total: ${!!parsed.totalAmount}, date: ${!!parsed.date})`,
      );

      return { result: parsed, metadata };
    } catch (error) {
      this.logger.error('AI parsing failed', {
        error: error.message,
        ocrTextLength: ocrText.length,
      });
      return { result: null, metadata };
    }
  }
}
