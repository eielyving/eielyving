import express from 'express';
import uploadRouter from './api/routes/upload';

const app = express();

// 添加基本的中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加一个健康检查路由
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// API 路由
app.use('/api', uploadRouter);

// 错误处理中间件
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
