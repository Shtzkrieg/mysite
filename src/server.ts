import { createServer } from 'vite';
import { getEducationItems } from './api/education';

const server = await createServer({
  server: {
    middlewareMode: true
  }
});

server.middlewares.use('/api/education', async (req, res) => {
  try {
    const items = await getEducationItems();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(items));
  } catch (error) {
    console.error('API Error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to fetch education data' }));
  }
}); 