import { build } from 'vercel/build';

export const version = 3;

export const buildCommand = {
  cmd: 'pnpm build',
  cwd: 'Frontend'
};

export const devCommand = {
  cwd: 'Frontend'
};

export const outputDirectory = 'Frontend/.next';

export const framework = 'nextjs';
