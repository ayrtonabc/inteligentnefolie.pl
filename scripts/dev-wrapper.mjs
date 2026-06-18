
import { spawn } from 'child_process';

const args = process.argv.slice(2);
const hasInspect = args.includes('--inspect');
const otherArgs = args.filter(a => a !== '--inspect');

const env = { ...process.env };
if (hasInspect) {
    console.log('🔍 Debug mode enabled via --inspect');
    env.NODE_OPTIONS = (env.NODE_OPTIONS || '') + ' --inspect';
}

const child = spawn('npx', ['next', 'dev', ...otherArgs], {
    stdio: 'inherit',
    env,
    shell: true
});

child.on('exit', (code) => process.exit(code));
