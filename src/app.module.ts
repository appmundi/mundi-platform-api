import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MysqlConnection } from './infra/database/mysqlConnection';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
  exports: [MysqlConnection]
})
export class AppModule {}
