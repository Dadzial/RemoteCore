import {Schema, Types} from 'mongoose';

export interface IToken {
    userId: Types.ObjectId;
    createDate: Number;
    type: string;
    value: string;
}