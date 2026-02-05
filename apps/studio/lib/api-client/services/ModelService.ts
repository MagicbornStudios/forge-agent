/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ModelService {
    /**
     * Get model router state (active model, mode, registry, preferences, health)
     * @returns any Model settings and health snapshot
     * @throws ApiError
     */
    public static getApiModelSettings(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/model-settings',
        });
    }
    /**
     * Update model preferences (mode, manualModelId, enabledModelIds)
     * @param requestBody
     * @returns any New resolved model and health
     * @throws ApiError
     */
    public static postApiModelSettings(
        requestBody?: {
            mode?: string;
            manualModelId?: string;
            enabledModelIds?: Array<string>;
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
