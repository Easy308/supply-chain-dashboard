import app from './app.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`记账工具 API 服务器运行在 http://localhost:${PORT}`);
});
