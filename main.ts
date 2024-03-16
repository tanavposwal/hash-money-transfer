import * as crypto from 'crypto';

const hash = crypto.createHash('sha256');

function hashMe(target: string): string {
    return hash.update(target).digest('hex')
}
