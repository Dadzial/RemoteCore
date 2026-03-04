import {Types} from 'mongoose'

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    active?: boolean;
}