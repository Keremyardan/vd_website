import { readFileSync } from 'node:fs';

export default {
  plugins: [{
    name: 'root-advertising-files',
    apply: 'build',
    generateBundle() {
      for (const fileName of ['ads.txt', 'app-ads.txt']) {
        this.emitFile({
          type: 'asset',
          fileName,
          source: readFileSync(new URL(fileName, import.meta.url))
        });
      }
    }
  }]
};
