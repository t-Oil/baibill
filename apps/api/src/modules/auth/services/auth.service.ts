import { ForbiddenException, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { AuthException } from '@exceptions/app/auth.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OauthRepository } from '@repositories/oauth.repository';
import { OauthEntity } from '@entities/oauth.entity';
import { Logger } from '@modules/logger/services/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '@repositories/user.repository';
import { UserEntity } from '@entities/user.entity';
import { IGenerateToken } from '../interfaces/generate-token.interface';
import { LoginRequest } from '../requests/login.request';
import { RefreshLoginRequest } from '../requests/refresh-login.request';
import { RegisterRequest } from '../requests/register.request';
import { UserService } from '@modules/user/services/user.service';
import { MailService } from '@modules/mail/mail.service';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { EmailTemplateType } from '@entities/email-template.entity';

@Injectable()
export class AuthService {
  private readonly jwtAccessSecret: string;
  private readonly jwtAccessExpire: number;
  private readonly jwtRefreshSecret: string;
  private readonly jwtRefreshExpire: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(OauthRepository)
    private readonly oauthRepository: OauthRepository,
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {
    this.jwtAccessSecret = this.configService.get<string>('jwt.access.secret');
    this.jwtAccessExpire = this.configService.get<number>('jwt.access.expire');
    this.jwtRefreshSecret =
      this.configService.get<string>('jwt.refresh.secret');
    this.jwtRefreshExpire =
      this.configService.get<number>('jwt.refresh.expire');
  }

  async login(payload: LoginRequest): Promise<IGenerateToken> {
    try {
      const { username, password } = payload;

      const user: UserEntity =
        await this.userRepository.findOneWithActive({
          where: {
            email: username,
          },
        });

      if (!user) {
        throw new Error('Unauthorized');
      }

      const comparePassword: boolean = await compare(
        password,
        user.password,
      );

      if (!comparePassword) {
        throw new Error('Unauthorized');
      }

      return await this.generateToken(user.id);
    } catch (error) {
      this.logger.error(`${AuthService.name}[LOGIN]`, {
        errors: {
          username: payload.username,
          message: error.message,
        },
      })
      throw AuthException.Unauthorized();
    }
  }

  async register(payload: RegisterRequest): Promise<{ message: string }> {
    await this.userService.register(payload);
    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { confirmationToken: token },
    });

    if (!user) {
      throw new Error('Invalid token');
    }

    if (user.confirmationTokenExpires < new Date()) {
      throw new Error('Token expired');
    }

    user.isActive = ActiveStatusEnum.ACTIVE;
    user.confirmationToken = null;
    user.confirmationTokenExpires = null;

    await this.userRepository.save(user);

    // Send welcome email now? Or just confirm.
    // Maybe send welcome email here since they are now active.
    if (this.mailService.isMailEnabled()) {
      await this.mailService.sendWithTemplate(
        EmailTemplateType.WELCOME,
        { email: user.email, name: user.firstName },
        { firstName: user.firstName }
      ).catch(err => console.error('Failed to send welcome email:', err));
    }

    return { message: 'Email verified successfully' };
  }

  private async generateToken(userId: number): Promise<IGenerateToken> {
    const oAuth: OauthEntity = await this.oauthRepository.store(userId);

    return {
      accessToken: this.jwtService.sign(
        { token: oAuth.token },
        { expiresIn: this.jwtAccessExpire, secret: this.jwtAccessSecret },
      ),
      refreshToken: this.jwtService.sign(
        { token: oAuth.refreshToken },
        { expiresIn: this.jwtRefreshExpire, secret: this.jwtRefreshSecret },
      ),
    };
  }

  async refreshLogin(payload: RefreshLoginRequest): Promise<IGenerateToken> {
    try {
      const { refreshToken } = payload;

      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtRefreshSecret,
      });

      const oAuth: OauthEntity = await this.oauthRepository.findOneOrFail({
        where: {
          refreshToken: decoded.token,
        },
      });

      return await this.generateToken(oAuth.user);
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }
}

