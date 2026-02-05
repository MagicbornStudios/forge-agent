/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VideoDocsService {
    /**
     * Get video doc by ID
     * @param id
     * @returns any Video doc document
     * @throws ApiError
     */
    public static getApiVideoDocs(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/video-docs/{id}',
            path: {
                'id': id,
            },
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Update video doc
     * @param id
     * @param requestBody
     * @returns any Updated video doc document
     * @throws ApiError
     */
    public static patchApiVideoDocs(
        id: string,
        requestBody?: {
            title?: string;
            doc?: any;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/video-docs/{id}',
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
     * List video docs
     * @returns any List of video doc documents
     * @throws ApiError
     */
    public static getApiVideoDocs1(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/video-docs',
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Create video doc
     * @param requestBody
     * @returns any Created video doc document
     * @throws ApiError
     */
    public static postApiVideoDocs(
        requestBody?: {
            title?: string;
            doc?: any;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/video-docs',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `Server error`,
            },
        });
    }
}
