import { Global, Module } from "@nestjs/common";
import { VisualRegressionService } from "./visual-regression.service";
import { StorageModule } from "@/services/storage/storage.module";

@Global()
@Module({
  imports: [StorageModule],
  providers: [VisualRegressionService],
  exports: [VisualRegressionService],
})
export class VisualRegressionModule {}
