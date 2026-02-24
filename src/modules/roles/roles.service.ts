import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './entities/role.enitity';
import { Model } from 'mongoose';


@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    ) {}


}
