
export enum ExperienceType {
    Career = 'career',
    Project = 'project',
    Freelance = 'freelance',
}

export interface ILink {
    url: string;
    text?: string;
}

export interface IExperience {
    image: string;
    type: ExperienceType;
    title: string;
    start: string;
    end: string;
    links: ILink[];
    description: string[];
    skills: string[];
}

export interface ICareer extends IExperience {
    company: string;
}

export interface IProject extends IExperience {
    genre: string;
    team: string;
}

export interface IFreelance extends IExperience {
    color: string;
}
