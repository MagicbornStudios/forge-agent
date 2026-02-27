/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorkflowsService {
    /**
     * Run a workflow and stream events over SSE.
     * @param requestBody
     * @returns string SSE event stream
     * @throws ApiError
     */
    public static postApiWorkflowsRun(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/workflows/run',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
