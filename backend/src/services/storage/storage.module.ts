import { Global, Module } from "@nestjs/common";
import { LocalStorageService } from "@/services/storage/local-storage.service";

@Global()
@Module({
  providers: [LocalStorageService],
  exports: [LocalStorageService],
})
export class StorageModule {}
