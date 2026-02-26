import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../entities/role.entity';


@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    ) {}


}
