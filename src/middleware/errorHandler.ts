import { Request, Response, NextFunction } from 'express';
import APIException from '@/lib/exceptions/APIException';

export default function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('Error:', err);

    if (err instanceof APIException) {
        return res.status(400).json({
            error: err.code,
            message: err.message
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
} 