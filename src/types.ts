export type Link = {
    code: string;
    url: string;
    createdAt: string;
    clicks: number;
}

export type CreateLinkInput = {
    url: string;
}

export type Result<D, E = string> = 
    | {ok:true;data:D} 
    | {ok:false;error:E}


export type ListQuery = {limit:number};