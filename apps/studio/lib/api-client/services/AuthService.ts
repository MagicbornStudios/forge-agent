/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Get current user (auth)
     * @returns any User object or null
     * @throws ApiError
     */
    public static getApiMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/me',
            errors: {
                401: `Not authenticated (body has user null)`,
                500: `Server error`,
            },
        });
    }
}
