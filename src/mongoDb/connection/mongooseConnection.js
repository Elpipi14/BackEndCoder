import mongoose from 'mongoose';
import configObject from '../../config/config.js';
const { mongo_url } = configObject;


mongoose.connect(mongo_url)
  .then(() => console.log('Connected to MongoDB database'))
  .catch(() => console.log('error connecting mongo'));

