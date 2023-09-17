import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { Repository } from "typeorm"
import { Modality } from "./entities/modality.entity"
import { WorkService } from "../work/work.service";

@Injectable()
export class ModalityService {
    constructor(
        @Inject("MODALITY_REPOSITORY")
        private modalityRepository: Repository<Modality>,
        private workService: WorkService
    ) { }

    async createModality(
        workId: number,
        price: number,
        duration: number,
        title: string,
    ): Promise<Modality> {
        const modality = new Modality()
        try {
            var work = await this.workService.findWork(workId);
            modality.work = work;
            console.log('Trying to retrive a work')
        } catch (e) {
            console.log('Failed to retrive a work')
        }

        modality.title = title;
        modality.price = price
        modality.duration = duration

        try {
            console.log('Trying to insert a modality')
            return await this.modalityRepository.save(modality);
        } catch (e) {
            console.log('Failed to insert a modality')
        }


    }
}
