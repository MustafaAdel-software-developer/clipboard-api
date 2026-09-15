export class AppError extends Error{
    constructor(message:string,readonly status:number,readonly code: string){
        super(message);
        this.name = "AppError";
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Not found"){
        super(message,404,"NOT_FOUND");
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict"){
        super(message,409,"CONFLICT");
    }
}

export class BadRequestError  extends AppError {
    constructor(message = "Bad request"){
        super(message,400,"BAD_REQUEST");
    }
}