/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiService {
    /**
     * Generate a plan (steps) for a goal using LLM structured output
     * @param requestBody
     * @returns any Plan with steps array
     * @throws ApiError
     */
    public static postApiForgePlan(
        requestBody?: {
            goal?: string;
            graphSummary?: any;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/forge/plan',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request (e.g. goal required)`,
                503: `OpenRouter not configured`,
            },
        });
    }
    /**
     * Generate image from prompt via OpenRouter (image modality)
     * @param requestBody
     * @returns any Base64 data URL of generated image
     * @throws ApiError
     */
    public static postApiImageGenerate(
        requestBody?: {
            prompt?: string;
            aspectRatio?: string;
            imageSize?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/image-generate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `prompt required`,
                503: `OpenRouter not configured`,
            },
        });
    }
    /**
     * Get structured JSON output from prompt using a named or custom schema
     * @param requestBody
     * @returns any Parsed JSON per schema
     * @throws ApiError
     */
    public static postApiStructuredOutput(
        requestBody?: {
            prompt?: string;
            schemaName?: string;
            schema?: Record<string, any>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/structured-output',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `prompt required or invalid schema`,
                503: `OpenRouter not configured`,
            },
        });
    }
}
