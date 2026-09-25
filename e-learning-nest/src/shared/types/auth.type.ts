export enum Type {
    PUBLIC = 'public',
    BEARER = 'bearer',
    API_KEY = 'apiKey',
}

export enum authOptions {
    OR = 'or',
    AND = 'and',
}
export type AuthType = {
    Type: Type[];
    options: authOptions;
}