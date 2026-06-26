import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class OperationItemDto {
    @IsString()
    day: string

    @IsBoolean()
    isActive: boolean

    @IsString()
    openinHours: string

    @IsString()
    closingTime: string
}

export class UpdateOperationsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OperationItemDto)
    operations: OperationItemDto[]
}
