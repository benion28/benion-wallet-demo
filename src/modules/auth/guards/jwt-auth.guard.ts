import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly publicRoutes = [
    { method: 'POST', path: '/auth/login' },
    { method: 'POST', path: '/auth/register' },
  ];

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip authentication for public routes
    const isPublic = this.publicRoutes.some(
      route => 
        request.method === route.method && 
        request.path.endsWith(route.path)
    );
    
    if (isPublic) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(
        token,
        { secret: this.configService.get<string>('JWT_SECRET') }
      );
      
      // Attach the user to the request object
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
