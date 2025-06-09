import { SetMetadata } from '@nestjs/common';
export const PublicApi = () => SetMetadata('isPublicApi', true);