import { Prisma } from "@prisma/client";

export class HttpError extends Error {
    constructor(
        message: string,
        readonly status = 400
    ) {
        super(message);
        this.name = "HttpError";
    }
}

export function jsonError(message: string, status = 400) {
    return Response.json({ error: message }, { status });
}

export function jsonErrorFromUnknown(error: unknown) {
    if (error instanceof HttpError) {
        return jsonError(error.message, error.status);
    }

    if (isTableNotFoundError(error)) {
        return jsonError("Table not found.", 500);
    }

    console.error(error);
    return jsonError("Unexpected server error.", 500);
}

export async function readJson<T>(request: Request) {
    try {
        return (await request.json()) as T;
    } catch {
        return null;
    }
}

export function requireNonEmptyString(
    value: unknown,
    fieldName: string,
    errors: string[]
) {
    if (typeof value !== "string" || value.trim().length === 0) {
        errors.push(`${ fieldName } is required.`);
        return null;
    }

    return value.trim();
}

export function optionalString(value: unknown) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function isTableNotFoundError(error: unknown) {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021"
    );
}
