export interface SSHHost {
    name: string;
    host: string;
    user: string;
    port: number;
    keyPath?: string;
    usePassword?: boolean; // 비밀번호 사용 여부 (연결 시 입력받음)
    autoCommands?: string[]; // 접속 후 자동 실행할 명령어들
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
