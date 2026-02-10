/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ModelService {
    /**
     * Get model registry (OpenRouter) and selected model IDs for copilot and assistantUi
     * @returns any registry, copilotModelId, assistantUiModelId
     * @throws ApiError
     */
    public static getApiModelSettings(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/model-settings',
        });
    }
    /**
     * Set model for a provider (copilot or assistantUi)
     * @param requestBody
     * @returns any Updated copilotModelId and assistantUiModelId
     * @throws ApiError
     */
    public static postApiModelSettings(
        requestBody?: {
            provider?: 'copilot' | 'assistantUi';
            modelId?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/model-settings',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
