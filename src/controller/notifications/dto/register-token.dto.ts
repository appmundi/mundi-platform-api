import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class RegisterTokenDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(512)
    token: string

    @IsNotEmpty()
    @IsIn(["android", "ios"])
    platform: "android" | "ios"

    @IsNotEmpty()
    @IsIn(["user", "entrepreneur"])
    ownerType: "user" | "entrepreneur"

    @IsOptional()
    @IsString()
    @MaxLength(32)
    appVersion?: string
}
