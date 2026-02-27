/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SettingsService {
    /**
     * Get all settings overrides for hydration
     * @returns any List of settings-overrides documents
     * @throws ApiError
     */
    public static getApiSettings(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/settings',
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Upsert settings for a scope
     * @param requestBody
     * @returns any Created or updated settings document
     * @throws ApiError
     */
    public static postApiSettings(
        requestBody?: {
            scope?: 'app' | 'project' | 'workspace' | 'viewport';
            scopeId?: string | null;
            settings?: Record<string, any>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/settings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                500: `Server error`,
            },
        });
    }
}
