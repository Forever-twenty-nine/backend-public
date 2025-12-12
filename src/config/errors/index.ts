import load from 'js-yaml';
import fs from 'fs';
import config from '..';

const fileContent = fs.readFileSync(config.DIR_ERRORS, 'utf8');
const errors = load(fileContent) as Record<string, any>;

export default errors;
