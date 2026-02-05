/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GraphsService {
    /**
     * Get graph by ID
     * @param id
     * @returns any Graph document
     * @throws ApiError
     */
    public static getApiGraphs(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/graphs/{id}',
            path: {
                'id': id,
            },
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Update graph
     * @param id
     * @param requestBody
     * @returns any Updated graph document
     * @throws ApiError
     */
    public static patchApiGraphs(
        id: string,
        requestBody?: {
            title?: string;
            flow?: any;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/graphs/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * List graphs
     * @returns any List of forge graph documents
     * @throws ApiError
     */
    public static getApiGraphs1(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/graphs',
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Create graph
     * @param requestBody
     * @returns any Created graph document
     * @throws ApiError
     */
    public static postApiGraphs(
        requestBody?: {
            title?: string;
            flow?: any;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/graphs',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `Server error`,
            },
        });
    }
}
