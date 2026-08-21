import {Schema,model, type Document, type Types} from 'mongoose';

export const POST_STATUSES = [
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED',
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export interface IPost extends Document{
    title: string;
    slug: string;
    excerpt: string;
    content: string;

    coverImage ?: {
        url: string;
        key: string;
        alt: string;
    }
    tags: string[];
    category?: string;
    author: Types.ObjectId;
    status: PostStatus;
    publishedAt?: Date;
    seo:{
        title?: string;
        description?: string;
        keywords?: string[];
    };
    readingTimeInMinutes: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    title: {type: String, required: true, trim: true, minlength: 3, maxlength: 200},
    slug: {type:String, required: true, trim:true, lowercase: true,index:true, unique:true},
    excerpt: {type: String, required:true,trim:true, maxlength:500},
    content: {type: String, required:true},
    coverImage:{
        url: {type: String, trim: true},
        key: {type: String, trim: true},
        alt: {type: String, trim: true, maxlength: 200}
    },
    tags:{ type: [String], defualt: [] },
    category: {type: String,trim: true, maxlength: 100},
    author: {type: Schema.Types.ObjectId,ref:"User",required: true, index:true},
    status: {type: String, enum: POST_STATUSES,default:"DRAFT",index:true},
    publishedAt: {type: Date, index:true},
    seo:{
        title:{type: String, trim: true, maxlength: 200},
        description: {type: String, trim: true, maxlength: 320},
        keywords: {type:[String],defualt:[]}
    },
    readingTimeInMinutes: {type: Number,default:1,min:1},
    viewCount: {type:Number,default:0, min:0}
},{
    timestamps: true,
});

postSchema.index({
    status:1,
    publishedAt: -1
});
postSchema.index({
    tags:1,
})

export const Post = model<IPost>("Post",postSchema);