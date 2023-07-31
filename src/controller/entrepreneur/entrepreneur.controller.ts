import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    ValidationPipe,
    UsePipes,
    HttpException,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    Put,
    Delete,
    Param
} from "@nestjs/common"
import { EntrepreneurService } from "./entrepreneur.service"
import { CreateEntrepreneurDto } from "./dto/create-entrepreneur.dto"
import { Entrepreneur } from "./entities/entrepreneur.entity"
import { ResultDto } from "src/dto/result.dto"
import { ValidateDoc } from "../helpers/validate.cpf"
import { ValidatePhone } from "../helpers/validate.phone"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { extname } from "path"

@Controller("entrepreneur")
export class EntrepreneurController {
    constructor(private readonly entrepreneurService: EntrepreneurService) {}

    @UsePipes(ValidationPipe)
    @Post("register")
    async create(@Body() data: CreateEntrepreneurDto): Promise<ResultDto> {
        if (!ValidateDoc(data.doc)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Cpf invalido"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        if (!ValidatePhone(data.phone)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Telefone invalido"
                },
                HttpStatus.BAD_REQUEST
            )
        }
        return this.entrepreneurService.register(data)
    }

    @UseGuards(JwtAuthGuard)
    @Get("searchAll")
    async findAll(): Promise<Entrepreneur[]> {
        return this.entrepreneurService.findAll()
    }

    @Post("upload")
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: "./uploads",
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + "-" + Math.round(Math.random() * 1e9)
                    const ext = extname(file.originalname)
                    const filename = `${uniqueSuffix}${ext}`
                    callback(null, filename)
                }
            })
        })
    )
    handleUpload(@UploadedFile() file: Express.Multer.File) {
        console.log("file", file)
        return "File upload API"
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id")
    async updateUser(
        @Param("id") id: number,
        @Body() updateUserDto: Entrepreneur
    ): Promise<Entrepreneur> {
        return this.entrepreneurService.updateUser(id, updateUserDto)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async deleteUser(@Param("id") id: number): Promise<void> {
        return this.entrepreneurService.deleteUser(id)
    }
}
