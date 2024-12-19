import { ArrayMaxSize, IsAlphanumeric, IsString, IsUrl, Length, MaxLength, Min } from 'class-validator';

interface Subscription {
  @IsString()
  @MaxLength(32)
  name: string;
  @Min(0.005)
  price: number;
  @IsUrl()
  @MaxLength(64)
  img_url: string;
}

export class CreateCreatorDto {
  @IsAlphanumeric()
  token: string;
  @MaxLength(32)
  name: string;
  @ArrayMaxSize(32)
  subscriptions: Subscription[];
}