export abstract class ProfileError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DuplicateEmailError extends ProfileError {
  readonly code = "DUPLICATE_EMAIL";

  constructor() {
    super(
      "A profile with this email already exists. Please use a different email address."
    );
  }
}

export class ProfileNotFoundError extends ProfileError {
  readonly code = "PROFILE_NOT_FOUND";

  constructor(id: string) {
    super(`Profile with ID ${id} not found.`);
  }
}

export class ProfileValidationError extends ProfileError {
  readonly code = "VALIDATION_ERROR";

  constructor(message: string) {
    super(message);
  }
}
