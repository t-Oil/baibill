export class OrganizationInviteEvent {
  public static readonly NAME = 'organization.invite';

  constructor(
    public readonly email: string,
    public readonly organizationName: string,
    public readonly inviterName: string,
    public readonly roleName: string,
    public readonly inviteLink: string,
  ) {}
}

export class UserWelcomeEvent {
  public static readonly NAME = 'user.welcome';

  constructor(
    public readonly email: string,
    public readonly firstName: string,
  ) {}
}

export class EmailConfirmationEvent {
  public static readonly NAME = 'user.email_confirmation';

  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly link: string,
  ) {}
}
