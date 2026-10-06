import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    message: 'Backend is connected and ready.',
    app: 'PartsPal',
  });
});

app.listen(port, () => {
  console.log(`PartsPal API listening on port ${port}`);
});
