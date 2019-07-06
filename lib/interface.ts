import { Document, Schema } from 'mongoose';

export interface Options {
    cascade: boolean;
}

export interface ChildRefDocument extends Document {
    children: Schema.Types.ObjectId[];
}
