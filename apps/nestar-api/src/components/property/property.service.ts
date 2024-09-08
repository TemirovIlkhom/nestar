import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class PropertyService {
    constructor(@InjectModel('Property') private readonly propertyModel: Model<Property>,
        // private authService: AuthService,
        private viewService: ViewService,
        private memberService: MemberService,
    ) { }

    public async createProperty(input: PropertyInput): Promise<Property> {
        try {
            const result = await this.propertyModel.create(input);
            await this.memberService.memberStatsEditor({
                _id: result.memberId,
                targetKey: 'memberProperties',
                modifier: 1,
            });
            return result;
        } catch (err) {
            console.log("Error Property.Model createProperty:", err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
        const search: T = {
        _id: propertyId, 
        propertyStatus: PropertyStatus.ACTIVE,
    };
        const targetProperty: Property = await this.propertyModel. findOne(search).lean().exec();
        if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND) ;

        if (memberId) {
        const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY };
        const newView = await this.viewService. recordView(viewInput);
        if (newView) {
        await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 }); 
        targetProperty.propertyViews++;
        }

        // meLiked
        }
        
        targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
        return targetProperty;
    }
        public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
        const {_id, targetKey, modifier } = input;
        return await this.propertyModel
        . findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier }},
        {
        new: true,
        },
    )
    .exec();
  }
}