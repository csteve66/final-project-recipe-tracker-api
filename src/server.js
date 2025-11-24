import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import ingredientRoutes from "./routes/ingredientRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// These two were missing — ADD THEM
import collectionRoutes from './routes/collectionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());

// ROUTES
app.use("/ingredients", ingredientRoutes);
app.use("/recipes", recipeRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Collections must be mounted here
app.use('/collections', collectionRoutes);

// Reviews MUST be mounted at root so paths inside reviewRoutes work correctly
app.use('/', reviewRoutes);

const openapiSpec = yaml.load('./docs/openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));


// 404 Handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error Handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  if (!err.status) {
    err.status = 500;
    err.message = 'Internal Server Error';
  }
  res.status(err.status).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
