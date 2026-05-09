import { Injectable } from "@nestjs/common";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

@Injectable()
export class VisualRegressionService {
  /**
   * Compares two screenshot buffers and returns a diff buffer + score
   */
  async compare(before: Buffer, after: Buffer) {
    const img1 = PNG.sync.read(before);
    const img2 = PNG.sync.read(after);
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const mismatchedPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    const diffScore = mismatchedPixels / (width * height);
    
    return {
      diffBuffer: PNG.sync.write(diff),
      mismatchedPixels,
      diffScore,
      isMatch: diffScore < 0.01, // 1% threshold
    };
  }
}
