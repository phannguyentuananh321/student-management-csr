import { defaultApp } from './app.js';

const PORT = process.env.PORT || 5000;

defaultApp.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api/students`);
});
