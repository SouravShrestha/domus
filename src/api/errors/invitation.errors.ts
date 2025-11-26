export abstract class InvitationError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvitationNotFoundError extends InvitationError {
  readonly code = "INVITATION_NOT_FOUND";

  constructor(invitationId?: string) {
    super(
      invitationId
        ? `Invitation with ID ${invitationId} not found.`
        : "Invitation not found or already processed."
    );
  }
}

export class InvitationAlreadyExistsError extends InvitationError {
  readonly code = "INVITATION_ALREADY_EXISTS";

  constructor() {
    super(
      "An invitation already exists for this phone number and residence."
    );
  }
}

export class MembershipAlreadyExistsError extends InvitationError {
  readonly code = "MEMBERSHIP_ALREADY_EXISTS";

  constructor() {
    super("User is already a member of this residence.");
  }
}

export class InviteCodeGenerationError extends InvitationError {
  readonly code = "INVITE_CODE_GENERATION_ERROR";

  constructor() {
    super("Failed to generate unique invite code. Please try again.");
  }
}

export class InvalidInviteCodeError extends InvitationError {
  readonly code = "INVALID_INVITE_CODE";

  constructor() {
    super("Invite code not found or does not belong to you.");
  }
}
