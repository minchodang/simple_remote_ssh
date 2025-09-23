export interface SSHHost {
    name: string;
    host: string;
    user: string;
    port: number;
    keyPath?: string;
    usePassword?: boolean; // Whether to use password (prompted on connection)
    autoCommands?: string[]; // Commands to run automatically after connection
    description?: string;
    tags?: string[];
}

export interface SSHConfig {
    hosts: SSHHost[];
    defaultUser?: string;
    defaultPort?: number;
}

export interface ConnectionOptions {
    user?: string;
    port?: string;
    keyPath?: string;
}
