import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_VERSION = process.env.API_VERSION || '1.0.0';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for our custom API documentation)
app.use(express.static('public'));

// Custom API Documentation route
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/api-docs.html'));
});

// API routes
app.use('/', routes);

// Default route with API documentation link
app.get('/', (req, res) => {
  res.json({
    message: 'Bitespeed Identity Reconciliation Service',
    version: API_VERSION,
    environment: NODE_ENV,
    description: 'Identity reconciliation system for FluxKart.com - linking Dr. Emmett Brown\'s purchases across time!',
    documentation: {
      interactive: req.protocol + '://' + req.get('host') + '/api-docs',
      description: 'Beautiful interactive API documentation with live testing'
    },
    endpoints: {
      identify: 'POST /identify',
      health: 'GET /health',
      test: 'GET /test'
    },
    assignment: {
      github: 'https://github.com/sashank1508/bitespeed-identity-reconciliation',
      author: 'Sashank Pintu',
      submission: 'Bitespeed Backend Assignment'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    availableEndpoints: ['/identify', '/health', '/test', '/api-docs']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Bitespeed Identity Service running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Identify endpoint: http://localhost:${PORT}/identify`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;