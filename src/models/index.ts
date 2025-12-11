export * from './mongo';
export * from './enums';
export * from './api-response.model';
export * from './user.model';
export * from './user-public.model';

// Re-export mongoose types
import mongoose from 'mongoose';
export type Connection = mongoose.Connection;
export type DeleteResult = mongoose.mongo.DeleteResult;
export type UpdateResult = mongoose.mongo.UpdateResult;
export type ModifyResult = mongoose.ModifyResult<any>;
export type InsertManyOptions = mongoose.InsertManyOptions;
export type SaveOptions = mongoose.SaveOptions;
export type QueryOptions = mongoose.QueryOptions;
export type PipelineStage = mongoose.PipelineStage;
export type PopulateOptions = mongoose.PopulateOptions;
export type ProjectionType<T> = mongoose.ProjectionType<T>;
export type UpdateQuery<T> = mongoose.UpdateQuery<T>;
export {
  Model,
  Types,
  ObjectId,
  Document,
  Schema,
  Query,
  Aggregate,
} from 'mongoose';
