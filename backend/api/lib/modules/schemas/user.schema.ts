import { Schema, model } from 'mongoose';
import {IUser} from "../models/user.model";

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
});

export default model<IUser>('User', UserSchema)