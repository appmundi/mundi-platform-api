import { Controller, Get, Post, Body } from "@nestjs/common"
import { FreelancerService } from "./freelancer.service"
import { CreateFreelancerDto } from "./dto/create-freelancer.dto"
import { ResultDto } from "src/dto/result.dto"
import { freelancer_register } from "./entities/freelancer.entity"

@Controller("freelancer")
export class FreelancerController {
    constructor(private readonly freelancerService: FreelancerService) {}

    @Get("searchAll")
    async findAll(): Promise<freelancer_register[]> {
        return this.freelancerService.findAll()
    }

    @Post("register")
    async create(@Body() data: CreateFreelancerDto): Promise<ResultDto> {
        return this.freelancerService.register(data)
    }
}
