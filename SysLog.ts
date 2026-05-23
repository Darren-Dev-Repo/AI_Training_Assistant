const IS_DEBUG_MODE = process.env.DEBUG === 'true';

export function sysLog(message: string) {
    if (IS_DEBUG_MODE) {
        console.log(message);
    }
}

// 開發者模式: $env:DEBUG="true"; npm start