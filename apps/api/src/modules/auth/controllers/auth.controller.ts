import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ApiResource } from '@commons/responses/api-resource';
import { UseResources } from '@interceptors/use-resources.interceptor';
import { Public } from '@commons/decorators/public.decorator';
import { AuthService } from '@modules/auth/services/auth.service';
import { LoginRequest } from '@modules/auth/requests/login.request';
import { LoginResource } from '@modules/auth/resources/login.resource';
import { RefreshLoginRequest } from '@modules/auth/requests/refresh-login.request';
import { RegisterRequest } from '@modules/auth/requests/register.request';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @UseResources(LoginResource)
  async login(@Body() payload: LoginRequest): Promise<ApiResource> {
    try {
      const response = await this.authService.login(payload);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Post('refresh')
  @UseResources(LoginResource)
  async refresh(@Body() payload: RefreshLoginRequest): Promise<ApiResource> {
    try {
      const response = await this.authService.refreshLogin(payload);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Post('register')
  async register(@Body() payload: RegisterRequest): Promise<ApiResource> {
    try {
      const response = await this.authService.register(payload);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string): Promise<ApiResource> {
    try {
      const response = await this.authService.verifyEmail(token);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }
}
