import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { ViewModule } from '../view/view.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "Member", schema: MemberSchema
      },
    ]),
    AuthModule,
    ViewModule,
  ],
  providers: [MemberResolver, MemberService]
})
export class MemberModule {}
