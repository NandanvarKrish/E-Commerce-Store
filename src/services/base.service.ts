import { AppError } from "@/lib/errors";
import type { ApiResponse } from "@/types/common.types";

/**
 * Base service wrapper providing safe execution and standardized API responses.
 */
export abstract class BaseService {
  protected async handleOperation<T>(
    operation: () => Promise<T>,
    errorMessage = "Operation failed"
  ): Promise<ApiResponse<T>> {
    try {
      const data = await operation();
      return {
        success: true,
        data,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }

      const message =
        error instanceof Error ? error.message : errorMessage;

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message,
        },
      };
    }
  }
}
