import {Schema, model, type Document} from 'mongoose';
export const PROJECT_STATUSES = [
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED"
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface IProject extends Document{
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    image?: {
        url: string;
        key: string;
        alt: string;
   };
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    category?: string;
    featured: boolean;
    displayOrder: number;
    status: ProjectStatus;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
    title : {type: String, required: true, trim: true,minlength: 2, maxlength: 200},
    slug : {type: String, required: true,unique: true,lowercase: true, trim: true,index: true},
    shortDescription: {type: String, required: true, trim: true, maxlength: 300},
    description: {type: String, required: true},
    image: {
        url: {type: String, trim: true},
        key: {type: String, trim: true},
        alt: { type: String, trim: true, maxlength: 200},
   },
    technologies: {type: [String], defualt: []},
    githubUrl: {type: String, trim: true},
    liveUrl: {type: String, trim: true},
    category: {type: String, trim: true, maxlength: 100},
    featured: {type: Boolean, default: false, index: true},
    displayOrder: {type: Number, default: 0, index: true},
    status: {type: String, enum: PROJECT_STATUSES, default: "DRAFT", index: true},
    publishedAt: {type: Date, index: true},
},{
    timestamps: true
});

projectSchema.index({
    status: 1,
    displayOrder: 1
});

projectSchema.index({
    status: 1,
    featured: 1,
});

export const Project = model<IProject>("Project",projectSchema);
